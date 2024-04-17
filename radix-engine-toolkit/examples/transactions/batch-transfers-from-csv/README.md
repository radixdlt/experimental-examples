# Batch Transfers From Csv

This example shows how batch transfers from one account into multiple accounts can be performed. A CSV file is used to keep a log of all of the transfers to perform. The file contains the destination address, the address of the resource to send, and the amount of resources to send. This example reads the CSV file, processes it into a transaction manifest, and then constructs a transaction from it. 

The CSV file containing the resources to transfer has the following format:

```csv
destination_address,resource_address,amount
account_tdx_2_12x50w93rgzgyzxek5y4ku24aa5nn9k0jqzlv5gg7jycwe9jzs26ang,resource_tdx_2_1t4qwvt4v2rkgak9dlm4yxgx5enfk5r0ewqh8z5ywpn667zzrepkrjl,100
account_tdx_2_168e8u653alt59xm8ple6khu6cgce9cfx9mlza6wxf7qs3wwdyqvusn,resource_tdx_2_1t4qwvt4v2rkgak9dlm4yxgx5enfk5r0ewqh8z5ywpn667zzrepkrjl,100
```

The above file specifies that a 100 `resource_tdx_2_1t4qwvt4v2rkgak9dlm4yxgx5enfk5r0ewqh8z5ywpn667zzrepkrjl` is to be sent to `account_tdx_2_12x50w93rgzgyzxek5y4ku24aa5nn9k0jqzlv5gg7jycwe9jzs26ang` and 
`account_tdx_2_168e8u653alt59xm8ple6khu6cgce9cfx9mlza6wxf7qs3wwdyqvusn`. 

The sender is not specified in the CSV file, instead, it's specified in the example files. A Secp256k1 private key is used and the sender account address is derived from it. 


## Running the Examples

All of the examples contain a `run.sh` bash script that runs the example when called.

## Outcomes

After going through this example, you should be able to:

* Derive the public key associated with a private key.
* Derive the virtual account address associated with a public key.
* Generate random nonces to use for transactions.
* Process a CSV file and construct a transaction manifest based on the contents of it.
* Construct manifests and transactions through the Radix Engine Toolkit builders.
* Find the transaction id of transactions prior to submitting them.
* The static validation of transaction manifests prior submission and prior to the construction of transactions.
* Convert addresses to strings and print them.
* Convert manifests to strings and print them.
* Convert transaction hashes to strings and print them.

## Non Goals

* Showing how to code up a Gateway or CoreAPI client. Such clients are simple to write: all they do is make HTTP requests, parse the data, and return it. This is why all of the examples use a Mock Gateway API client with the correct interfaces but no implementation.