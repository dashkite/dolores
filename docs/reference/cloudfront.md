# CloudFront

### list
$list: \dashrightarrow iterator$
Returns an asynchronous iterator that yields CloudFront distributions.

### find
$find: domain \dashrightarrow distribution$
Finds the CloudFront distribution matching the given domain alias.

### addCustomHeader
$addCustomHeader: options \dashrightarrow \emptyset$
Adds a custom header to a distribution's origin.

### invalidatePaths
$invalidatePaths: options \dashrightarrow \emptyset$
Creates an invalidation batch for the specified paths on a distribution matching the domain.

### getDistributionForDomain
$getDistributionForDomain: domain \dashrightarrow distribution$
Gets the specific distribution for a given domain.

### listCachePolicies
$listCachePolicies: \dashrightarrow iterator$
Returns an asynchronous iterator yielding Cache Policies.

### getCachePolicy
$getCachePolicy: name \dashrightarrow policy$
Retrieves a CloudFront cache policy by name.

### listRequestPolicies
$listRequestPolicies: \dashrightarrow iterator$
Returns an asynchronous iterator yielding Request Policies.

### getRequestPolicy
$getRequestPolicy: name \dashrightarrow policy$
Retrieves a Request Policy by name.

### listResponsePolicies
$listResponsePolicies: \dashrightarrow iterator$
Returns an asynchronous iterator yielding Response Policies.

### getResponsePolicy
$getResponsePolicy: name \dashrightarrow policy$
Retrieves a Response Policy by name.
