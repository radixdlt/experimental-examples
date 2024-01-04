<div>
  <slot />
</div>

<style>
  div {
    border-radius: 8px;
    background: var(--theme-surface-2);
    box-shadow: var(--shadow-hover);
    max-height: 14rem;
    overflow: auto;
    scrollbar-gutter: stable;
  }
</style>
