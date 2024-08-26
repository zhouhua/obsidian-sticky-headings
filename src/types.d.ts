import type { MarkdownView, TFile, HeadingCache, EventRef } from 'obsidian';
import type StickyHeaderComponent from './stickyHeader';

export interface ISetting {
  max: number;
  mode: 'default' | 'concise';
  theme: string;
  scrollBehaviour: ScrollBehavior;
}

export interface FileResolveEntry {
  resolve: boolean;
  file: TFile;
  view: MarkdownView;
  container: HTMLElement;
  headings: Heading[];
  headingEl: StickyHeaderComponent;
  layoutChangeEvent: EventRef;
  scrollListener?: ((event: Event) => void) | null;
  editMode: boolean;
}

export interface Heading extends HeadingCache {
  title: string;
  offset: number;
  indentLevel: number;
  index: number;
}

declare module 'obsidian' {
  interface MarkdownSubView {
    type: 'source' | 'preview';
  }
  interface RendererSection {
    height: number;
  }
}
