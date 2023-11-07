import * as S3 from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import * as Type from "@dashkite/joy/type"
import { lift, partition } from "./helpers"
import { MediaType } from "@dashkite/media-type"


AWS =
  S3: lift S3

rescueNotFound = (error) ->
  if ! ( error.status in [ 403, 404 ] )
    throw error

hasBucket = (name) ->
  try
    await AWS.S3.headBucket Bucket: name
    true
  catch error
    rescueNotFound error
    false

getBucketARN = (name) ->
  "arn:aws:s3:::#{name}"

putBucket = (name) ->
  if !( await hasBucket name )
    AWS.S3.createBucket Bucket: name

deleteBucket = (name) ->
  if await hasBucket name
    AWS.S3.deleteBucket Bucket: name

getBucketLifecycle = (name) ->
  AWS.S3.getBucketLifecycleConfiguration Bucket: name

putBucketLifecycle = (name, lifecycle) ->
  AWS.S3.putBucketLifecycleConfiguration 
    Bucket: name
    LifecycleConfiguration: lifecycle

deleteBucketLifecycle = (name) ->
  AWS.S3.deleteBucketLifecycle Bucket: name

putBucketPolicy = ( name, policy ) ->
  response = await AWS.S3.putBucketPolicy
    Bucket: name
    Policy: JSON.stringify policy

deleteBucketPolicy = ( name ) ->
  AWS.S3.deleteBucketPolicy Bucket: name

deletePublicAccessBlock = ( name ) ->
  AWS.S3.deletePublicAccessBlock Bucket: name

putBucketWebsite = ( name, { index, error }) ->
  AWS.S3.putBucketWebsite
    Bucket: name
    WebsiteConfiguration:
      IndexDocument: Suffix: index ? "index.html"
      ErrorDocument: Key: error ? "index.html"
      # RoutingRules: rules ? []

putBucketRedirect = ( name, target ) ->
  AWS.S3.putBucketWebsite
    Bucket: name
    WebsiteConfiguration:
      RedirectAllRequestsTo:
        HostName: target

deleteBucketWebsite = ( name ) ->
  await AWS.S3.deleteBucketWebsite

headObject = (name, key) ->
  try
    await AWS.S3.headObject Bucket: name, Key: key
  catch error
    rescueNotFound error
    null

hasObject = (name, key) ->
  if ( await headObject name, key )? then true else false

getObject = (name, key) ->
  try
    { Key, ETag, Body } = await AWS.S3.getObject Bucket: name, Key: key
    key: key
    hash: ETag.replace /"/g, ""
    content: await do ->
      if Type.isString Body
        Body
      else
        result = []
        for await data from Body
          result = [ result..., data... ]
        Uint8Array.from result
  catch error
    console.error error
    rescueNotFound error
    null

putObject = (bucket, key, body) ->

  type = MediaType.format MediaType.fromPath key

  AWS.S3.putObject
    Bucket: bucket
    Key: key
    Body: body
    ContentType: type

deleteObject = (name, key) ->
  if await hasObject name, key
    await AWS.S3.deleteObject Bucket: name, Key: key


deleteObjects = (name, keys) ->
  await AWS.S3.deleteObjects
    Bucket: name
    Delete:
      Objects: ( Key: key for key in keys )
      Quiet: true

# TODO return an async iterator
listObjects = (name, prefix, items=[], token) ->
  parameters = 
    Bucket: name
    MaxKeys: 1000
  parameters.ContinuationToken = token if token?
  parameters.Prefix = prefix if prefix?

  {
    IsTruncated
    Contents
    NextContinuationToken
  } = await AWS.S3.listObjectsV2 parameters

  if Contents?
    items = [ items..., Contents... ]
  if IsTruncated
    await listObjects name, prefix, items, NextContinuationToken
  else
    items

deleteDirectory = (name, prefix) ->
  keys = []
  for object in ( await listObjects name, prefix )
    keys.push object.Key
  
  for batch from partition 1000, keys
    if batch.length > 0 # Is this neccessary?
      await deleteObjects name, batch

emptyBucket = (name) -> deleteDirectory name

getUploadURL = ( name, key, contentType ) ->
  params = { Bucket: name, Key: key }
  if contentType? then params.ContentType = contentType
  putCommand = new S3.PutObjectCommand params
  client = new S3.S3Client region: "us-east-1"
  getSignedUrl client, putCommand

putCORSConfig = ( input ) ->
  AWS.S3.putBucketCors input

export {

  getBucketARN
  hasBucket
  putBucket
  deleteBucket
  deleteDirectory
  emptyBucket

  getBucketLifecycle
  putBucketLifecycle
  deleteBucketLifecycle

  putBucketPolicy
  deleteBucketPolicy
  
  putBucketWebsite
  deleteBucketWebsite
  
  putBucketRedirect

  headObject
  hasObject
  getObject
  putObject
  deleteObject
  deleteObjects
  listObjects

  getUploadURL

  putCORSConfig

  deletePublicAccessBlock

}