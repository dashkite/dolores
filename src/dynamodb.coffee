import * as DynamoDB from "@aws-sdk/client-dynamodb"
import { lift, partition } from "./helpers"
import { generic } from "@dashkite/joy/generic"
import * as Value from "@dashkite/joy/value"
import * as Type from "@dashkite/joy/type"

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

wrapItem = ( object ) -> ( wrap object ).M

unwrap = generic name: "unwrap"

generic unwrap, Type.isObject, ( object ) ->
  result = {}
  ( result[ key ] = unwrap key, description ) for key, description of object
  result

generic unwrap, Type.isString, Type.isObject, ( key, description ) ->
  [ [ type, value ] ] = Object.entries description
  unwrap key, type, value

generic unwrap, Type.isString, Type.isString, (-> true), ( key, type, value ) ->
  switch type
    when "S", "BOOL" then value
    when "N" then Number value
    when "NULL" then null
    else throw new Error "Unable to map DynamoDB attribute type: #{type}"

generic unwrap, Type.isString, Type.isString, Type.isArray, ( key, type, value ) ->
  result = []
  ( result.push unwrap key, description ) for key, description of object
  result

generic unwrap, Type.isString, Type.isString, Type.isObject, ( key, type, value ) ->
  result = {}
  ( result[ key ] = unwrap key, description ) for key, description of object
  result

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

createTable = (configuration) ->
  AWS.DynamoDB.createTable configuration

updateTable = (configuration) ->
  AWS.DynamoDB.updateTable configuration

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

query = ( query ) ->
  NextToken = undefined
  loop
    { Items, NextToken } = await AWS.DynamoDB.executeStatement {
      Statement: query
      NextToken
    }
    yield item for item in Items
    if NextToken? then continue else break

getItem = ( table, key ) ->
  AWS.DynamoDB.getItem { TableName: table, options... }

updateItem = ( table, key, value ) ->
  value = do ->
    r = {}
    ( r[ k ] = v ) for k, v of value when !key[k]?
    r

  console.log "updateItem",
    TableName: table
    Key: wrapItem key
    ExpressionAttributeNames: expressionAttributeNames value
    ExpressionAttributeValues: expressionAttributeValues value
    UpdateExpression: updateExpression value
  AWS.DynamoDB.updateItem
    TableName: table
    Key: wrapItem key
    ExpressionAttributeNames: expressionAttributeNames value
    ExpressionAttributeValues: expressionAttributeValues value
    UpdateExpression: updateExpression value

deleteItem = ( table, key ) ->
  AWS.DynamoDB.deleteItem TableName: table, Key: key

export {
  wrap
  unwrap
  wrapItem
  updateExpression
  expressionAttributeValues
  getTable
  hasTable
  getTableARN
  createTable
  updateTable
  deleteTable
  listTables
  query
  getItem
  deleteItem
  updateItem
}