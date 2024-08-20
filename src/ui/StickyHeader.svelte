<script lang="ts">
  import { getIcon, MarkdownView } from 'obsidian';
  import type { Heading } from '../types';
  import { onDestroy, onMount } from 'svelte';
  import { getScroller } from 'src/utils/obsidian';
  import { delay } from '../utils/delay';
  export let headings: Heading[];
  export let editMode: boolean;
  export let view: MarkdownView;
  export let getExpectedHeadings: (clickHeadingIndex: number) => Heading[];
  let main: HTMLElement;
  let shadow: HTMLElement;
  let expectedHeadings: Heading[] = [];
  export const showIcons: boolean = true;

  onMount(() => {
    console.log('mounted svelte component');
  });

  onDestroy(() => {
    console.log('destroyed');
  });

  const calculateExpectedHeight = async (index: number) => {
    expectedHeadings = getExpectedHeadings(index);
    // fixme: Is there a better way to run subsequent code after Shadow has rendered?
    await delay(20);
    // fixme: The expected height should not be the height of Shadow but the offset of the lower boundary of Shadow.
    return shadow.clientHeight;
  };

  const handleScrollClick = async (heading: Heading) => {
    const scrollerSource = getScroller(view);
    const expectedHeight = await calculateExpectedHeight(heading.index);
    const top = heading.offset - expectedHeight;
    scrollerSource.scrollTo({ top, behavior: 'instant' });
  };
</script>

<div class="sticky-headings-root" bind:this={main}>
  <div class="sticky-headings-container">
    {#key headings}
      {#each headings as heading, i}
        <div
          class="sticky-headings-item"
          data-indent-level={i}
          on:click={() => handleScrollClick(heading)}
          role="button"
          tabindex="0"
          on:keydown={e => {
            if (e.key === 'Enter') handleScrollClick(heading);
          }}
        >
          {#if showIcons}
            {#if editMode}
              {#each { length: heading.level } as _, i}
                #
              {/each}
            {:else}
              <div class="sticky-headings-icon">
                {@html getIcon(`heading-${heading.level}`)?.outerHTML}
              </div>
            {/if}
          {/if}
          {heading.title}
        </div>
      {/each}
    {/key}
  </div>
</div>
<div class="sticky-headings-root sticky-headings-shadow" bind:this={shadow}>
  <div class="sticky-headings-container">
    {#key expectedHeadings}
      {#each expectedHeadings as heading}
        <div class="sticky-headings-item" data-indent-level={0}>
          {#if showIcons}
            {#if editMode}
              #
            {:else}
              <div class="sticky-headings-icon"></div>
            {/if}
          {/if}
          {heading.title}
        </div>
      {/each}
    {/key}
  </div>
</div>

<style>
  .sticky-headings-root {
    position: absolute;
    top: 0;
    width: 100%;
  }

  .sticky-headings-shadow {
    opacity: 0;
    pointer-events: none;
  }

  .sticky-headings-container {
    max-width: var(--file-line-width);
    margin: 0 auto;
    background-color: var(--background-primary);
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
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: var(--cursor-link);
  }

  .sticky-headings-icon {
    display: flex;
    align-items: center;
  }

  .sticky-headings-icon :global(svg) {
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
  }
</style>
