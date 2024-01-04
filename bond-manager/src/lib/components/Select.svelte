<script lang="ts" context="module">
  export type Item = {
    id: string;
    label: string;
  };
</script>

<script lang="ts">
  type T = $$Generic;

  import Chevron from '$lib/icons/expand-more.svg';
  import SelectItems from './SelectItems.svelte';
  import SelectItem from './SelectItem.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import { computePosition, flip } from '@floating-ui/dom';

  export let placeholder = '';
  export let disabled = false;
  export let selected: Item['id'] | undefined = undefined;
  export let loading = false;
  export let loadingText = 'Loading...';
  export let noItemsText = 'No items found';
  export let expanded = false;
  let element: HTMLElement;
  let dropdownElement: HTMLElement;

  export let items: Item[] = [];
  const dispatch = createEventDispatcher<{ select: Item['id'] }>();

  $: if (selected) {
    placeholder = items.find((item) => item.id === selected)?.label ?? '';
  }

  $: if (expanded && loading) {
    expanded = false;
  }

  onMount(() => {
    const handleClick = (event: any) => {
      if (!element.contains(event.target)) {
        expanded = false;
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => document.removeEventListener('click', handleClick, true);
  });
</script>

<div class="wrapper" bind:this={element}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="select"
    class:disabled
    class:expanded
    on:click={() => {
      if (!loading) expanded = !expanded;
    }}
  >
    <div class="placeholder">{loading ? loadingText : placeholder}</div>
    <img alt="expand icon" class="icon expand" src={Chevron} />
  </div>
  {#if expanded}
    <div class="select-items" bind:this={dropdownElement}>
      <SelectItems>
        {#if items.length}
          {#each items as item, index}
            <SelectItem
              selected={item.id === selected}
              isFirst={index === 0}
              isLast={index === items.length - 1}
              on:click={() => {
                dispatch('select', item.id);
                expanded = false;
                selected = item.id;
              }}>{item.label}</SelectItem
            >
          {/each}
        {:else}
          <SelectItem
            on:click={() => {
              expanded = false;
            }}>{noItemsText}</SelectItem
          >
        {/if}
      </SelectItems>
    </div>
  {/if}
</div>

<style lang="scss">
  .wrapper {
    position: relative;
  }
  .select {
    border: 1px solid var(--theme-border);
    background: var(--theme-surface-2);
    padding: 0.6rem 1rem;
    border-radius: 0.5rem;
    user-select: none;
    display: grid;
    grid-template-columns: 1fr 1rem;
    justify-content: space-between;
    align-items: center;

    &.expanded {
      .icon.expand {
        transform: rotate(180deg);
      }
    }
  }
  .select-items {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    right: 0;
    z-index: 1;
  }
  .icon.expand {
    transform: rotate(0deg);
    transition: transform 0.2s ease-in-out;
  }
  .placeholder {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
