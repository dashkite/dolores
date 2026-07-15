# Recipes

These recipes demonstrate how to use Dolores to automate common AWS tasks. The examples start with simple retrievals and move to more complex orchestration patterns that are common in serverless architectures.

## Checking for Certificates

In many infrastructure setups, you need to verify if an SSL certificate exists before provisioning resources like CloudFront distributions or API Gateways.

```coffeescript
import { hasCertificate, getCertificateARN } from "@dashkite/dolores/acm"

domain = "api.example.com"

# Check if the certificate exists
if await hasCertificate domain
  arn = await getCertificateARN domain
  console.log "Certificate exists: #{arn}"
else
  console.log "No certificate found for #{domain}"
```

## Managing Secrets

Dolores simplifies interacting with AWS Secrets Manager, making it easy to store and retrieve credentials or API keys.

```coffeescript
import { hasSecret, getSecret, setSecret } from "@dashkite/dolores/secrets"

secretName = "production-database-password"

# Set a new secret if it doesn't exist
unless await hasSecret secretName
  await setSecret secretName, "super-secure-password"

# Retrieve the secret
password = await getSecret secretName
console.log "Retrieved secret successfully."
```

## Querying DynamoDB without Managing Types

Dolores's DynamoDB module automatically wraps and unwraps DynamoDB's verbose `AttributeValue` objects, allowing you to deal with standard JavaScript objects.

```coffeescript
import { query } from "@dashkite/dolores/dynamodb"

statement = "SELECT * FROM Users WHERE role = 'admin'"

# query returns an asynchronous iterator of unwrapped objects
for await user from query statement
  console.log "Admin User: #{user.name}"
```

## Orchestrating CloudFront Invalidations

When you upload new static assets to S3, you often need to invalidate the CloudFront cache. Dolores reduces this orchestration to a single function call, abstracting away the complex parameters typically required by the AWS SDK.

```coffeescript
import { invalidatePaths } from "@dashkite/dolores/cloudfront"

domain = "assets.example.com"
paths = [ "/index.html", "/app.js" ]

try
  await invalidatePaths { domain, paths }
  console.log "Invalidation batch created for #{domain}"
catch error
  console.error "Failed to invalidate:", error
```

## Provisioning Subdomains

Dolores allows you to declare infrastructure as code within your deployment scripts. For example, you can deploy a CloudFormation stack to configure Route53 records dynamically.

```coffeescript
import { addSubdomain } from "@dashkite/dolores/route53"

# Points api.example.com to a CloudFront distribution
await addSubdomain "api.example.com", "d1234567890.cloudfront.net"
```

## Composing Orchestration Workflows

By minimizing the focus on cloud infrastructure state and leaning on purely serverless offerings, your main concern becomes orchestration. Dolores relies on Promises, which are easily composable. 

```coffeescript
import { hasCertificate } from "@dashkite/dolores/acm"
import { addSubdomain } from "@dashkite/dolores/route53"

domain = "blog.example.com"
target = "d0987654321.cloudfront.net"

# We orchestrate the sequence: check certificate, then map domain.
if await hasCertificate domain
  console.log "Certificate verified, mapping domain..."
  await addSubdomain domain, target
else
  console.log "Cannot map domain: Please request a certificate in ACM first."
```
