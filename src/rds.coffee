import  { spawn } from "node:child_process"
import * as RDS from "@aws-sdk/client-rds"

import { lift, partition } from "./helpers"
import { getAccount } from "./sts"
import { deployStack, deleteStack } from "./stack"

_region = "us-east-1"

AWS =
  RDS: lift RDS

rescueNotFound = ( error ) ->
  if ! ( error.status in [ 400 ] )
    throw error

getClusterARN = ( name, options = {} ) ->
  region = options.region ? _region
  account = options.registryID ? await getAccount()
  "arn:aws:rds:#{ region }:#{ account }:cluster:#{ name }"

# https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/rds/command/DescribeDBClustersCommand/
listClusters = ( options = {}, Marker ) ->
  defaults = 
    MaxRecords: 100

  config = { defaults..., options..., Marker }
  AWS.RDS.describeDBClusters config

listAllClusters = ( options = {} ) ->
  clusters = []
  page = await listClusters options
  clusters.push page.clusters...
  while page.Marker?
    page = await listClusters options, page.Marker
    clusters.push page.DBClusters...
  clusters

# Works on name or full arn. Names are case-insensitive.
getCluster = ( name ) ->
  { DBClusters } = await listClusters
    DBClusterIdentifier: name

  DBClusters[0]

hasCluster = ( name ) -> 
  ( await getCluster name )?

createCluster = ( options ) ->
  AWS.RDS.createDBCluster options

# https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/rds/command/DeleteDBClusterCommand/
deleteCluster = ( name, options = {} ) ->
  defaults =
    DBClusterIdentifier: name
  
  AWS.RDS.deleteDBCluster { defaults..., options... }

createInstance = ( options = {} ) ->
  AWS.RDS.createDBInstance options

# Because I'm not taking the time to comprehensively wrap RDS, this function
# is focused on getting something workable for Gobo.
createGoboCluster = ( name, options = {} ) ->
  if await hasCluster name
    return

  options.DBClusterIdentifier ?= name
  options.Engine ?= "aurora-postgresql"

  # Do we want this to be limitless? It seems possibly expensive
  options.ClusterScalabilityType ?= "standard"

  # Do we want a different naming scheme here?
  options.DatabaseName ?= "gobo"

  # https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_LogAccess.html#USER_LogAccess.Procedural.UploadtoCloudWatch
  options.EnableCloudwatchLogsExports ?= [ "postgresql" ]

  # We can't query the database from AWS Console without this enabled.
  options.EnableHttpEndpoint ?= true

  # "serverless" only applies to Serverless v1. We're aiming to use v2.
  options.EngineMode ?= "provisioned"

  # As of this writing, Postgres 17.0 was recently released, but its Aurora version is still limited to preview.
  options.EngineVersion ?= "16.4"

  # This tells RDS to use SecretsManager to deal with the database's password. We never see it.
  options.ManageMasterUserPassword ?= true

  # I'm trying to keep things simple by setting this to a default. But be careful when expanding
  # to a multiple region or global setup. The default KMS key is region-specific.
  options.MasterUserSecretKmsKeyId ?= undefined

  options.MasterUsername ?= "gobo"

  # Since we want to keep everything private, is there ever a reason to run this a dual stack with IPV6?
  options.NetworkType ?= "IPV4"  

  # Default for Postgres
  options.Port ?= 5432

  # Because we're using serverless v2, we get to articulate the scaling behavior of the
  # cluster in terms of Aurora Capacity Units (ACU). They're abstract units like
  # how DynamoDB uses the RCU and WCU. In this case 1 ACU is roughly equivalent
  # to a database node with 2 GB RAM; CPU and network capacity are matched accordingly.
  options.ServerlessV2ScalingConfiguration ?=
    MinCapacity: 0.5
    MaxCapacity: 4

  options.StorageEncrypted ?= true

  # Because Gobo's workers will be reading and writing a lot, I assume that we
  # want to use the type with price optimizations for heavier I/O. We can change
  # this without consquence, so we're free to falsify this assumption.
  # https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.StorageReliability.html#aurora-storage-type
  options.StorageType = "aurora-iopt1"

  options.Tag ?= []

  options.VpcSecurityGroupIds ?= []

  { DBCluster } = await createCluster options
  DBCluster

createGoboInstance = ( cluster, instance, options = {} ) ->
  options.DBInstanceClass = "db.serverless"
  options.DBClusterIdentifier = cluster
  options.DBInstanceIdentifier = instance
  options.Engine ?= "aurora-postgresql"
  options.EnablePerformanceInsights ?= true 
  options.PubliclyAccessible ?= false
  options.Tags ?= []

  { DBInstance } = await createInstance options
  DBInstance




export {
  getClusterARN
  listClusters
  listAllClusters
  getCluster
  hasCluster  
  createCluster
  deleteCluster

  createGoboCluster
  createGoboInstance
}