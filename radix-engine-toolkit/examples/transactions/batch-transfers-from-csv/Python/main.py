"""
This example shows how batch transfers from one account into multiple accounts can be performed. A
CSV file is used to keep a log of all of the transfers to perform. The file contains the destination
address, the address of the resource to send, and the amount of resources to send. This example 
reads the CSV file, processes it into a transaction manifest, and then constructs a transaction from
it. 
"""

from radix_engine_toolkit import *
from typing import Tuple
import secrets
import csv


class MockGatewayApiClient:
    @staticmethod
    def current_epoch() -> int:
        return 100

    @staticmethod
    def submit_transaction(transaction: NotarizedTransaction) -> None:
        _compiled_notarized_transaction = transaction.compile()


def random_nonce() -> int:
    """
    Generates a random secure random number between 0 and 0xFFFFFFFF (u32::MAX)
    """
    return secrets.randbelow(0xFFFFFFFF)


def main() -> None:
    # The network ID to use for this example.
    NETWORK_ID: int = 0x02

    # The private key of the account that the funds will originate from (the sender) is known. A
    # `PrivateKey` object is created out of it and the virtual account component address is derived
    # from it.
    private_key_hex: str = (
        "75cb44add19fb2d07e83feadd537c487e58047ef30406eafb807f638157ca1d7"
    )
    private_key_bytes: bytearray = bytearray.fromhex(private_key_hex)
    private_key: PrivateKey = PrivateKey.new_secp256k1(list(private_key_bytes))
    public_key: PublicKey = private_key.public_key()
    account_address: Address = Address.virtual_account_address_from_public_key(
        public_key, NETWORK_ID
    )
    print(f"Account address: {account_address.as_str()}")

    # Reading the CSV file and constructing the manifest from the contents of the file. Note that
    # there are couple of optimizations that could be done here to ensure that the final manifest is
    # more fee-efficient. However, this example aims more at clarity; thus, no optimizations are
    # performed.
    with open("transfers.csv", "r") as file:
        manifest_builder: ManifestBuilder = ManifestBuilder().account_lock_fee(
            account_address, Decimal("30")
        )

        # Each row of the CSV file will contribute three instructions to the manifest:
        # - A withdraw from account of the resource address and amount.
        # - A take from worktop of the resource address and amount.
        # - A try_deposit_or_abort of the bucket taken from the worktop.
        csv_reader: csv.DictReader = csv.DictReader(file, delimiter=",")
        for index, row in enumerate(csv_reader):
            destination_address: str = row["destination_address"]
            resource_address: str = row["resource_address"]
            amount: str = row["amount"]

            manifest_builder: ManifestBuilder = (
                manifest_builder.account_withdraw(
                    account_address, Address(resource_address), Decimal(amount)
                )
                .take_from_worktop(
                    Address(resource_address),
                    Decimal(amount),
                    ManifestBuilderBucket(str(index)),
                )
                .account_try_deposit_or_abort(
                    Address(destination_address),
                    ManifestBuilderBucket(str(index)),
                    None,
                )
            )
    manifest: TransactionManifest = manifest_builder.build(NETWORK_ID)
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
                True,
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
