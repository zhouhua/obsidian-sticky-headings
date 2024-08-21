<script lang="ts">
  import { MarkdownView, TFile } from 'obsidian';
  import type { Heading, ISetting } from '../../types';
  export let heading: Heading | undefined;
  export let view: MarkdownView | undefined;
  export let file: TFile | undefined;
</script>

{#if heading && file && view}
  <div class="sticky-headings-status-bar">
    <div class="sticky-headings-status-bar-part">{file.basename}</div>
    <div>/</div>
    <div class="sticky-headings-status-bar-part">{heading.title}</div>
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
  .sticky-headings-status-bar-part {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
