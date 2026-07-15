# Dolores

_AWS utility functions for use with Studio_

[![Hippocratic License HL3-CORE](https://img.shields.io/static/v1?label=Hippocratic%20License&message=HL3-CORE&labelColor=5e2751&color=bc8c3d)](https://firstdonoharm.dev/version/3/0/core.html)

Dolores is a collection of AWS utility functions specifically designed for use with DashKite Studio. It provides a simplified interface for interacting with AWS services including ACM, CloudFront, CloudWatch, DynamoDB, Lambda, Route53, S3, Secrets Manager, SES, SNS, SQS, Stacks, Step Functions, and VPC.

## Features

- Provides simplified API wrappers around AWS SDK v3 client libraries.
- Automates and integrates common provisioning and deployment patterns via `deployStack`.
- Focuses on operational and structural needs for DashKite Studio.
- Utilizes functional composition patterns for asynchronous workflows.

## Installation

```bash
pnpm install @dashkite/dolores
```

## Usage

Dolores exposes utility functions grouped by AWS service. You can import specific utilities and use them to interact with your AWS environment.

```coffeescript
import { hasCertificate, getCertificate } from "@dashkite/dolores/acm"

# Check if a certificate exists for a domain
exists = await hasCertificate "example.com"

# Retrieve the certificate details
cert = await getCertificate "example.com"
```

## Other Resources

- [Reference Documentation](docs/reference.md)
- [Recipes](docs/recipes.md)
- [Technical Notes](docs/technical-notes.md)
- [Testing](docs/testing.md)
