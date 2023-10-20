<script lang="ts">
  import Header from './Header.svelte';
  import './styles.css';
  import type { LayoutData } from './$types';
  import { appLogger } from '$lib/helpers/logger';
  import { onMount } from 'svelte';

  export let data: LayoutData;

  appLogger.debug(data);

  onMount(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((res) => {
        appLogger.debug(res);
      });
  });

  const { networkId, dAppDefinitionAddress } = data;
</script>

<div class="app">
  {#if dAppDefinitionAddress}
    <Header networkId={parseInt(networkId)} {dAppDefinitionAddress} />
  {/if}

  <main>
    <slot />
  </main>

  <footer>
    <p>visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit</p>
  </footer>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100%;
    max-width: 64rem;
    margin: 0 auto;
    box-sizing: border-box;
  }

  footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 12px;
  }

  footer a {
    font-weight: bold;
  }

  @media (min-width: 480px) {
    footer {
      padding: 12px 0;
    }
  }
</style>
