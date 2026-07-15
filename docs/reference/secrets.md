# Secrets

### parseSecretName
$parseSecretName: name \to object$
Parses a secret name into components.

### hasSecret
$hasSecret: name \dashrightarrow boolean$
Checks if a secret is available.

### getSecret
$getSecret: name \dashrightarrow string$
Retrieves the value of a secret.

### getSecretARN
$getSecretARN: name \dashrightarrow string$
Retrieves the ARN of a secret.

### getWildcardARN
$getWildcardARN: name \dashrightarrow string$
Retrieves a wildcard ARN for a secret.

### getSecretReference
$getSecretReference: name \dashrightarrow string$
Retrieves a formatted secret reference.

### setSecret
$setSecret: name, value \dashrightarrow \emptyset$
Creates or updates a secret.

### deleteSecret
$deleteSecret: name \dashrightarrow \emptyset$
Deletes a secret.
