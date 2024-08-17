import type { MarkdownView, TFile, Pos } from 'obsidian';

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

export interface Heading {
  heading: string;
  title: string;
  level: number;
  position: Pos;
  offset: any;
}

declare module 'obsidian' {
  interface WorkspaceLeaf {
    id: string;
  }
  interface MarkdownView {
    getFile: () => TFile;
    editMode: {
      sourceMode: boolean;
      containerEl: {
        querySelector: (string) => HTMLElement;
      };
    };
  }
  interface MarkdownSubView {
    type: 'source' | 'preview';
  }
  interface Editor {
    cm: {
      scrollDOM: HTMLElement;
      lineBlockAt: (Pos) => {};
    };
  }
  interface MarkdownPreviewView {
    renderer: {
      previewEl: HTMLElement;
    };
  }
}
