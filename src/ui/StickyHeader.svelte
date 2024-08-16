<script lang="ts">
  import { headings } from './store';
  import { onDestroy, onMount } from 'svelte';

  onMount(() => {
    console.log('mounted svelte component');
  });

  onDestroy(() => {
    console.log('destroyed');
  });
</script>

<div class="sticky-headings-root">
  <div class="sticky-headings-container">
    <ul>
      {#each $headings as heading}
        <li>{heading}</li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .sticky-headings-root {
    width: 100%;
    position: absolute;
    top: 0;
    width: 100%;
  }

  .sticky-headings-container {
    max-width: var(--file-line-width);
    margin: 0 auto;
    background-color: green;
  }
</style>
