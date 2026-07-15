# Route53

### getHostedZone
$getHostedZone: domain \dashrightarrow zone$
Retrieves the Route53 hosted zone for the domain.

### getHostedZoneID
$getHostedZoneID: domain \dashrightarrow string$
Retrieves the ID of the Route53 hosted zone for the domain.

### addSubdomain
$addSubdomain: domain, target \dashrightarrow \emptyset$
Creates an A record aliasing a subdomain to a specific target via a CloudFormation stack.
