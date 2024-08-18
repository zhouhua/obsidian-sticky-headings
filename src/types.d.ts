import type { MarkdownView, TFile, Pos, HeadingCache } from 'obsidian';

export interface ISetting {
  max: number;
  mode: 'default' | 'concise';
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
}

declare module 'obsidian' {
  interface MarkdownSubView {
    type: 'source' | 'preview';
  }
  interface MarkdownPreviewView {
    renderer: {
      previewEl: HTMLElement;
    };
  }
}
