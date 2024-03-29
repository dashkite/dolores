import * as DynamoDB from "@aws-sdk/client-dynamodb"
import { lift, partition } from "./helpers"
import { generic } from "@dashkite/joy/generic"
import * as Val from "@dashkite/joy/value"
import * as Type from "@dashkite/joy/type"
import * as Time from "@dashkite/joy/time"

AWS =
  DynamoDB: lift DynamoDB

region = "us-east-1"

wrap = generic name: "wrap"

generic wrap, Type.isUndefined, -> NULL: true
    
generic wrap, Type.isDefined, ( value ) -> N: value.toString()

generic wrap, Type.isObject, ( object ) ->
  M = {}
  ( M[ key ] = wrap value ) for key, value of object
  { M }

generic wrap, Type.isArray, ( array ) ->
  L = []
  ( L.push wrap element ) for element in array
  { L }

generic wrap, Type.isString, ( text ) -> S: text

generic wrap, Type.isBoolean, ( boolean ) -> BOOL: boolean

wrapItem = ( object ) ->
  result = {}
  ( result[ key ] = wrap value ) for key, value of object
  result

unwrap = generic
  name: "unwrap"
  default: (args...) ->
    console.log "unwrap", args...
    throw new Error "unwrap: invalid arguments"

generic unwrap, Type.isUndefined, -> null

generic unwrap, ( Val.eq "NULL" ), Type.isBoolean, -> null

generic unwrap, ( Val.eq "M" ), Type.isObject, ( type, object ) ->
  result = {}
  for key, description of object
    result[ key ] = unwrap description
  result

generic unwrap, ( Val.eq "L" ), Type.isArray, ( type, array ) ->
  ( unwrap description ) for description in array

generic unwrap, ( Val.eq "BOOL" ), Type.isBoolean, ( type, value ) -> value

generic unwrap, ( Val.eq "N" ), Type.isString, ( type, value ) -> Number value

generic unwrap, ( Val.eq "S" ), Type.isString, ( type, value ) -> value

generic unwrap, Type.isObject, ( description ) ->
  [ [ type, value ] ] = Object.entries description
  unwrap type, value

unwrapItem = ( object ) -> unwrap "M", object

updateExpression = ( object ) ->
  "SET " + ( Object.keys object
    .map ( key ) -> "##{key} = :#{key}"
    .join ", " )

expressionAttributeValues = ( object ) ->
  result = {}
  for key, value of wrapItem object
    result[ ":#{key}" ] = value
  result

expressionAttributeNames = ( object ) ->
  result = {}
  for key in Object.keys object
    result[ "##{key}" ] = key
  result

getTable = (name) ->
  try
    { Table } = await AWS.DynamoDB.describeTable TableName: name
    Table
  catch error
    if /ResourceNotFoundException/.test error.toString()
      null
    else
      throw error

hasTable = (name) ->
  if ( await getTable name )?
    true
  else
    false

getTableARN = (name) ->
  "arn:aws:dynamodb:#{region}:*:table/#{name}"

createTable = ( input, { pitr = false } = {}) ->
  await AWS.DynamoDB.createTable input
  if pitr
    loop
      table = await getTable input.TableName
      if table?.TableStatus == "ACTIVE"
        backups = await AWS.DynamoDB.describeContinuousBackups
          TableName: input.TableName
        break if backups.ContinuousBackupsDescription?.ContinuousBackupsStatus == "ENABLED"
      await Time.sleep 500
    AWS.DynamoDB.updateContinuousBackups
      TableName: input.TableName
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true

updateTimeToLive = AWS.DynamoDB.updateTimeToLive

updateTable = AWS.DynamoDB.updateTable

deleteTable = (name) ->
  if await hasTable name
    AWS.DynamoDB.deleteTable TableName: name

listTables = ->
  ExclusiveStartTableName = undefined
  loop
    { TableNames, LastEvaluatedTableName } = await AWS.DynamoDB.listTables { ExclusiveStartTableName }
    yield name for name in TableNames
    if LastEvaluatedTableName?
      ExclusiveStartTableName = LastEvaluatedTableName
    else
      break

executeStatement = AWS.DynamoDB.executeStatement

query = ( query ) ->
  NextToken = undefined
  loop
    { Items, NextToken } = await AWS.DynamoDB.executeStatement {
      Statement: query
      NextToken
    }
    ( yield unwrapItem item ) for item in Items
    if NextToken? then continue else break
  undefined

getItem = ( table, key ) ->
  response = await AWS.DynamoDB.getItem
    TableName: table
    Key: wrapItem key
  if response.$metadata.httpStatusCode == 200
    if response.Item?
      unwrapItem response.Item
  else throw new Error "getItem failed with status 
    #{ response.$metadata.httpStatusCode }"

updateItem = generic name: "updateItem"

generic updateItem, Type.isString, Type.isObject, Type.isObject, ( table, key, value ) ->
  value = do ->
    r = {}
    ( r[ k ] = v ) for k, v of value when !key[k]?
    r
  AWS.DynamoDB.updateItem
    TableName: table
    Key: wrapItem key
    ExpressionAttributeNames: expressionAttributeNames value
    ExpressionAttributeValues: expressionAttributeValues value
    UpdateExpression: updateExpression value

generic updateItem, Type.isObject, ( options ) ->
  AWS.DynamoDB.updateItem options

deleteItem = ( table, key ) ->
  AWS.DynamoDB.deleteItem TableName: table, Key: wrapItem key

export {
  wrap
  unwrap
  wrapItem
  unwrapItem
  updateExpression
  expressionAttributeValues
  getTable
  hasTable
  getTableARN
  createTable
  updateTimeToLive
  updateTable
  deleteTable
  listTables
  executeStatement
  query
  getItem
  deleteItem
  updateItem
}