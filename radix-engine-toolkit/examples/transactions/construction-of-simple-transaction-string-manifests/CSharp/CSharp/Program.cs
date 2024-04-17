// This example shows how a very simple manifest constructed and how a transaction can be built out
// of this manifest. The manifest will not be anything particularly great; just a lock fee that is
// followed by a `DROP_ALL_PROOFS`.

using System.Security.Cryptography;
using RadixEngineToolkit;

internal static class CSharp
{
    private static void Main(string[] _)
    {
        // The network ID to use for this example.
        const byte networkId = 0x02;
        
        // In this example we will use an ephemeral private key for the notary.
        var (privateKey, publicKey, accountAddress) = Utils.NewAccount(
            networkId
        );
        Console.WriteLine(
            $"Ephemeral private key is associated with the account: {accountAddress.AsStr()}"
        );
        
        // Constructing the manifest
        var manifestString = """
             CALL_METHOD
                 Address("component_tdx_2_1cptxxxxxxxxxfaucetxxxxxxxxx000527798379xxxxxxxxxyulkzl")
                 "lock_fee"
                 Decimal("100")
             ;
             DROP_ALL_PROOFS;
             """;
        using var manifest = new TransactionManifest(
            Instructions.FromString(
                manifestString,
                networkId
            ),
            Array.Empty<byte[]>()
        );
        manifest.StaticallyValidate();
        Console.WriteLine($"Constructed manifest: {manifest.Instructions().AsStr()}");
        
        // Constructing the transaction
        var currentEpoch = MockGatewayApiClient.CurrentEpoch();
        using var transaction =
            new TransactionBuilder()
                .Header(
                    new TransactionHeader(
                        networkId,
                        currentEpoch,
                        (currentEpoch + 10),
                        Utils.RandomNonce(),
                        publicKey,
                        false,
                        0
                    )
                )
                .Manifest(
                    manifest
                )
                .Message(
                    new Message.None()
                )
                .NotarizeWithPrivateKey(
                    privateKey
                );
        
        // Printing out the transaction ID and then submitting the transaction to the network.
        using var transactionId = transaction.IntentHash();
        Console.WriteLine(
            $"Transaction ID: {transactionId.AsStr()}"
        );
        
        MockGatewayApiClient.SubmitTransaction(
            transaction
        );
        
        privateKey.Dispose();
    }
}

internal static class Utils
{
    public static uint RandomNonce()
    {
        return (uint)RandomNumberGenerator.GetInt32(int.MaxValue);
    }

    public static Tuple<PrivateKey, PublicKey, Address> NewAccount(byte networkId)
    {
        // Generating bytes through secure random to use for the private key of the account.
        var privateKeyBytes = new byte[32];
        RandomNumberGenerator.Fill(
            privateKeyBytes
        );

        // New private key, derive public key, and derive account address
        var privateKey = PrivateKey.NewSecp256k1(
            privateKeyBytes
        );
        var publicKey = privateKey.PublicKey();
        var accountAddress = Address.VirtualAccountAddressFromPublicKey(
            publicKey,
            networkId
        );

        return new Tuple<PrivateKey, PublicKey, Address>(
            privateKey,
            publicKey,
            accountAddress
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