<script lang="ts">
  import { MarkdownView, TFile } from 'obsidian';
  import type { Heading, ISetting } from '../../types';
  import { HeadingSuggester } from './suggester';
  import { getScroller } from 'src/utils/obsidian';
  import { animateScroll } from 'src/utils/scroll';
  export let heading: Heading | undefined;
  export let headings: Heading[];
  export let view: MarkdownView | undefined;
  export let settings: ISetting;
  export let file: TFile | undefined;
  function showSuggester() {
    if (view && headings.length) {
      const modal = new HeadingSuggester(view.app, headings, heading => {
        const top = heading.offset;
        const scroller = getScroller(view);
        if (settings.scrollBehaviour === 'instant') {
          scroller.scrollTo({ top, behavior: 'instant' });
        } else {
          animateScroll(scroller, top, 1000);
        }
      });
      modal.open();
    }
  }
</script>

{#if heading && file && view}
  <div class="sticky-headings-status-bar" on:click={showSuggester} role="button" tabindex="0" on:keydown={e => {}}>
    <div>{file.basename}</div>
    <div>/</div>
    <div>{heading.title}</div>
  </div>
{/if}

<style>
  .sticky-headings-status-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    font-size: 12px;
  }
</style>
