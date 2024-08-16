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
}
