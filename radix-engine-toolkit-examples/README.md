# Radix Engine Toolkit Examples

This is a directory of Radix Engine Toolkit examples that show case how various use-cases can be achieved through the Radix Engine Toolkit. All of the examples are provided in five programming languages:

1. C#
2. Kotlin
3. Python
4. Swift

## Order

You can go through the examples in any order you would like. However, the following is the recommended order:

1. [`transaction/construction-of-simple-transaction`](./examples/transactions/construction-of-simple-transaction): This example shows how simple transactions can be created and how ephemeral keys can be used to notarize transactions.
1. [`transaction/construction-of-simple-transaction-string-manifests`](./examples/transactions/construction-of-simple-transaction-string-manifests/): This is identical to the first example with the only difference being that the manifest is created from a string manifest (the contents of the `.rtm` files) instead of using the manifest builder.
1. [`transaction/batch-transfers-from-csv`](./examples/transactions/batch-transfers-from-csv): This example shows how batch transfers can be performed from one account into multiple different accounts of multiple different resources (pretty much a multi-recipient airdrop). This example only shows how to transfer amounts and not non-fungible local ids.
