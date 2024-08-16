import type { MarkdownView, TFile } from 'obsidian';

export interface ISetting {
  max: number;
  mode: 'default' | 'concise';
  scrollBehaviour: ScrollBehavior;
}

export interface IFileResolve {
  resolve: boolean;
  file: TFile;
  view: MarkdownView;
  container: HTMLElement;
}

declare module 'obsidian' {
  interface MarkdownSubView {
    type: 'preview' | 'source';
  }
  interface RendererSection {
    height: number;
  }
}
