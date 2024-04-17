// This example shows how batch transfers from one account into multiple accounts can be performed.
// A CSV file is used to keep a log of all of the transfers to perform. The file contains the
// destination address, the address of the resource to send, and the amount of resources to send.
// This example  reads the CSV file, processes it into a transaction manifest, and then constructs a
// transaction from it. 

using System.Security.Cryptography;
using RadixEngineToolkit;
using Decimal = RadixEngineToolkit.Decimal;

internal static class CSharp
{
    private static void Main(string[] _)
    {
        // The network ID to use for this example.
        const byte networkId = 0x02;

        // The private key of the account that the funds will originate from (the sender) is known.
        // A `PrivateKey` object is created out of it and the virtual account component address is
        // derived from it.
        var privateKeyHex = "75cb44add19fb2d07e83feadd537c487e58047ef30406eafb807f638157ca1d7";
        using var privateKey = PrivateKey.NewSecp256k1(Convert.FromHexString(privateKeyHex));
        var publicKey = privateKey.PublicKey();
        using var accountAddress = Address.VirtualAccountAddressFromPublicKey(publicKey, networkId);
        Console.WriteLine($"Account address: {accountAddress.AsStr()}");

        // Reading the CSV file and constructing the manifest from the contents of the file. Note
        // that there are couple of optimizations that could be done here to ensure that the final
        // manifest is more fee-efficient. However, this example aims more at clarity; thus, no
        // optimizations are performed.
        var manifestBuilder = new ManifestBuilder().AccountLockFee(
            accountAddress,
            new Decimal("30")
        );

        var entries = File
            .ReadAllLines("transfers.csv")
            .Select(item => item.Split(","))
            .Select((value, i) => (value, i))
            .Where((_, i) => i != 0);

        // Each row of the CSV file will contribute three instructions to the manifest:
        // - A withdraw from account of the resource address and amount.
        // - A take from worktop of the resource address and amount.
        // - A try_deposit_or_abort of the bucket taken from the worktop.
        foreach (var (entry, i) in entries)
        {
            using var destinationAddress = new Address(entry[0]);
            using var resourceAddress = new Address(entry[1]);
            using var amount = new Decimal(entry[2]);

            manifestBuilder = manifestBuilder
                .AccountWithdraw(
                    accountAddress,
                    resourceAddress,
                    amount
                )
                .TakeFromWorktop(
                    resourceAddress,
                    amount,
                    new ManifestBuilderBucket(i.ToString())
                )
                .AccountTryDepositOrAbort(
                    destinationAddress,
                    new ManifestBuilderBucket(i.ToString()),
                    null
                );
        }

        using var manifest = manifestBuilder.Build(networkId);
        manifest.StaticallyValidate();
        Console.WriteLine(
            $"Constructed manifest: {manifest.Instructions().AsStr()}"
        );

        // Constructing the transaction
        var currentEpoch = MockGatewayApiClient.CurrentEpoch();
        using var transaction =
            new TransactionBuilder()
                .Header(
                    new TransactionHeader(
                        networkId,
                        currentEpoch,
                        currentEpoch + 10,
                        Utils.RandomNonce(),
                        publicKey,
                        true,
                        0
                    )
                )
                .Manifest(manifest)
                .Message(new Message.None())
                .NotarizeWithPrivateKey(privateKey);

        // Printing out the transaction ID and then submitting the transaction to the network.
        using var transactionId = transaction.IntentHash();
        Console.WriteLine(
            $"Transaction ID: {transactionId.AsStr()}"
        );

        MockGatewayApiClient.SubmitTransaction(
            transaction
        );
    }
}

internal static class Utils
{
    public static uint RandomNonce()
    {
        return (uint)RandomNumberGenerator.GetInt32(
            int.MaxValue
        );
    }
}

/// <summary>
///     A mock implementation of a Gateway Client which does not actually make calls to the Gateway
///     API. Instead, it mocks the Gateway's response. In your implementation you should fully
///     implement this.
/// </summary>
internal static class MockGatewayApiClient
{
    public static ulong CurrentEpoch()
    {
        return 100;
    }

    public static void SubmitTransaction(NotarizedTransaction notarizedTransaction)
    {
        var compiledNotarizedTransaction = notarizedTransaction.Compile();
        /* Submit to the Gateway API */
    }
}