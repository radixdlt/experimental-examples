<script lang="ts">
  import welcome from '$lib/images/svelte-welcome.webp';
  import welcome_fallback from '$lib/images/svelte-welcome.png';
  import { walletDataStore } from '$lib/stores/radix';
  import { userStore } from '$lib/stores/user';

  import { todoApi } from './api/(protected)/todo/todo-api';

  let value = '';
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
  <h1>
    <span class="welcome">
      <picture>
        <source srcset={welcome} type="image/webp" />
        <img src={welcome_fallback} alt="Welcome" />
      </picture>
    </span>
  </h1>

  {#if $walletDataStore?.persona}
    <h1>{$walletDataStore.persona.label}'s todo list</h1>

    <form>
      <input type="text" placeholder="Write description" bind:value />
      <button
        type="submit"
        on:click={async () => {
          await todoApi.create(value).map(userStore.set);
          value = '';
        }}>Add item</button
      >
    </form>

    {#if $userStore?.todoItems}
      {#each $userStore.todoItems as todoItem}
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <h2
          class:completed={todoItem.isDone}
          on:click={() => {
            todoApi.markAsCompleted(todoItem.id).map(userStore.set);
          }}
        >
          {todoItem.text || 'Untitled'}
        </h2>
      {/each}
    {/if}

    <button
      class="clear"
      on:click={() => {
        todoApi.clearCompleted().map(userStore.set);
      }}>Clear completed</button
    >
  {:else}
    <h1>Connect to access private todo list</h1>
  {/if}
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 0.6;
  }

  h1 {
    width: 100%;
  }

  h2 {
    font-weight: bold;
    cursor: pointer;
  }

  h2.completed {
    text-decoration: line-through;
  }

  form {
    margin-bottom: 2rem;
  }

  .welcome {
    display: block;
    position: relative;
    width: 100%;
    height: 0;
    padding: 0 0 calc(100% * 495 / 2048) 0;
  }

  .welcome img {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    display: block;
  }

  .clear {
    margin-top: 1rem;
  }
</style>
