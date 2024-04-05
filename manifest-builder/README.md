# Manifest Builder Examples

This repository contains several example usages of the Rust manifest builder to construct several manifests that are common among users. The following are the examples provided in this repository:

* Metadata
    * [Establishing a two-way link between an entity and a dApp definition](./src/bin/metadata/two_way_linking.rs).
    * [Setting, removing, and locking metadata fields](./src/bin/metadata/set_remove_lock.rs).
    * [All of the possible types that can be used in setting metadata](./src/bin/metadata/using_different_types.rs).
* Packages:
    * [Publishing a package](./src/bin/packages/publish.rs)
* Resources:
    * [Creating a new fungible resource](./src/bin/resources/new_fungible_resource.rs)
    * [Creating a new non-fungible resource](./src/bin/resources/new_non_fungible_resource.rs)
    * [Minting fungible resources](./src/bin/resources/mint_fungible.rs)
    * [Minting non-fungible resources](./src/bin/resources/mint_non_fungible.rs)
    
To run one of the examples use the command below:

```sh
cargo run --bin SOME_BINARY_NAME
```

Where `SOME_BINARY_NAME` is the name of one of the binaries from the [Cargo.toml](./Cargo.toml) file. As an example: `cargo run --bin metadata_two_way_linking`. This command runs the example manifest and prints it to the console.