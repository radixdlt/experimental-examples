// This example shows how a very simple manifest constructed and how a transaction can be built out
// of this manifest. The manifest will not be anything particularly great; just a lock fee that is
// followed by a `DROP_ALL_PROOFS`.

import com.github.doyaaaaaken.kotlincsv.dsl.csvReader
import com.radixdlt.ret.*
import java.security.SecureRandom

@OptIn(ExperimentalStdlibApi::class, ExperimentalUnsignedTypes::class)
fun main(args: Array<String>) {
    // The network ID to use for this example.
    val networkId: UByte = 0x02u

    // The private key of the account that the funds will originate from (the sender) is known. A
    // `PrivateKey` object is created out of it and the virtual account component address is derived
    // from it.
    val privateKeyHex = "75cb44add19fb2d07e83feadd537c487e58047ef30406eafb807f638157ca1d7"
    val privateKey = PrivateKey.newSecp256k1(privateKeyHex.hexToUByteArray().toList())
    val publicKey = privateKey.publicKey()
    val accountAddress = Address.virtualAccountAddressFromPublicKey(publicKey, networkId)
    println("Account address: ${accountAddress.asStr()}")

    // Reading the CSV file and constructing the manifest from the contents of the file. Note that
    // there are couple of optimizations that could be done here to ensure that the final manifest
    // is more fee-efficient. However, this example aims more at clarity; thus, no optimizations are
    // performed.
    var manifestBuilder = ManifestBuilder().accountLockFee(accountAddress, Decimal("30"))
    csvReader().open("transfers.csv") {
        // Each row of the CSV file will contribute three instructions to the manifest:
        // - A withdrawal from account of the resource address and amount.
        // - A take from worktop of the resource address and amount.
        // - A try_deposit_or_abort of the bucket taken from the worktop.
        readAllWithHeaderAsSequence().withIndex().forEach {
            (index, row): IndexedValue<Map<String, String>> ->
            val destinationAddress = Address(row["destination_address"]!!)
            val resourceAddress = Address(row["resource_address"]!!)
            val amount = Decimal(row["amount"]!!)

            val bucketName = ManifestBuilderBucket(index.toString())

            manifestBuilder =
                manifestBuilder
                    .accountWithdraw(accountAddress, resourceAddress, amount)
                    .takeFromWorktop(resourceAddress, amount, bucketName)
                    .accountTryDepositOrAbort(destinationAddress, bucketName, null)
        }
    }
    val manifest = manifestBuilder.build(networkId)
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
