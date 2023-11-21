import Crypto from "crypto"
import * as Lambda from "@aws-sdk/client-lambda"
import * as S3 from "@aws-sdk/client-s3"
import * as Text from "@dashkite/joy/text"
import * as Time from "@dashkite/joy/time"
import { lift, log } from "./helpers"

AWS =
  Lambda: lift Lambda
  S3: lift S3

md5 = (buffer) ->
  Crypto.createHash('md5').update(buffer).digest("base64")

hasLambda = (name) ->
  try
    await getLambda name
    true
  catch error
    # TODO we should probably also check for an HTTPError instance
    if error.status == 404
      false
    else
      throw error

getLambda = (name) ->
    lambda = await AWS.Lambda.getFunction FunctionName: name
    _: lambda
    arn: lambda.Configuration.FunctionArn
    state: lambda.Configuration.State
    lastStatus: lambda.Configuration.LastUpdateStatus

# AWS added internal state management to Lambda in an effort to improve the performance
# of the invocation cycle. This is a broad helper to wait until the lambda is ready
# to go and accept more changes to its state.
waitForReady = (name) ->
  loop
    { state, lastStatus } = await getLambda name
    if ( state == "Active" ) && ( lastStatus == "Successful" )
      break
    else if state == "Failed"
      throw new Error "Lambda [ #{name} ] State is Failed."
    else if lastStatus == "Failed"
      throw new Error "Lambda [ #{name} ] LastUpdateStatus is Failed."
    else
      await Time.sleep 1000

getLambdaVersion = (name, version) ->
  { Versions }  = await AWS.Lambda.listVersionsByFunction FunctionName: name
  for current in Versions
    if version == Text.parseNumber current.Version
      return
        _: current
        arn: current.FunctionArn
        version: Text.parseNumber currentVersion
  undefined

getLatestLambda = (name) ->
  { Versions }  = await AWS.Lambda.listVersionsByFunction FunctionName: name
  result = undefined
  max = 0
  for current in Versions
    log "lambda", name, "version: #{ current.Version }"
    if current.Version != "$LATEST"
      version = Text.parseNumber current.Version
      if version >= max
        max = version
        result = current
    else
      result = current
  if result?
    _: result
    arn: result.FunctionArn
    version: max

getLatestLambdaARN = (name) -> ( await getLatestLambda name ).arn

getLambdaARN = getLatestLambdaARN

getLambdaUnqualifiedARN = (name) ->
  ( ( ( await getLambdaARN name ).split ":" )[..-2] ).join ":"

defaults =
  bucket: "dolores.dashkite.com"
  role: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  memory: 128 # max size for edge lambdas
  timeout: 5 # max timeout for edge lambdas
  handler: "build/lambda/index.handler"
  runtime: "nodejs18.x"

publishLambda = (name, data, configuration) ->

  { 
    role
    handler
    runtime
    bucket
    memory
    timeout
    environment
    permissions
  } = { defaults..., configuration... }
  _configuration =
    FunctionName: name
    Handler: handler
    Runtime: runtime
    MemorySize: memory
    Timeout: timeout
    TracingConfig: Mode: "PassThrough"
    Role: role

  if environment?
    _configuration.Environment = Variables: environment
  else
    _configuration.Environment = Variables: {}

  if await hasLambda name

    await AWS.Lambda.updateFunctionCode
      FunctionName: name
      Publish: false
      ZipFile: data

    await waitForReady name
    
    await AWS.Lambda.updateFunctionConfiguration _configuration

  else

    await AWS.Lambda.createFunction {
      _configuration...
      Code: ZipFile: data
    }

  await waitForReady name

  if permissions?
    for permission in permissions
      try
        await AWS.Lambda.addPermission permission
      catch error
        # there appears to be no way to get the existing
        # permissions and the only source of 409s is
        # when the resource exists, so :shrug:
        if error.status != 409
          throw error

listVersions = ( name ) ->
  NextToken = undefined
  loop
    { Versions, NextToken } = await AWS.Lambda.listVersionsByFunction FunctionName: name
    for version in Versions
      yield version
    if NextToken? then continue else return

# TODO prune oldest N versions (using listVersions async iterator)

versionLambda = (name) ->
  result = await AWS.Lambda.publishVersion FunctionName: name
  _: result
  arn: result.FunctionArn
  version: Text.parseNumber result.Version

deleteLambda = (name) ->
  AWS.Lambda.deleteFunction FunctionName: name

_invokeLambda = (name, sync, input) ->
  parameters = if input?
    FunctionName: name
    Payload: JSON.stringify input
    InvocationType: if sync then "RequestResponse" else "Event"
  else
    FunctionName: name
    InvocationType: if sync then "RequestResponse" else "Event"

  AWS.Lambda.invoke parameters

invokeLambda = (name, input) -> _invokeLambda name, false, input
syncInvokeLambda = (name, input) -> _invokeLambda name, true, input

hasFunctionURL = ( name ) ->
  try
    await getFunctionURL name
    true
  catch error
    # TODO we should probably also check for an HTTPError instance
    if error.status == 404
      false
    else
      throw error

getFunctionURL = ( name ) ->
  AWS.Lambda.getFunctionUrlConfig FunctionName: name

buildFunctionURLOptions = ({ name, open, streaming, cors }) ->
  FunctionName: name
  AuthType: if open == true 
      "NONE"
    else "AWS_IAM"
  InvokeMode: if streaming == true
      "RESPONSE_STREAM" 
    else "BUFFERED"
  Cors: if cors = true
    AllowCredentials: true
    AllowHeaders: [ "*" ]
    AllowMethods: [ "*" ]
    AllowOrigins: [ "*" ]
    ExposeHeaders: [ "*" ]
    MaxAge: 3600 

createFunctionURL = ( options ) ->
  AWS.Lambda.createFunctionUrlConfig buildFunctionURLOptions options

updateFunctionURL = ( options ) ->
  AWS.Lambda.updateFunctionUrlConfig buildFunctionURLOptions options

export {
  hasLambda
  getLambda
  waitForReady
  getLambdaVersion
  getLatestLambda
  getLatestLambdaARN
  getLambdaARN
  getLambdaUnqualifiedARN
  publishLambda
  versionLambda
  deleteLambda
  invokeLambda
  syncInvokeLambda
  createFunctionURL
  updateFunctionURL
  getFunctionURL
  hasFunctionURL
}
