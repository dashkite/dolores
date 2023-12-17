import * as CloudWatch from "@aws-sdk/client-cloudwatch-logs"
import { lift } from "./helpers"
import * as Time from "@dashkite/joy/time"

AWS =
  CloudWatch: lift CloudWatch

lag = 10000 # allow 10 seconds for logs to catch up

getEvents = ({ start, end, group }) ->
  loop
    { events, nextToken } = await AWS.CloudWatch.filterLogEvents
      logGroupName: group
      startTime: start - lag
      endTime: end - lag
      nextToken: nextToken
    yield event for event in events
    break if !nextToken?

tail = ( group ) ->
  end = Date.now()
  start = end - lag
  loop
    for await event from getEvents { start, end, group }
      yield event 
      # [ start, end ] is an inclusive range
      # so move start past end
      start = end + 1
    await Time.sleep 1000
    end = Date.now()
  



export { tail }