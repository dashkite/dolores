# Dolores

[![Hippocratic License HL3-CORE](https://img.shields.io/static/v1?label=Hippocratic%20License&message=HL3-CORE&labelColor=5e2751&color=bc8c3d)](https://firstdonoharm.dev/version/3/0/core.html)

_AWS utility functions for use with Studio_

## API

### ACM

#### hasCertificate

_hasCertificate domain ⇢ boolean_

#### getCerticate

_hasCertificate domain ⇢ certificate-description_

### Route53

#### getHostedZone

_getHostedZone domain ⇢ zone-description_

### Lambda

#### hasLambda

#### getLambda

#### getLambdaVersion

#### getLambdaLatest

#### publishLambda

#### versionLambda

### Stacks

#### hasStack

#### getStack

#### deployStack

### Secrets

#### hasSecret

_hasSecret name ⇢ boolean_

#### getSecret

_getSecret name ⇢ value_

#### setSecret

_setSecret name, value_

