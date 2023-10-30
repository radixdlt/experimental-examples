# Radix Typescript Wallet

## Who is this for?

- For scrypto builders that want to automate parts of their development flow.
- For developers interested in building automated scripts, e.g. arbitrage bots.

## What is this?

Abstractions over [Typescript Radix Engine Toolkit](https://www.npmjs.com/package/@radixdlt/radix-engine-toolkit) and [Radix Gateway SDK](https://www.npmjs.com/package/@radixdlt/babylon-gateway-api-sdk) to create automatic flows for creating, signing and submitting transaction manifests.

## Getting started

```bash
# install node dependencies
npm install
```

### Generate `MNEMONIC`

```bash
# generates bip39 24 words mnemonic
npm run generate-mnemonic
```

```bash
# create .env file and populate with your own values
NETWORK='Stokenet'
MNEMONIC=''
```

### Deploy and instantiate package

[code](./examples/deploy-package.ts)

**Run the code**

```bash
# deploys a scrypto package to the networks
npm run examples:deploy-package
```

## License

All code in this repository is licensed under the modified MIT license described in [LICENSE](/LICENSE).
