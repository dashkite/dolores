import { lift } from "./helpers"
import * as SNS from "@aws-sdk/client-sns"

AWS =
  SNS: lift SNS

# also works as get
create = get = ( topic ) ->
  { TopicArn } = await AWS.SNS.createTopic Name: "#{ topic }"
  name: topic
  arn: TopicArn

remove = ( topic ) ->

publish = ( topic, message ) ->
  { MessageId } = await AWS.SNS.publish
    TopicArn: topic.arn
    Message: JSON.stringify message
  id: MessageId

subscribe = ( topic, queue ) ->
  { SubscriptionArn } = await AWS.SNS.subscribe
    TopicArn: topic.arn
    Protocol: "sqs"
    Endpoint: queue.arn
    Attributes:
      RawMessageDelivery: true
  arn: SubscriptionArn

export { 
  get
  create
  publish
  subscribe
}