use manifest_builder_examples::*;
use scrypto::prelude::*;
use transaction::builder::*;

/// An example manifest that adds a two-way link between a dApp definition and a resource.
fn main() {
    // An allocator that we will use to create new _example_ addresses for the purposes of this
    // example. Addresses generated by the allocator do not exist on any network.
    let mut allocator = Allocator::default();

    // The dApp definition that we we're using.
    let dapp_definition = allocator.new_account_address();

    // The resource that we would like to link to the dApp definition.
    let resource_to_link = allocator.new_fungible_resource_address();

    // The address of the owner badge of the dApp definition and the resource. This is required to
    // allow us to update the metadata on the the two entities.
    let admin_badge = allocator.new_fungible_resource_address();

    // The address of the account that holds the admin badge.
    let admin_badge_holder = allocator.new_account_address();

    // Assume that the following is the vector of addresses found in the `claimed_entities` field
    // of the dapp_definition. This data could've been read from the gateway or from other sources.
    let claimed_entities = (0..10)
        .map(|_| allocator.new_fungible_resource_address())
        .map(GlobalAddress::from)
        .collect::<Vec<_>>();

    // Constructing a manifest that establishes a two-way link between the resource and the dApp
    // definition.
    let manifest = ManifestBuilder::new()
        // Assuming that the account that holds the admin badge is also the fee payer, we lock fees
        // from that account. We're locking 10 XRD so that we have more than enough to do what we
        // need.
        .lock_fee(admin_badge_holder, 10)
        // Creating a proof of the owner badge, required for permission to update the metadata on
        // the two entities.
        .create_proof_from_account_of_amount(admin_badge_holder, admin_badge, 1)
        // Step 1: Adding a `dapp_definitions` metadata field to the resource containing the address
        // of the dApp definition that we wish to link the resource to.
        .set_metadata(
            resource_to_link,
            "dapp_definitions",
            vec![GlobalAddress::from(dapp_definition)],
        )
        // Step 2: Adding the address of the resource to the `claimed_entities` entry of the dApp
        // definition metadata. This step assumes that we have already read the array of claimed
        // entities from the gateway or other sources. Calling `set_metadata` will NOT just insert
        // the address into the vector of `claimed_entities` but will set the field to whatever is
        // specified here. So, the `claimed_entities` must be read first, have the address we wish
        // to add appended to it, and then call `set_metadata` with that.
        .set_metadata(dapp_definition, "claimed_entities", {
            let mut already_claimed_entities = claimed_entities.clone();
            already_claimed_entities.push(resource_to_link.into());
            already_claimed_entities
        })
        .build();

    // Validate the manifest and print it.
    validate_and_print(&manifest)
}
