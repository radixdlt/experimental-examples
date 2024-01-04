import { RadixNetwork } from '@radixdlt/radix-dapp-toolkit';
import type { SSTConfig } from 'sst';
import { SvelteKitSite } from 'sst/constructs';
import { Parameter } from 'sst/constructs/Parameter.js';

const network = !process.env.NETWORK ? 'stokenet' : (process.env.NETWORK as 'stokenet' | 'mainnet');

export default {
  config() {
    return {
      name: 'bond-manager',
      region: 'eu-west-2',
      profile: 'sandbox',
      stage: network
    };
  },
  stacks(app) {
    if (network === 'stokenet') {
      app.stack(function Site({ stack }) {
        const stokenetDAppDefinitionAddress = new Parameter(stack, 'dAppDefinitionAddress', {
          value: 'account_tdx_2_12x3rn7tqqqm3wguz6kmg5fy7saf8v92lt5xuwgn6kgh8zaejlf80ce'
        });

        const stokenetNetworkId = new Parameter(stack, 'networkId', {
          value: RadixNetwork.Stokenet.toString()
        });

        const stokenetSite = new SvelteKitSite(stack, 'site', {
          bind: [stokenetDAppDefinitionAddress, stokenetNetworkId]
        });

        stack.addOutputs({
          url: stokenetSite.url
        });
      });
    } else if (network === 'mainnet') {
      app.stack(function Site({ stack }) {
        const mainnetDAppDefinitionAddress = new Parameter(stack, 'dAppDefinitionAddress', {
          value: 'account_rdx129fh77vmlt3eyjz9c80ul73r9mm65tyz7uvzjy3canqms8n6yju25a'
        });

        const mainnetNetworkId = new Parameter(stack, 'networkId', {
          value: RadixNetwork.Mainnet.toString()
        });

        const mainnetSite = new SvelteKitSite(stack, 'site', {
          bind: [mainnetDAppDefinitionAddress, mainnetNetworkId]
        });

        stack.addOutputs({
          url: mainnetSite.url
        });
      });
    } else {
      throw new Error('NETWORK environment variable not set to either stokenet or mainnet');
    }
  }
} satisfies SSTConfig;
