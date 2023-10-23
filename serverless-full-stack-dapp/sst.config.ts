import { NetworkId } from '@radixdlt/rola';
import type { SSTConfig } from 'sst';
import { SvelteKitSite, Table } from 'sst/constructs';
import { Parameter } from 'sst/constructs/Parameter.js';
import { Secret } from 'sst/constructs/Secret.js';
import { RadixNetworkConfig } from '@radixdlt/radix-dapp-toolkit';

const network = process.env.NETWORK_NAME || 'Stokenet';

const networkConfig = RadixNetworkConfig[network];

if (!networkConfig) throw new Error(`Unknown network ${network}`);

const config = {
  [NetworkId.Stokenet]: {
    name: 'serverless-full-stack-dapp',
    origin: 'https://d346njantf1atm.cloudfront.net',
    dAppDefinitionAddress: 'account_tdx_2_12yzqmuj80lcz8zudxdxeupalvq9ghv30z63s9twnwxklts8p70g3nv',
    stage: networkConfig.networkName,
    aws: {
      profile: 'sandbox',
      region: 'eu-west-2'
    }
  },
  [NetworkId.Mainnet]: {
    name: 'serverless-full-stack-dapp',
    origin: '',
    dAppDefinitionAddress: '',
    stage: networkConfig.networkName,
    aws: {
      profile: 'sandbox',
      region: 'eu-west-2'
    }
  }
}[networkConfig.networkId];

export default {
  config() {
    return {
      name: config.name,
      region: config.aws.region,
      profile: config.aws.profile,
      stage: config.stage
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const challengeTable = new Table(stack, 'challenges', {
        fields: {
          challenge: 'string',
          expiresAt: 'number'
        },
        timeToLiveAttribute: 'expiresAt',
        primaryIndex: { partitionKey: 'challenge' }
      });

      const userTable = new Table(stack, 'users', {
        fields: {
          identityAddress: 'string'
        },
        primaryIndex: { partitionKey: 'identityAddress' }
      });

      const origin = new Parameter(stack, 'origin', {
        value: config.origin
      });

      const networkId = new Parameter(stack, 'networkId', {
        value: networkConfig.networkId.toString()
      });

      const dAppDefinitionAddress = new Parameter(stack, 'dAppDefinitionAddress', {
        value: config.dAppDefinitionAddress
      });

      const jwtSecret = new Secret(stack, 'jwtSecret');

      const site = new SvelteKitSite(stack, 'site', {
        bind: [challengeTable, userTable, origin, networkId, dAppDefinitionAddress, jwtSecret]
      });

      stack.addOutputs({
        url: site.url
      });
    });
  }
} satisfies SSTConfig;
