import EngineToolkit
import Foundation

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

private func newAccount(networkId: UInt8) -> (PrivateKey, PublicKey, Address) {
    var privateKeyBytes = [UInt8](repeating: 0, count: 32)
    _ = SecRandomCopyBytes(
        kSecRandomDefault,
        32,
        &privateKeyBytes
    )

    let privateKey = try! PrivateKey.newSecp256k1(bytes: privateKeyBytes)
    let publicKey = privateKey.publicKey()
    let accountAddress = try! Address.virtualAccountAddressFromPublicKey(
        publicKey: publicKey,
        networkId: networkId
    )

    return (privateKey, publicKey, accountAddress)
}

func randomNonce() -> UInt32 {
    UInt32.random(in: 0 ... UInt32.max)
}

// The network ID to use for this example.
let networkId: UInt8 = 0x02

// In this example we will use an ephemeral private key for the notary.
let (privateKey, publicKey, accountAddress) = newAccount(networkId: networkId)
print("Ephemeral private key is associated with the account: \(accountAddress.asStr())")

// Constructing the manifest
let manifest = try! ManifestBuilder()
    .faucetLockFee()
    .dropAllProofs()
    .build(networkId: networkId)
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
