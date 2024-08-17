<script lang="ts">
  import type { Heading } from 'src/plugin';
  import { stickyHeadings, editMode } from './store';
  import { onDestroy, onMount } from 'svelte';
  export let icons: boolean;
  // export let headings: Heading[];

  onMount(() => {
    console.log('mounted svelte component');
  });

  onDestroy(() => {
    console.log('destroyed');
  });

  let isSourceView = false;
  editMode.subscribe((value) => {
    console.log('🚀 ~ value:', value);
    isSourceView = value;
  });
</script>

<div class="sticky-headings-root">
  <div class="sticky-headings-container">
    {#key $stickyHeadings}
      {#each $stickyHeadings as heading}
        <!-- <div class="sticky-headings-icon"></div> -->
        <div class="sticky-headings-item">
          {#if isSourceView}#####{/if}
          {heading.title}
        </div>
      {/each}
    {/key}
  </div>
</div>

<style>
  /* @settings

  name: Sticky Headings
  id: sticky-headings
  settings:
      -
          id: indent-width
          title: Indent width
          description: The indentation width in em units
          type: variable-number
          default: 1
          format: rem

  */

  :root {
    --indent-width: 1em;
  }

  .sticky-headings-root {
    position: absolute;
    top: 0;
    width: 100%;
  }

  .sticky-headings-container {
    max-width: var(--file-line-width);
    margin: 0 auto;
    background-color: blue;
  }

  .sticky-headings-root {
    height: fit-content;
    overflow: hidden;
    position: absolute;
    top: 0;
    width: 100%;
    padding: 0 var(--file-margins);
    z-index: 1;
  }

  .sticky-headings-container {
    font-size: 12px;
    margin: 0 auto;
    max-width: var(--file-line-width);
  }

  .sticky-headings-item {
    line-height: 18px;
    display: flex;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    /* height: 18px; */
    cursor: var(--cursor-link);
  }

  /* .sticky-headings-item svg {
    width: 16px;
    height: 16px;
    margin-right: 8px;
    color: var(--link-color);
  }

  .sticky-headings-item[data-indent-level='1'] {
    padding-left: var(--indent-width);
  }

  .sticky-headings-item[data-indent-level='2'] {
    padding-left: calc(var(--indent-width) * 2);
  }

  .sticky-headings-item[data-indent-level='3'] {
    padding-left: calc(var(--indent-width) * 3);
  }

  .sticky-headings-item[data-indent-level='4'] {
    padding-left: calc(var(--indent-width) * 4);
  }

  .sticky-headings-item[data-indent-level='5'] {
    padding-left: calc(var(--indent-width) * 5);
  }

  .sticky-headings-item:last-of-type {
    padding-bottom: 5px;
  } */
</style>
