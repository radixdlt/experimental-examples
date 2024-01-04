<script lang="ts">
  export let selected = false;
  export let isLast = false;
  export let isFirst = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click class:selected class:is-first={isFirst} class:is-last={isLast}>
  <slot />
</div>

<style lang="scss">
  div {
    padding: 0.625rem 0.8rem;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    &.is-first {
      border-radius: 0.5rem 0.5rem 0 0;
    }
    &.is-last {
      border-radius: 0 0 0.5rem 0.5rem;
    }
    &:hover {
      background: var(--theme-surface-1);
    }
  }
  .selected {
    font-weight: 500;
    background: var(--theme-surface-1);
  }
</style>
