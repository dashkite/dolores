# Technical Notes

This document provides insight into the architecture and underlying concepts of Dolores.

## Sky Architecture and Serverless Computing

Dolores is designed to support the **Sky** architectural approach. Sky is not just an API description; it is an entire architectural methodology predominantly relying on **serverless** cloud computing offerings.

It is important to distinguish the abstract computing concept of [Serverless computing](https://en.wikipedia.org/wiki/Serverless_computing) (lowercase "serverless") from brand names like the "Serverless" framework. Sky architecture is highly prescriptive, focusing strictly on RESTful architectural patterns (see [Representational state transfer](https://en.wikipedia.org/wiki/REST)) and purely serverless offerings. 

By strictly adhering to these constraints, Sky minimizes the number of details that developers need to manage regarding cloud infrastructure state. Consequently, the remaining hard engineering problems are limited primarily to **orchestration**—coordinating the sequence, logic, and data flow between independent serverless functions and managed services.

## API Abstraction for Expressive Orchestration

Dolores serves as a high-level API wrapper around the official `@aws-sdk` libraries to facilitate this orchestration. The primary purpose of Dolores is to make the AWS interface more expressive and compatible with DashKite's compositional style. 

For example, instead of manually instantiating an `ACMClient`, managing pagination tokens, and formatting the exact input parameters for `ListCertificatesCommand`, Dolores provides a simple `hasCertificate("example.com")` interface. Dolores bundles up common AWS patterns and makes them available for reuse, significantly reducing boilerplate.

This pattern follows the [Facade pattern](https://en.wikipedia.org/wiki/Facade_pattern), which provides a simplified interface to a larger body of code, making the subsystem easier to use and reducing dependencies on the inner workings of the complex AWS system.

## Functional Composition and Promises

Dolores is built to take advantage of functional programming patterns, which perfectly complements the orchestration needs of a Sky architecture. This implies that many operations are designed to be chainable or composable. 

### Asynchronous Operations

Because AWS SDK v3 operations are inherently network-bound and asynchronous, nearly all of Dolores' functions return [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

When dealing with functional composition over Promises, developers should remember that they can leverage libraries like **DashKite Joy**, which natively support asynchronous composition. This means you do not always need to explicitly use `await` or `Promise.all` inside functional pipelines; the framework handles the resolution of intermediate Promises.

For a deeper dive into functional composition, see [Function composition (computer science)](https://en.wikipedia.org/wiki/Function_composition_(computer_science)).

## Infrastructure as Code (IaC)

Several Dolores utilities, like `deployStack` and `addSubdomain`, interact heavily with AWS CloudFormation. By generating CloudFormation templates dynamically within the JavaScript code and deploying them, Dolores enables a form of Infrastructure as Code.

Instead of writing static YAML templates, the infrastructure is provisioned programmatically as a side effect of running the Dolores commands. This makes it easier to parameterize and version control infrastructure changes directly alongside application deployment scripts.

To learn more about Infrastructure as Code, refer to [Infrastructure as code](https://en.wikipedia.org/wiki/Infrastructure_as_code).
