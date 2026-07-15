# Stacks

### hasStack
$hasStack: name \dashrightarrow boolean$
Checks if a CloudFormation stack exists.

### getStack
$getStack: name \dashrightarrow stack$
Retrieves information about a CloudFormation stack.

### deployStack
$deployStack: name, template \dashrightarrow stack$
Deploys a CloudFormation template synchronously.

### deployStackAsync
$deployStackAsync: name, template \dashrightarrow \emptyset$
Deploys a CloudFormation template asynchronously.

### deleteStack
$deleteStack: name \dashrightarrow \emptyset$
Deletes a CloudFormation stack.
