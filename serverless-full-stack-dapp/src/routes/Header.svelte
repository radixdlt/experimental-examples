<script lang="ts">
  import logo from '$lib/images/svelte-logo.svg';
  import { DataRequestBuilder, RadixDappToolkit, createLogger } from '@radixdlt/radix-dapp-toolkit';
  import { onMount } from 'svelte';
  import { authApi } from './api/auth/auth-api';
  import { walletDataStore } from '$lib/stores/radix';

  import { userApi } from './api/(protected)/user/user-api';
  import { userStore } from '$lib/stores/user';

  export let dAppDefinitionAddress: string;
  export let networkId: number;

  onMount(() => {
    const logger = createLogger(1);

    const dAppToolkit = RadixDappToolkit({
      networkId,
      dAppDefinitionAddress,
      logger
    });

    dAppToolkit.walletApi.provideChallengeGenerator(async () => {
      const result = await authApi.createChallenge();
      if (result.isErr()) throw result.error;
      return result.value;
    });

    dAppToolkit.walletApi.setRequestData(DataRequestBuilder.persona().withProof());

    dAppToolkit.walletApi.dataRequestControl(async (walletData) => {
      const proof = walletData.proofs.find((proof) => proof.type === 'persona');

      if (!proof) {
        throw new Error('No persona proof found');
      }

      const result = await authApi.login(proof);

      if (result.isErr()) {
        logger.error(result.error);
        throw result.error;
      }

      walletDataStore.set(walletData);
    });

    const subscription = dAppToolkit.walletApi.walletData$.subscribe((walletData) => {
      walletDataStore.set(walletData);

      if (walletData?.persona) {
        userApi
          .me()
          .map(userStore.set)
          .mapErr(() => dAppToolkit.disconnect());
      }
    });

    return () => {
      dAppToolkit.destroy();
      subscription.unsubscribe();
    };
  });
</script>

<header>
  <div class="corner">
    <a href="https://kit.svelte.dev">
      <img src={logo} alt="SvelteKit" />
    </a>
  </div>

  <div class="corner">
    <radix-connect-button />
  </div>
</header>

<style>
  header {
    display: flex;
    justify-content: space-between;
  }

  .corner {
    height: 3em;
  }

  .corner a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .corner img {
    width: 2em;
    height: 2em;
    object-fit: contain;
  }

  a:hover {
    color: var(--color-theme-1);
  }
</style>
