<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  const sidebarItems = [
    {
      name: 'Send bond',
      path: '/send-bond'
    },
    {
      name: 'Distribute dividends',
      path: '/distribute-dividends'
    },
    {
      name: 'Recall bond',
      path: '/recall-bond'
    }
  ];
</script>

<div class="content">
  {#each sidebarItems as item}
    <button class:active={$page.url.pathname === item.path} on:click={() => goto(item.path)}
      >{item.name}</button
    >
  {/each}
</div>

<style>
  .content {
    padding-top: 1rem;
    filter: drop-shadow(0px 3px 4px rgba(0, 0, 0, 0.1));
    background: white;
  }
  button {
    display: block;
    width: 100%;
    padding: 1rem;
    border: none;
    background: none;
    text-align: left;
    font-size: 1rem;
    color: var(--theme-text);
    cursor: pointer;
    &:hover {
      color: black;
    }
  }
  .active {
    font-weight: bold;
  }
</style>
