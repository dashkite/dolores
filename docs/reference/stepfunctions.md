# StepFunctions

### createStepFunction
$createStepFunction: options \dashrightarrow \emptyset$
Creates a Step Function state machine.

### deleteStepFunction
$deleteStepFunction: name \dashrightarrow \emptyset$
Deletes a Step Function state machine.

### getStepFunction
$getStepFunction: name \dashrightarrow machine$
Retrieves a Step Function state machine.

### hasStepFunction
$hasStepFunction: name \dashrightarrow boolean$
Checks if a Step Function state machine exists.

### haltStepFunction
$haltStepFunction: name \dashrightarrow \emptyset$
Stops a running Step Function execution.

### getStepFunctionARN
$getStepFunctionARN: name \dashrightarrow string$
Retrieves the ARN for a Step Function state machine.

### startStepFunction
$startStepFunction: arn, input \dashrightarrow execution$
Starts an execution of a Step Function.
