import  { spawn } from "node:child_process"
import * as ECR from "@aws-sdk/client-ecr"
import stringArgv from "string-argv"
import * as Val from "@dashkite/joy/value"
import * as Type from "@dashkite/joy/type"
import * as Time from "@dashkite/joy/time"

import { lift, partition } from "./helpers"
import { getAccount } from "./sts"
import { deployStack, deleteStack } from "./stack"

_region = "us-east-1"

AWS =
  ECR: lift ECR

rescueNotFound = ( error ) ->
  if ! ( error.status in [ 400 ] )
    throw error

getRepositoryARN = ( name, options = {} ) ->
  region = options.region ? _region
  account = options.registryID ? await getAccount()
  "arn:aws:ecr:#{ region }:#{ account }:repository/#{ name }"

listRepositories = ( options = {}, nextToken ) ->
  defaults = 
    maxResults: 100

  config = { defaults..., options..., nextToken }
  if config.repositoryNames?
    delete config.maxResults

  AWS.ECR.describeRepositories config

listAllRepositories = ( options = {} ) ->
  repositories = []
  page = await listRepositories options
  repositories.push page.repositories...
  while page.nextToken?
    page = await listRepositories options, page.nextToken
    repositories.push page.repositories...
  repositories

getRepository = ( name ) ->
  try
    { repositories } = await listRepositories
      repositoryNames: [ name ]
    repositories[0]
  catch error
    rescueNotFound error

hasRepository = ( name ) -> 
  ( await getRepository name )?

createRepository = ( name, options = {} ) ->
  defaults = 
    repositoryName: name
    encryptionConfiguration:
      encryptionType: "AES256"
    imageScanningConfiguration: 
      scanOnPush: false
    imageTagMutability: "MUTABLE"

  AWS.ECR.createRepository { defaults..., options... }

deleteRepository = ( name, options = {} ) ->
  defaults =
    repositoryName: name
    force: false
  
  AWS.ECR.deleteRepository { defaults..., options... }

getRepositoryPolicy = ( name, options = {} ) ->
  AWS.ECR.getRepositoryPolicy
    repositoryName: name
    registryId: options.registryID


# Gets a base64 token that allows Docker CLI tools to access an ECR repository.
# This function only works for default account and region.
# Valid for 12 hours.
issueToken = ->
  result = await AWS.ECR.getAuthorizationToken()
  data = result.authorizationData[0]
  token: data.authorizationToken
  expires: data.expiresAt
  endpoint: data.proxyEndpoint

run = ( command, env ) ->
  promise = new Promise ( resolve, reject ) ->
    child = spawn command,
      stdio: "inherit"
      FORCE_COLOR: "2"
      env: env ? process.env
      shell: true

    child.on "close", ( code ) ->
      if code == 0
        resolve()
      else
        reject new Error "child process exited with code #{code}"

    child.on "error", ( error ) ->
      console.error error
      reject error


# TODO: Assumes that you have Docker on this machine. Is this poor form?
# The SDK seems to assume you're using something like Docker to push images
# to the repository.

# TODO: I'm going to punt on persisting the login for the full 12 hours.
# We might want to consider storing that as some kind of optimization.
loginRepository = ( options = {} ) ->
  if !options.token?
    throw new Error "private repository authorization token is not defined."
  account = options.account ? await getAccount()
  region = options.region ? _region

  await run "which aws"
  await run "which docker"

  command = "aws ecr get-login-password --region #{region} |
    docker login #{account}.dkr.ecr.#{region}.amazonaws.com
    --username AWS --password-stdin"
  
  run command


tagImage = ( options ) ->
  account = options.account ? await getAccount()
  region = options.region ? _region
  { image, repository, tag } = options

  run "docker tag #{image} #{account}.dkr.ecr.#{region}.amazonaws.com/#{repository}:#{tag}"

pushImage = ( options ) ->
  account = options.account ? await getAccount()
  region = options.region ? _region
  { repository, tag } = options

  run "docker push #{account}.dkr.ecr.#{region}.amazonaws.com/#{repository}:#{tag}"

# For some reason, I can't find single image deletion. Maybe I'm just missing it.
deleteImages = ( options ) ->
  config =
    repositoryName: options.repository
    imageIds: []

  if options.registryID?
    config.registryId = options.registryID
  
  if options.tags?
    for tag in options.tags
      config.imageIds.push imageTag: tag
  
  if options.digests?
    for digest in options.digests
      config.imageIds.push imageDigest: digest

  AWS.ECR.batchDeleteImage config

listImages = ( options ) ->
  config = 
    repositoryName: options.repository
    maxResults: options.limit ? 100
    
  if options.registryID?
    config.registryId = options.registryID
  
  if options.next?
    config.nextToken = options.next
  
  if options.filter?
    config.filter = options.filter
  
  AWS.ECR.listImages config

listDetailedImages = ( options ) ->
  config = 
    repositoryName: options.repository
    maxResults: options.limit ? 100
    
  if options.registryID?
    config.registryId = options.registryID
  
  if options.next?
    config.nextToken = options.next
  
  if options.filter?
    config.filter = options.filter
  
  AWS.ECR.describeImages config


export {
  getRepositoryARN
  listRepositories
  listAllRepositories
  getRepository
  hasRepository  
  createRepository
  deleteRepository
  getRepositoryPolicy

  shell
  run
  issueToken
  loginRepository
  tagImage
  pushImage
  deleteImages
  listImages
}