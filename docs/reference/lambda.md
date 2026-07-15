# Lambda

### hasLambda
$hasLambda: name \dashrightarrow boolean$
Checks if a lambda function exists.

### getLambda
$getLambda: name \dashrightarrow lambda$
Retrieves details for a given lambda function.

### waitForReady
$waitForReady: name \dashrightarrow \emptyset$
Waits until a lambda function's state is Active.

### getLambdaVersion
$getLambdaVersion: name \dashrightarrow string$
Gets the current version of the lambda function.

### getLatestLambda
$getLatestLambda: name \dashrightarrow lambda$
Retrieves the latest version of a lambda.

### getLatestLambdaARN
$getLatestLambdaARN: name \dashrightarrow string$
Gets the ARN of the latest lambda version.

### getLambdaARN
$getLambdaARN: name \dashrightarrow string$
Gets the ARN of the lambda function.

### getLambdaUnqualifiedARN
$getLambdaUnqualifiedARN: name \dashrightarrow string$
Gets the unqualified ARN of a lambda.

### publishLambda
$publishLambda: name \dashrightarrow string$
Publishes a new version of the lambda.

### versionLambda
$versionLambda: name \dashrightarrow string$
Creates and returns a new version alias for the lambda.

### deleteLambda
$deleteLambda: name \dashrightarrow \emptyset$
Deletes a lambda function.

### invokeLambda
$invokeLambda: name, payload \dashrightarrow response$
Asynchronously invokes a lambda function.

### syncInvokeLambda
$syncInvokeLambda: name, payload \dashrightarrow response$
Synchronously invokes a lambda function.

### createFunctionURL
$createFunctionURL: name \dashrightarrow string$
Creates a function URL for a lambda.

### updateFunctionURL
$updateFunctionURL: name, config \dashrightarrow \emptyset$
Updates the function URL configuration.

### getFunctionURL
$getFunctionURL: name \dashrightarrow string$
Gets the lambda's function URL.

### hasFunctionURL
$hasFunctionURL: name \dashrightarrow boolean$
Checks if a lambda has a function URL.
