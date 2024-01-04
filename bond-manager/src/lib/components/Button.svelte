<script>
  export let disabled = false;
  export let loading = false;
</script>

<button class:disabled {disabled} on:click>Send to wallet</button>

<style lang="scss">
  button {
    cursor: pointer;
    border: none;
    background: var(--color-radix-blue-2);
    border-radius: 50px;
    color: var(--color-light);
    padding: 0.6rem 2rem;
    width: 100%;
    text-align: center;
    user-select: none;
  }
</style>
