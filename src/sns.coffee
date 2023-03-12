import { lift } from "./helpers"
import * as SNS from "@aws-sdk/client-sns"

AWS =
  SNS: lift SNS

# also works as get
create = ( topic ) ->
  { TopicArn } = await AWS.SNS.createTopic
    Name: "#{ topic }"
  name: topic
  arn: TopicArn

remove = ( topic ) ->


publish = ( topic, message ) ->
  await AWS.SNS.publish
    TopicArn: topic.arn
    Message: message
    # MessageGroupId: "default"
    # MessageDeduplicationId: performance.now()
  message

subscribe = ( topic, queue ) ->
  await AWS.SNS.subscribe
    TopicArn: topic.arn
    Protocol: "sqs"
    Endpoint: queue.arn

export { 
  create
  publish
  subscribe
}