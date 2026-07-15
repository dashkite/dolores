# Testing

This document describes the testing approach and procedures for the Dolores library.

## What is the general approach to testing?

Dolores employs a scenario-based testing approach. Test scenarios are defined declaratively in `test/scenarios.yaml`, which allows us to cleanly separate the test data from the test logic. 

The test suite validates the integration and data formatting logic of the various AWS service wrappers. For example, it ensures that JavaScript objects are correctly wrapped and unwrapped into DynamoDB attribute values.

The `amen` testing framework is used to execute these scenarios and assert the expected outcomes.

## How do you run the tests?

To run the test suite, you can use the `genie` task runner. Execute the following command from the repository root:

```bash
npx genie test
```

Or, if `genie` is installed locally via your package manager:

```bash
pnpm run test
```

This will run all defined scenarios and output the test results.
