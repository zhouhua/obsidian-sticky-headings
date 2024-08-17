import 'obsidian';

export interface ISetting {
  max: number;
  mode: 'default' | 'concise';
}

declare module 'obsidian' {
  interface WorkspaceLeaf {
    id: string;
  }
  interface MarkdownView {
    getFile: () => TFile;
    editMode: {
      sourceMode: boolean;
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
