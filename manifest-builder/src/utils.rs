use transaction::manifest::*;
use transaction::prelude::*;

pub fn validate_and_print(manifest: &TransactionManifestV1) {
    // Validate that the manifest compiles.
    manifest_encode(&manifest).expect("Must be encodable");

    // Print
    let string_manifest = decompile(&manifest.instructions, &NetworkDefinition::simulator())
        .expect("Decompilation must succeed!");
    println!("{string_manifest}");
}
