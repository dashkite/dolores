import * as SQS from "@aws-sdk/client-sqs"
import * as STS from "@aws-sdk/client-sts"
import * as Obj from "@dashkite/joy/object"
import * as Type from "@dashkite/joy/type"
import { lift } from "./helpers"

createStepFunction = ({ name, dictionary, resources, description }) ->

cache =
  account: null

AWS =
  SQS: lift SQS
  STS: lift STS

region = "us-east-1"

getAccount = ->
  cache.account ?= ( await AWS.STS.getCallerIdentity() ).Account

getQueueARN = (name) ->
  account = await getAccount()
  "arn:aws:sqs:#{region}:#{account}:#{name}.fifo"

_createQueue = (name, options) ->
  AWS.SQS.createQueue
    QueueName: name
    Attributes: options

# Dolores will be opinionated and always assume a FIFO queue.
createQueue = (name, options = {}) ->
  name = "#{name}.fifo"
  defaults = 
    FifoQueue: true
    ReceiveMessageWaitTimeSeconds: 20
    # ContentBasedDeduplication: true

  _createQueue name, Obj.merge defaults, options

# Dolores will be opinionated and always assume a FIFO queue.
getQueueURL = (name) ->
  name = "#{name}.fifo"
  try
    { QueueUrl } = await AWS.SQS.getQueueUrl QueueName: name
    QueueUrl
  catch error
    if /AWS\.SimpleQueueService\.NonExistentQueue/.test error.toString()
      null
    else
      throw error

# For now, this will be idempotent. Some aspects of queues cannot be updated
#   and require a delete-create cycle (~60s) to perform an effective update.
putQueue = (name, options) ->
  if !( await getQueueURL name )?
    await createQueue name, options

# AWS indicates this can take 60 seconds to complete.
emptyQueue = (name) ->
  if ( url = await getQueueURL name )?
    await AWS.SQS.purgeQueue QueueUrl: url

# AWS indicates this can take 60 seconds to complete.
deleteQueue = (name) ->
  if ( url = await getQueueURL name )?
    await AWS.SQS.deleteQueue QueueUrl: url

pushMessage = (name, message, options) ->
  if !(Type.isString message) || ( message.length == 0 )
    throw new Error "dolores:queue: message must be a string with
      minimum length 1."

  defaults =
    MessageGroupId: "DefaultMessageGroupID"

  if ( url = await getQueueURL name )?
    await AWS.SQS.sendMessage Obj.merge defaults, options,
      MessageBody: message
      QueueUrl: url
  else
    throw new Error "dolores:queue: the queue #{name} is not available"

_receieveMessages = (url, options) ->
  defaults = 
    AttributeNames: [ "All" ]
    MessageAttributeNames: [ "All" ]

  { Messages } = await AWS.SQS.receiveMessage Obj.merge defaults, options,
    QueueUrl: url

  Messages

_deleteMessage = (url, handle) ->
  AWS.SQS.deleteMessage
    QueueUrl: url
    ReceiptHandle: handle

_deleteMessages = (url, handles) ->
  AWS.SQS.deleteMessageBatch
    QueueUrl: url
    Entries: do ->
      for handle, index in handles
        Id: "#{index}"
        ReceiptHandle: handle

popMessages = (name, options) ->
  if ( url = await getQueueURL name )?
    _messages = await _receieveMessages url, options
    _messages ?= []
    handles = []
    messages = []
    
    for { ReceiptHandle, Body } in _messages
      handles.push ReceiptHandle
      messages.push Body
    
    if handles.length > 0
      await _deleteMessages url, handles
    
    messages

  else
    throw new Error "dolores:queue: the queue #{name} is not available"

# TODO: handle the batch versions of these operations...


# this is sort of an emerging alternative API for this

create = ( name ) ->
  account = await getAccount()
  arn = "arn:aws:sqs:#{region}:#{account}:#{name}"
  { QueueUrl } = await AWS.SQS.createQueue
    QueueName: "#{ name }"
    # allow SNS to send messages by default

    # TODO AWS recommends specifying the topic
    # Ex:
    #   Condition:
    #     ArnLike:
    #       "aws:SourceArn": "arn:aws:sns:..."
    # but that would require:
    # - getting the queue attributes
    # - adding a policy for the topic
    # - updating the queue attributes
    # on each subscription.
    # Not sure it's worth it, given that the
    # publish request must already be from
    # AWS (due the Principal constraint).

    Attributes:
      SqsManagedSseEnabled: false
      Policy: JSON.stringify
        Version: "2012-10-17"
        Statement: [
          Effect: "Allow"
          Principal: Service: [ "sns.amazonaws.com" ]
          Action: [ "SQS:SendMessage" ]
          Resource: "#{ arn }"
        ]    
  name: name
  url: QueueUrl
  arn: arn

# {
#   "Version": "2012-10-17",
#   "Statement": [
#     {
#       "Effect": "Allow",
#       "Principal": {
#         "Service": "sns.amazonaws.com"
#       },
#       "Action": "*"
#     },
#     {
#       "Sid": "topic-subscription-arn:aws:sns:us-east-1:618441030511:test-topic-sns",
#       "Effect": "Allow",
#       "Principal": {
#         "AWS": "*"
#       },
#       "Action": "SQS:SendMessage",
#       "Resource": "arn:aws:sqs:us-east-1:618441030511:test-queue-sns",
#       "Condition": {
#         "ArnLike": {
#           "aws:SourceArn": "arn:aws:sns:us-east-1:618441030511:test-topic-sns"
#         }
#       }
#     }
#   ]
# }

_receive = ( queue, options = {}) ->
  { Messages } = await AWS.SQS.receiveMessage {
    AttributeNames: [ "All" ]
    MessageAttributeNames: [ "All" ]
    QueueUrl: queue.url
    options...
  }
  messages = []
  if Messages?
    handles = []
    for { MessageId, ReceiptHandle, Body } in Messages
      handles.push ReceiptHandle
      messages.push
        id: MessageId
        content: JSON.parse Body
    remove queue, handles
  messages

push = send = ( queue, message ) ->
  { MessageId } = await AWS.SQS.sendMessage
    MessageBody: JSON.stringify message
    QueueUrl: queue.url
  id: MessageId

pop = receive = ( queue ) -> _receive queue

poll = ( queue ) ->
  _receive queue,
    WaitTimeSeconds: 20      # max allowed
    MaxNumberOfMessages: 10  # max allowed

remove = ( queue, handles ) ->
  AWS.SQS.deleteMessageBatch
    QueueUrl: queue.url
    Entries: do ->
      for handle, index in handles
        Id: "#{ index }"
        ReceiptHandle: handle

getARN = ( name ) ->
  account = await getAccount()
  "arn:aws:sqs:#{region}:#{account}:#{name}"

export {
  _createQueue
  getQueueARN
  createQueue
  getQueueURL
  putQueue
  emptyQueue
  deleteQueue
  pushMessage
  popMessages

  create
  push
  send
  pop
  receive
  poll
  getARN
}