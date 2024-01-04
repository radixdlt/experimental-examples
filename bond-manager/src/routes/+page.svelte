<script lang="ts">
  import { goto } from '$app/navigation';
</script>

<div class="content">
  <button
    on:click={() => {
      goto('/send-bond');
    }}>Send bond</button
  >
</div>

<style>
  .content {
    padding: 1rem;
  }

  button {
    margin-top: 1rem;
    font-weight: bold;
    cursor: pointer;
  }
</style>
