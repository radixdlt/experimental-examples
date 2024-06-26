use manifest_builder_examples::*;
use scrypto::blueprints::package::*;
use scrypto::prelude::*;
use transaction::builder::*;

/// An example manifest that publishes a package.
fn main() {
    // An allocator that we will use to create new _example_ addresses for the purposes of this
    // example. Addresses generated by the allocator do not exist on any network.
    let mut allocator = Allocator::default();

    // The address of the account to pay the fees from.
    let fee_payer_account = allocator.new_account_address();

    // Example code and package definition, for this we're using an empty code and a default package
    // definition. Note that these
    let code = include_bytes!("../../../assets/faucet.wasm");
    let package_definition =
        manifest_decode::<PackageDefinition>(include_bytes!("../../../assets/faucet.rpd")).unwrap();

    // Constructing a manifest that establishes a two-way link between the resource and the dApp
    // definition.
    let manifest = ManifestBuilder::new()
        // Locking fees from the fee payer's account.
        .lock_fee(fee_payer_account, 200)
        // Publishing the package and specifying its metadata, and other information.
        .publish_package_advanced(
            None, 
            code.to_vec(),
            package_definition,
            metadata_init! {
                "name" => "Faucet Package", locked;
                "description" => "Just an example of how to publish a package using the manifest builder.", locked;
            },
            OwnerRole::None
        )
        .build();

    // Validate the manifest and print it.
    validate_and_print(&manifest)
}
