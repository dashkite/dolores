# DynamoDB

### wrap
$wrap: value \to object$
Wraps a standard JavaScript value into a DynamoDB AttributeValue object.

### unwrap
$unwrap: object \to value$
Unwraps a DynamoDB AttributeValue object into a standard JavaScript value.

### wrapItem
$wrapItem: object \to item$
Wraps an entire JavaScript object for DynamoDB operations.

### unwrapItem
$unwrapItem: item \to object$
Unwraps an entire DynamoDB item into a standard JavaScript object.

### updateExpression
$updateExpression: object \to string$
Generates a DynamoDB UpdateExpression string from an object.

### expressionAttributeValues
$expressionAttributeValues: object \to map$
Generates ExpressionAttributeValues for DynamoDB queries.

### getTable
$getTable: name \dashrightarrow table$
Retrieves a DynamoDB table description.

### hasTable
$hasTable: name \dashrightarrow boolean$
Checks if a table exists.

### getTableARN
$getTableARN: name \dashrightarrow string$
Gets the ARN for the table.

### createTable
$createTable: input, options \dashrightarrow \emptyset$
Creates a DynamoDB table, optionally enabling Point-In-Time Recovery.

### updateTimeToLive
$updateTimeToLive: options \dashrightarrow \emptyset$
Updates the TTL specification for a table.

### updateTable
$updateTable: options \dashrightarrow \emptyset$
Updates a DynamoDB table's configuration.

### deleteTable
$deleteTable: name \dashrightarrow \emptyset$
Deletes a table if it exists.

### listTables
$listTables: \dashrightarrow iterator$
Returns an asynchronous iterator yielding table names.

### executeStatement
$executeStatement: options \dashrightarrow response$
Executes a raw PartiQL statement against DynamoDB.

### query
$query: statement \dashrightarrow iterator$
Executes a PartiQL statement and yields the unwrapped results.

### getItem
$getItem: table, key \dashrightarrow object$
Retrieves an unwrapped item from a DynamoDB table.

### updateItem
$updateItem: table, key, value \dashrightarrow \emptyset$
Updates an item in a DynamoDB table using wrapped values.

### deleteItem
$deleteItem: table, key \dashrightarrow \emptyset$
Deletes an item from a DynamoDB table.
