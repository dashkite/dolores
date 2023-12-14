import * as CloudWatch from "@aws-sdk/client-cloudwatch-logs"
import { lift } from "./helpers"
import * as Time from "@dashkite/joy/time"

AWS =
  CloudWatch: lift CloudWatch

getEvents = ({ start, end, group }) ->
  loop
    { events, nextToken } = await AWS.CloudWatch.filterLogEvents
      logGroupName: group
      startTime: start
      endTime: end
      nextToken: nextToken
    yield event for event in events
    break if !nextToken?

tail = ( group ) ->
  end = Date.now()
  start = end - 30000 # 30 seconds
  loop
    yield event for await event from getEvents { start, end, group }
    await Time.sleep 1000
    start = end
    end = Date.now()
  



export { tail }