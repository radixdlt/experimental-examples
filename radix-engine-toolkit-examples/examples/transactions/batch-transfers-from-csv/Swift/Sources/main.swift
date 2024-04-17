import EngineToolkit
import Foundation
import SwiftCSV

// A mock implementation of a Gateway Client which does not actually make calls to the Gateway API.
// Instead, it mocks the Gateway's response. In your implementation you should fully implement this.
class MockGatewayApiClient {
    static func currentEpoch() -> UInt64 {
        100
    }

    static func submitTransaction(transaction: NotarizedTransaction) throws {
        let _ = try transaction.compile()
        /* Submit to the Gateway API */
    }
}

func randomNonce() -> UInt32 {
    UInt32.random(in: 0 ... UInt32.max)
}

// The network ID to use for this example.
let networkId: UInt8 = 0x02

// The private key of the account that the funds will originate from (the sender) is known. A
// `PrivateKey` object is created out of it and the virtual account component address is derived
// from it.
let privateKeyHex = "75cb44add19fb2d07e83feadd537c487e58047ef30406eafb807f638157ca1d7"
let privateKey = try! PrivateKey.newSecp256k1(bytes: Array(privateKeyHex.hexToData()!))
let publicKey = privateKey.publicKey()
let accountAddress = try! Address.virtualAccountAddressFromPublicKey(
    publicKey: publicKey,
    networkId: networkId
)
print("Account address: \(accountAddress.asStr())")

// Reading the CSV file and constructing the manifest from the contents of the file. Note that
// there are couple of optimizations that could be done here to ensure that the final manifest
// is more fee-efficient. However, this example aims more at clarity; thus, no optimizations are
// performed.
var manifestBuilder = try! ManifestBuilder()
    .accountLockFee(accountAddress: accountAddress, amount: Decimal(value: "30"))

let csvFile = try CSV<Named>(url: URL(fileURLWithPath: "transfers.csv"))
for (index, row) in csvFile.rows.enumerated() {
    let destinationAddress = try! Address(address: row["destination_address"]!)
    let resourceAddress = try! Address(address: row["resource_address"]!)
    let amount = try! Decimal(value: row["amount"]!)

    let bucketName = ManifestBuilderBucket(name: String(index))

    // Each row of the CSV file will contribute three instructions to the manifest:
    // - A withdrawal from account of the resource address and amount.
    // - A take from worktop of the resource address and amount.
    // - A try_deposit_or_abort of the bucket taken from the worktop.
    manifestBuilder = try! manifestBuilder
        .accountWithdraw(
            accountAddress: accountAddress,
            resourceAddress: resourceAddress,
            amount: amount
        )
        .takeFromWorktop(
            resourceAddress: resourceAddress,
            amount: amount,
            intoBucket: bucketName
        )
        .accountTryDepositOrAbort(
            accountAddress: destinationAddress,
            bucket: bucketName,
            authorizedDepositorBadge: nil
        )
}
let manifest = manifestBuilder.build(networkId: networkId)
try! manifest.staticallyValidate()
print("Constructed manifest: \(try! manifest.instructions().asStr())")

// Constructing the transaction
let currentEpoch = MockGatewayApiClient.currentEpoch()
let transaction = try! TransactionBuilder()
    .header(header: TransactionHeader(
        networkId: networkId,
        startEpochInclusive: currentEpoch,
        endEpochExclusive: currentEpoch + 10,
        nonce: randomNonce(),
        notaryPublicKey: publicKey,
        notaryIsSignatory: false,
        tipPercentage: 0
    ))
    .manifest(manifest: manifest)
    .message(message: Message.none)
    .notarizeWithPrivateKey(privateKey: privateKey)

// Printing out the transaction ID and then submitting the transaction to the network.
let transactionId = try! transaction.intentHash()
print("Transaction ID: \(transactionId.asStr())")

try! MockGatewayApiClient.submitTransaction(transaction: transaction)
