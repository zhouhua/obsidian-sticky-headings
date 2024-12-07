<svelte:options accessors={true} />

<script lang="ts">
  import { getIcon, MarkdownView } from 'obsidian';
  import type { Heading, ISetting } from '../types';
  import { onDestroy, onMount } from 'svelte';
  import { getScroller } from 'src/utils/obsidian';
  import { delay } from '../utils/delay';
  import { animateScroll } from 'src/utils/scroll';
  export let headings: Heading[];
  export let editMode: boolean;
  export let view: MarkdownView;
  export let settings: ISetting;
  export let getExpectedHeadings: (clickHeadingIndex: number) => Heading[];
  export let showFileName: boolean;
  export let expectedHeadings: Heading[] = [];
  let main: HTMLElement;
  let shadow: HTMLElement;
  let forceRenderingHeadings: Heading[] | null = null;

  const filename = view.getFile()?.basename;
  export const showIcons: boolean = true;

  onMount(() => {
    console.debug('mounted svelte component');
  });

  onDestroy(() => {
    console.debug('destroyed');
  });

  const calculateExpectedHeight = async (index: number) => {
    expectedHeadings = getExpectedHeadings(index);
    // fixme: Is there a better way to run subsequent code after Shadow has rendered?
    await delay(20);
    // fixme: The expected height should not be the height of Shadow but the offset of the lower boundary of Shadow.
    return shadow?.clientHeight || 0;
  };

  const scrollTo = async (top: number) => {
    const scrollerSource = getScroller(view);
    // When jumping, the currently clicked title should not appear in props.headings. This is different from the manual scrolling scenario and needs to be corrected.
    if (settings.scrollBehaviour === 'instant') {
      forceRenderingHeadings = [...expectedHeadings];
      scrollerSource.scrollTo({ top, behavior: 'instant' });
      // waiting for the throlled scroll to complete, the waiting time should be longer than the throlle wait time.
      await delay(80);
      headings = forceRenderingHeadings;
      forceRenderingHeadings = null;
    } else {
      // fixme: add easing function;
      animateScroll(scrollerSource, top, 1000, undefined, undefined, () => {
        headings = forceRenderingHeadings || [];
        forceRenderingHeadings = null;
      });
      // A tricky way to suppress the scroll event.
      forceRenderingHeadings = [...expectedHeadings];
    }
  };

  const handleScrollClick = async (heading: Heading) => {
    const expectedHeight = await calculateExpectedHeight(heading.index);
    const top = heading.offset - expectedHeight;
    scrollTo(top);
  };
</script>

{#if (forceRenderingHeadings || headings).length > 0}
  <div class={`sticky-headings-root sticky-headings-theme-${settings.theme}`} bind:this={main}>
    <div class="sticky-headings-container">
      {#key forceRenderingHeadings || headings}
        {#if showFileName && filename}
          <div
            class="sticky-headings-item"
            on:click={() => scrollTo(0)}
            role="button"
            tabindex="0"
            on:keydown={e => {
              if (e.key === 'Enter') scrollTo(0);
            }}
          >
            {#if settings.showIcon}
              <div class="sticky-headings-icon">
                {@html getIcon('heading')?.outerHTML}
              </div>
            {/if}
            {filename}
          </div>
        {/if}
        {#each forceRenderingHeadings || headings as heading}
          <div
            class="sticky-headings-item"
            data-indent-level={heading.indentLevel + (showFileName ? 1 : 0)}
            on:click={() => handleScrollClick(heading)}
            role="button"
            tabindex="0"
            on:keydown={e => {
              if (e.key === 'Enter') handleScrollClick(heading);
            }}
          >
            {#if settings.showIcon}
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
            {@html heading.title}
          </div>
        {/each}
      {/key}
    </div>
  </div>
{/if}
<div class={`sticky-headings-root sticky-headings-shadow sticky-headings-theme-${settings.theme}`} bind:this={shadow}>
  <div class="sticky-headings-container">
    {#key expectedHeadings}
      {#if showFileName && filename}
        <div class="sticky-headings-item">
          {filename}
        </div>
      {/if}
      {#each expectedHeadings as heading}
        <div class="sticky-headings-item sticky-headings-shadow-item" data-indent-level={0}>
          {@html heading.title}
        </div>
      {/each}
    {/key}
  </div>
</div>

<style>
  .sticky-headings-shadow {
    opacity: 0 !important;
    pointer-events: none !important;
  }

  .sticky-headings-container {
    max-width: min(var(--file-line-width), var(--max-width));
    margin: 0 auto;
    font-size: 12px;
  }

  .sticky-headings-root {
    height: fit-content;
    overflow: hidden;
    position: absolute;
    top: 0;
    width: 100%;
    padding: 0 var(--file-margins);
    z-index: 1;
    padding-top: var(--sticky-header-verticle-offset);
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

  .sticky-headings-item :global(p) {
    margin: 0 !important;
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
    padding-left: var(--sticky-header-indent-width);
  }

  .sticky-headings-item[data-indent-level='2'] {
    padding-left: calc(var(--sticky-header-indent-width) * 2);
  }

  .sticky-headings-item[data-indent-level='3'] {
    padding-left: calc(var(--sticky-header-indent-width) * 3);
  }

  .sticky-headings-item[data-indent-level='4'] {
    padding-left: calc(var(--sticky-header-indent-width) * 4);
  }

  .sticky-headings-item[data-indent-level='5'] {
    padding-left: calc(var(--sticky-header-indent-width) * 5);
  }

  .sticky-headings-item[data-indent-level='6'] {
    padding-left: calc(var(--sticky-header-indent-width) * 6);
  }

  .sticky-headings-theme-flat .sticky-headings-container {
    background-color: var(--background-primary);
  }

  .sticky-headings-theme-blur .sticky-headings-container {
    padding: 12px;
    backdrop-filter: blur(12px);
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    position: relative;
    z-index: 2;
    background: linear-gradient(to bottom, var(--background-primary) 0%, transparent 50%);
  }

  .sticky-headings-theme-blur .sticky-headings-container::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: -1;
    background: linear-gradient(135deg, var(--background-primary) 0%, transparent 30%);
  }

  .sticky-headings-theme-blur .sticky-headings-container::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    right: 0;
    z-index: -1;
    background: linear-gradient(35deg, transparent 70%, var(--background-primary) 100%);
  }

  .sticky-headings-theme-float.sticky-headings-root {
    padding: 10px 20%;
    padding-top: calc(var(--sticky-header-verticle-offset) + 10px);
    padding-bottom: 0;
  }

  .sticky-headings-theme-float .sticky-headings-container {
    border-radius: 32px;
    background-color: var(--sticky-header-float-background-color);
    color: var(--sticky-header-float-text-color);
    padding: 10px 32px;
  }
</style>
