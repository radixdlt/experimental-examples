package main

import (
	"crypto/ed25519"
	"encoding/hex"
	"fmt"
	"strconv"

	"github.com/anyproto/go-slip10"
	"github.com/radixdlt/radix-engine-toolkit-go/v2/radix_engine_toolkit_uniffi"
	"github.com/tyler-smith/go-bip39"
)

func assert(condition bool, message string) {
    if !condition {
        panic(message)
    }
}

// networkId: 1 - Mainnet, 2 - Stokenet, ...
// mnemonic: words list space separated
// passphrase: optional
// index: index of an account, starting from 0 (multiple accounts can be created for one mnemonic)
func derive_account_from_mnemonic(networkId uint8, mnemonic string, passphrase string, index uint32) ([]byte, []byte, *radix_engine_toolkit_uniffi.Address) {

    seed := bip39.NewSeed(mnemonic, passphrase)

    // Create path:
    // 44 - BIP44
    // 1022 - RadixDLT SLIP-0044 id
    // Radix network ID
    // 525 - Account
    // 1460 - For transaction signing
    // Account index
    path := "m/44'/1022'/" + strconv.Itoa(int(networkId)) + "'/525'/1460'/" + strconv.Itoa(int(index)) + "'"

    key, err := slip10.DeriveForPath(path, seed)
    assert(err == nil, "Failed to derive path")

    privateKey := ed25519.NewKeyFromSeed(key.RawSeed())
    publicKey := privateKey.Public().(ed25519.PublicKey)

    pk, err := radix_engine_toolkit_uniffi.PrivateKeyNewEd25519(privateKey.Seed())
    assert(err == nil, "Unable to generate RET Ed25519 private key")
    address, err := radix_engine_toolkit_uniffi.AddressVirtualAccountAddressFromPublicKey(pk.PublicKey(), networkId)
    assert(err == nil, "Unable to generate virtual accound address")

    return privateKey.Seed(), publicKey, address
}

func main() {
    var networkId uint8 = 1; // Mainnet
    var mnemonic = "bright club bacon dinner achieve pull grid save ramp cereal blush woman humble limb repeat video sudden possible story mask neutral prize goose mandate"
    var passphrase = ""

    var privateKey, publicKey, address = derive_account_from_mnemonic(networkId, mnemonic, passphrase, 0)

    fmt.Println("Account data:")
    fmt.Println(" mnemonic:\t", mnemonic)
    fmt.Println(" address:\t", address.AsStr())
    fmt.Println(" private key:\t", hex.EncodeToString(privateKey))
    fmt.Println(" public key:\t", hex.EncodeToString(publicKey))
}
