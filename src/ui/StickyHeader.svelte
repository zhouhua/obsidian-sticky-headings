<script lang="ts">
  import { getIcon, MarkdownView } from 'obsidian';
  import type { Heading } from '../types';
  import { onDestroy, onMount } from 'svelte';
  export let headings: Heading[];
  export let editMode: boolean;
  export let view: MarkdownView;
  let main: HTMLElement;

  onMount(() => {
    console.log('mounted svelte component');
  });

  onDestroy(() => {
    console.log('destroyed');
  });

  const scrollerSource = view.editor.cm.scrollDOM;
  const scrollerPreview = view.previewMode.renderer.previewEl;
</script>

<div class="sticky-headings-root" bind:this={main}>
  <div class="sticky-headings-container">
    {#key headings}
      {#each headings as heading, i}
        <div
          class="sticky-headings-item"
          data-indent-level={i}
          on:click={() => {
            // calculate height of header at clicked location before scrolling
            const top = heading.offset.top - main.clientHeight;
            try {
              const offset =
                view.editMode.containerEl.querySelector('.cm-contentContainer')
                  ?.offsetTop || 0;
              scrollerSource.scrollTo({
                top: top + offset,
                behavior: 'instant',
              });
            } catch (e) {}
            try {
              scrollerPreview.scrollTo({
                top,
                behavior: 'instant',
              });
            } catch (e) {}
          }}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === 'Enter' && scrollTo(heading.offset.top)}
        >
          {#if editMode}
            {#each { length: heading.level } as _, i}
              #
            {/each}
          {:else}
            <div class="sticky-headings-icon">
              {@html getIcon(`heading-${heading.level}`)?.outerHTML}
            </div>
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
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    /* height: 18px; */
    cursor: var(--cursor-link);
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
