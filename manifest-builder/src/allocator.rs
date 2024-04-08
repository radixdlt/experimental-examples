use scrypto::prelude::*;

/// A type used for allocating **_example_** addresses to use in examples.
pub struct Allocator(u128);

impl Allocator {
    pub fn new() -> Self {
        Self(0)
    }

    pub fn new_account_address(&mut self) -> ComponentAddress {
        ComponentAddress::new_or_panic(self.node_id(EntityType::GlobalAccount).0)
    }

    pub fn new_package_address(&mut self) -> ComponentAddress {
        ComponentAddress::new_or_panic(self.node_id(EntityType::GlobalPackage).0)
    }

    pub fn new_fungible_resource_address(&mut self) -> ResourceAddress {
        ResourceAddress::new_or_panic(self.node_id(EntityType::GlobalFungibleResourceManager).0)
    }

    pub fn new_non_fungible_resource_address(&mut self) -> ResourceAddress {
        ResourceAddress::new_or_panic(self.node_id(EntityType::GlobalNonFungibleResourceManager).0)
    }

    fn node_id(&mut self, entity_type: EntityType) -> NodeId {
        let mut bytes = [0u8; 30];
        bytes.copy_from_slice(&hash(self.next_id().to_le_bytes()).0[..30]);
        bytes[0] = entity_type as u8;
        NodeId(bytes)
    }

    fn next_id(&mut self) -> u128 {
        let id = self.0;
        self.0 += 1;
        id
    }
}

impl Default for Allocator {
    fn default() -> Self {
        Self::new()
    }
}
