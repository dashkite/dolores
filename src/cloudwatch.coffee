import * as CloudWatch from "@aws-sdk/client-cloudwatch-logs"
import { lift, partition } from "./helpers"
import * as It from "@dashkite/joy/iterable"

AWS =
  CloudWatch: lift CloudWatch

tail = ( group ) ->
  # TODO AWS SDK doesn't seem to accept LogGroupName ?!
  streams = await AWS.CloudWatch.describeLogStreams
    LogGroupName: group
    Descending: true
    Limit: 1
    OrderBy: "LastEventTime"

  console.log streams

export { tail }
  


# try {
#     const describeLogStreamsResponse = await cloudwatchlogs.describeLogStreams(params).promise();

#     if (describeLogStreamsResponse.logStreams.length === 0) {
#       console.log(`No log streams found for log group ${logGroupName}`);
#       return;
#     }

#     const latestLogStreamName = describeLogStreamsResponse.logStreams[0].logStreamName;
#     console.log(`Tailing logs from log stream: ${latestLogStreamName}`);

#     // Start streaming logs
#     const params = {
#       logGroupName,
#       logStreamName: latestLogStreamName,
#       startFromHead: true
#     };

#     const logEvents = cloudwatchlogs.getLogEvents(params).createReadStream();

#     logEvents.on('data', (event) => {
#       const logEvent = JSON.parse(event.message);
#       console.log(logEvent.message);
#     });

#     logEvents.on('error', (error) => {
#       console.error(`Error reading log stream: ${error}`);
#     });

#     logEvents.on('end', () => {
#       console.log('Log stream ended.');
#     });
#   } catch (err) {
#     console.error(`Error describing log streams: ${err}`);
#   }
# }