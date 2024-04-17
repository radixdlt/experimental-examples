"""
This example shows how a very simple manifest constructed and how a transaction can be built out of 
this manifest. The manifest will not be anything particularly great; just a lock fee that is 
followed by a `DROP_ALL_PROOFS`.
"""

from radix_engine_toolkit import *
from typing import Tuple
import secrets


class MockGatewayApiClient:
    @staticmethod
    def current_epoch() -> int:
        return 100

    @staticmethod
    def submit_transaction(transaction: NotarizedTransaction) -> None:
        _compiled_notarized_transaction = transaction.compile()


def new_account(network_id: int) -> Tuple[PrivateKey, PublicKey, Address]:
    """
    Creates a new random Secp256k1 private key and then derives the public key and the account
    address associated with it
    """
    private_key_bytes: bytes = secrets.randbits(256).to_bytes(32)
    private_key: PrivateKey = PrivateKey.new_secp256k1(list(private_key_bytes))
    public_key: PublicKey = private_key.public_key()
    account: Address = derive_virtual_account_address_from_public_key(
        public_key, network_id
    )
    return (private_key, public_key, account)


def random_nonce() -> int:
    """
    Generates a random secure random number between 0 and 0xFFFFFFFF (u32::MAX)
    """
    return secrets.randbelow(0xFFFFFFFF)


def main() -> None:
    # The network ID to use for this example.
    NETWORK_ID: int = 0x02

    # In this example we will use an ephemeral private key for the notary.
    (private_key, public_key, account_address) = new_account(NETWORK_ID)
    print(
        f"Ephemeral private key is associated with the account: {account_address.as_str()}"
    )

    # Constructing the manifest
    manifest_string: str = """
    CALL_METHOD
        Address("component_tdx_2_1cptxxxxxxxxxfaucetxxxxxxxxx000527798379xxxxxxxxxyulkzl")
        "lock_fee"
        Decimal("100")
    ;
    DROP_ALL_PROOFS;
    """
    manifest: TransactionManifest = TransactionManifest(
        Instructions.from_string(manifest_string, NETWORK_ID),
        []
    )
    manifest.statically_validate()
    print(f"Constructed manifest: {manifest.instructions().as_str()}")

    # Constructing the transaction
    current_epoch: int = MockGatewayApiClient.current_epoch()
    transaction: NotarizedTransaction = (
        TransactionBuilder()
        .header(
            TransactionHeader(
                NETWORK_ID,
                current_epoch,
                current_epoch + 10,
                random_nonce(),
                public_key,
                False,
                0,
            )
        )
        .manifest(manifest)
        .message(Message.NONE())
        .notarize_with_private_key(private_key)
    )

    # Printing out the transaction ID and then submitting the transaction to the
    # network.
    transaction_id: TransactionHash = transaction.intent_hash()
    print(f"Transaction ID: {transaction_id.as_str()}")

    MockGatewayApiClient.submit_transaction(transaction)


if __name__ == "__main__":
    main()
