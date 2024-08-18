import type { App, TAbstractFile } from 'obsidian';
import { TFile, MarkdownView, MarkdownRenderer } from 'obsidian';

export function isMarkdownFile(file: TFile | TAbstractFile) {
  if (!(file instanceof TFile)) {
    return false;
  }
  return ['md', 'markdown'].includes(file.extension);
}

export function getHeadings(file: TFile, app: App) {
  return app.metadataCache.getFileCache(file)?.headings ?? [];
}

export function parseMarkdown(markdown: string, app: App): Promise<string> {
  const div = document.createElement('div');
  const activeView = app.workspace.getActiveViewOfType(MarkdownView);

  if (!activeView) {
    console.warn('No active markdown view is available.');
    return Promise.resolve(markdown); // Return the original markdown if rendering is not possible
  }

  return MarkdownRenderer.render(app, markdown, div, '', activeView).then(
    () => {
      return div.innerText;
    }
  );
}

export const isEditSourceMode = (view: MarkdownView) => view.currentMode.type !== 'preview';

export const getScroller = (view: MarkdownView) =>
    isEditSourceMode(view) ? view.editor.cm.scrollDOM: view.previewMode.renderer.previewEl;
