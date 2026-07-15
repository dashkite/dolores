# SQS

### _createQueue
$\_createQueue: name, options \dashrightarrow \emptyset$
Internal method to create an SQS queue.

### getQueueARN
$getQueueARN: name \dashrightarrow string$
Retrieves the ARN for an SQS queue.

### createQueue
$createQueue: name, options \dashrightarrow \emptyset$
Creates a FIFO SQS queue.

### getQueueURL
$getQueueURL: name \dashrightarrow string$
Retrieves the URL for an SQS queue.

### putQueue
$putQueue: name, options \dashrightarrow \emptyset$
Creates a queue if it doesn't exist.

### emptyQueue
$emptyQueue: name \dashrightarrow \emptyset$
Purges an SQS queue.

### deleteQueue
$deleteQueue: name \dashrightarrow \emptyset$
Deletes an SQS queue.

### pushMessage
$pushMessage: name, message, options \dashrightarrow \emptyset$
Pushes a message onto a queue.

### popMessages
$popMessages: name, options \dashrightarrow array$
Pops multiple messages from a queue.

### create
$create: name \dashrightarrow queue$
Creates an SQS queue specifically tailored for SNS event subscriptions.

### push
$push: queue, message \dashrightarrow response$
Sends a message to a queue.

### send
$send: queue, message \dashrightarrow response$
Sends a message to a queue (alias for push).

### pop
$pop: queue \dashrightarrow array$
Receives and removes messages from a queue.

### receive
$receive: queue \dashrightarrow array$
Receives and removes messages from a queue (alias for pop).

### poll
$poll: queue \dashrightarrow array$
Long-polls a queue for messages.

### getARN
$getARN: name \dashrightarrow string$
Retrieves the ARN for an SQS queue.
