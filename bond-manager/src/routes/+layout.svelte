<script lang="ts">
  import './styles.css';
  import Header from '$lib/components/Header.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { DataRequestBuilder, RadixDappToolkit, createLogger } from '@radixdlt/radix-dapp-toolkit';
  import { onMount } from 'svelte';
  import { dAppToolkit, walletDataStore } from '$lib/stores/radix';
  import type { LayoutData } from './$types';
  export let data: LayoutData;

  onMount(() => {
    const logger = createLogger(1);

    const { networkId, dAppDefinitionAddress } = data;

    const rdt = RadixDappToolkit({
      networkId,
      dAppDefinitionAddress
      // logger
    });

    $dAppToolkit = rdt;

    rdt.walletApi.setRequestData(DataRequestBuilder.accounts().atLeast(1));

    const subscription = rdt.walletApi.walletData$.subscribe((walletData) => {
      walletDataStore.set(walletData);
    });

    return () => {
      rdt.destroy();
      subscription.unsubscribe();
    };
  });
</script>

<Header />

<div class="content">
  <Sidebar />
  <div class="page">
    {#if $walletDataStore?.persona}
      <slot />
    {:else}
      <h2>Connect wallet to get started</h2>
    {/if}
  </div>
</div>

<style>
  .content {
    display: grid;
    grid-template-columns: 200px 4fr;
    height: calc(100vh - 75px);
  }
  .page {
    padding: 2rem;
  }
  h2 {
    font-size: 1.5rem;
  }
</style>
