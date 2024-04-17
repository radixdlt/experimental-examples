// This example shows how a very simple manifest constructed and how a transaction can be built out
// of this manifest. The manifest will not be anything particularly great; just a lock fee that is
// followed by a `DROP_ALL_PROOFS`.

import com.radixdlt.ret.*
import java.security.SecureRandom

fun main(args: Array<String>) {
    // The network ID to use for this example.
    val networkId: UByte = 0x02u

    // In this example we will use an ephemeral private key for the notary.
    val (privateKey, publicKey, accountAddress) = newAccount(networkId)
    println("Ephemeral private key is associated with the account: ${accountAddress.asStr()}")

    // Constructing the manifest
    val manifest = ManifestBuilder().faucetLockFee().dropAllProofs().build(networkId)
    manifest.staticallyValidate()
    println("Constructed manifest: ${manifest.instructions().asStr()}")

    // Constructing the transaction
    val currentEpoch = MockGatewayApiClient.currentEpoch()
    val transaction =
        TransactionBuilder()
            .header(
                TransactionHeader(
                    networkId,
                    currentEpoch.toULong(),
                    (currentEpoch + 10u).toULong(),
                    randomNonce(),
                    publicKey,
                    false,
                    0u))
            .manifest(manifest)
            .message(Message.None)
            .notarizeWithPrivateKey(privateKey)

    // Printing out the transaction ID and then submitting the transaction to the network.
    val transactionId = transaction.intentHash()
    println("Transaction ID: ${transactionId.asStr()}")

    MockGatewayApiClient.submitTransaction(transaction)

    privateKey.destroy()
    manifest.destroy()
    transaction.destroy()
}

@OptIn(ExperimentalUnsignedTypes::class)
fun newAccount(networkId: UByte): Triple<PrivateKey, PublicKey, Address> {
    // Generating bytes through secure random to use for the private key of the account.
    val secureRandom = SecureRandom()
    val bytes = ByteArray(32) { _ -> 0 }
    secureRandom.nextBytes(bytes)

    // New private key, derive public key, and derive account address
    val privateKey = PrivateKey.newSecp256k1(bytes.toUByteArray().toList())
    val publicKey = privateKey.publicKey()
    val accountAddress = Address.virtualAccountAddressFromPublicKey(publicKey, networkId)

    return Triple(privateKey, publicKey, accountAddress)
}

fun randomNonce(): UInt {
    val secureRandom = SecureRandom()
    return secureRandom.nextInt().toUInt()
}

/**
 * A mock implementation of a Gateway Client which does not actually make calls to the Gateway API.
 * Instead, it mocks the Gateway's response. In your implementation you should fully implement this.
 */
class MockGatewayApiClient {
    companion object {
        fun currentEpoch(): UInt {
            return 100u
        }

        fun submitTransaction(transaction: NotarizedTransaction) {
            val compiledNotarizedTransaction = transaction.compile()
            /* Submit to the Gateway API */
        }
    }
}
