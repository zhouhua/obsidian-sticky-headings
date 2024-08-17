import debounce from 'lodash/debounce';
import type { HeadingCache, TFile } from 'obsidian';
import { MarkdownView, Plugin, ItemView } from 'obsidian';
import type { ISetting } from './typing';
import StickyHeadingsSetting, { defaultSettings } from './settings';
import {
  calcIndentLevels,
  getHeadings,
  isMarkdownFile,
  parseMarkdown,
  trivial,
} from './utils';

import StickyHeaderComponent from './stickyHeader';
import { headings, editMode } from './ui/store';

export default class StickyHeadingsPlugin extends Plugin {
  settings: ISetting = defaultSettings;
  headingEl: StickyHeaderComponent | undefined;
  fileResolveMap: Map<
    string,
    {
      resolve: boolean;
      file: TFile;
      view: MarkdownView;
      container: HTMLElement;
      headingEl: StickyHeaderComponent | undefined;
    }
  > = new Map();

  markdownCache: Record<string, string> = {};

  detectPosition = debounce(
    (event: Event) => {
      const target = event.target as HTMLElement | null;
      const scroller =
        target?.classList.contains('cm-scroller') ||
        target?.classList.contains('markdown-preview-view');
      if (scroller) {
        const container = target?.closest('.view-content');
        if (container) {
          const ids = Array.from(this.fileResolveMap.entries())
            .filter(([, value]) => value.container === container)
            .map(([id]) => id);
          // this.updateHeadings(ids);
        }
      }
    },
    20,
    { leading: true, trailing: true }
  );

  async onload() {
    await this.loadSettings();

    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView) {
      this.createStickyHeaderComponent(activeView);
    }

    this.registerEvent(
      this.app.workspace.on('layout-change', this.handleLayoutChange.bind(this))
    );

    this.registerEvent(
      this.app.workspace.on('window-open', (workspaceWindow) => {
        this.registerDomEvent(
          workspaceWindow.doc,
          'scroll',
          this.detectPosition,
          true
        );
      })
    );

    this.registerEvent(
      this.app.workspace.on('editor-change', (editor, info) => {
        this.handleEditorChange(info.file);
      })
    );

    this.registerEvent(
      this.app.metadataCache.on('resolve', (file) => this.handleResolve(file))
    );

    this.registerDomEvent(document, 'scroll', this.detectPosition, true);
    this.addSettingTab(new StickyHeadingsSetting(this.app, this));
  }

  createStickyHeaderComponent(view: MarkdownView) {
    const id = view.leaf.id;
    if (id && !this.fileResolveMap.has(id)) {
      const file = view.getFile();
      if (file) {
        const headingEl = new StickyHeaderComponent(view as ItemView);
        this.fileResolveMap.set(id, {
          resolve: true,
          file,
          container: view.contentEl,
          view,
          headingEl,
        });
        this.checkFileResolveMap();
      }
    }
  }

  handleLayoutChange() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView) editMode.set(activeView.editMode.sourceMode);
    this.checkFileResolveMap();
  }

  handleEditorChange(file: TFile | null) {
    if (file && isMarkdownFile(file)) {
      this.fileResolveMap.forEach((item) => {
        if (item.file.path === file.path) {
          item.resolve = false;
        }
      });
    }
  }

  handleResolve(file: TFile) {
    if (isMarkdownFile(file)) {
      const ids: string[] = [];
      this.fileResolveMap.forEach((item, id) => {
        if (item.file.path === file.path && !item.resolve) {
          item.resolve = true;
          ids.push(id);
        }
      });
      if (ids.length > 0) {
        this.checkFileResolveMap();
      }
    }
  }

  checkFileResolveMap() {
    const validIds = new Set<string>();
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view instanceof MarkdownView) {
        const id = leaf.id;
        if (id) {
          validIds.add(id);
          if (!this.fileResolveMap.has(id)) {
            this.createStickyHeaderComponent(leaf.view as MarkdownView);
          }
        }
      }
    });

    this.fileResolveMap.forEach((_, id) => {
      if (!validIds.has(id)) {
        console.log('deleting');
        const item = this.fileResolveMap.get(id);
        item?.headingEl?.removeStickyHeader();
        this.fileResolveMap.delete(id);
      }
    });
  }

  updateHeadings(ids: string[]) {
    ids.forEach((id) => {
      const item = this.fileResolveMap.get(id);
      if (item) {
        const { file, view, container } = item;
        const headings = getHeadings(file, this.app);
        const scrollTop = view.currentMode.getScroll();
        this.renderHeadings(headings, container, scrollTop, view, id);
      }
    });
  }

  async renderHeadings(
    headings: HeadingCache[] = [],
    container: HTMLElement,
    scrollTop: number,
    view: MarkdownView,
    id: string
  ) {
    const validHeadings = headings.filter(
      (heading) => heading.position.end.line + 1 <= scrollTop
    );
    let finalHeadings: HeadingCache[] = [];
    if (validHeadings.length) {
      trivial(validHeadings, finalHeadings, this.settings.mode);
    }
    let headingContainer = container.querySelector(
      '.sticky-headings-container'
    );
    let lastHeight = 0;
    if (!headingContainer) {
      const headingRoot = createDiv({ cls: 'sticky-headings-root' });
      headingContainer = headingRoot.createDiv({
        cls: 'sticky-headings-container',
      });
      container.prepend(headingRoot);
    } else {
      lastHeight = headingContainer.scrollHeight;
    }
    headingContainer.empty();
    if (this.settings.max) {
      finalHeadings = finalHeadings.slice(-this.settings.max);
    }
    const indentLevels: number[] = calcIndentLevels(finalHeadings);
    for (const [i, heading] of finalHeadings.entries()) {
      // const cls = `sticky-headings-item sticky-headings-level-${heading.level}`;
      const cacheKey = heading.heading;
      let parsedText: string;
      if (cacheKey in this.markdownCache) {
        parsedText = this.markdownCache[cacheKey];
      } else {
        parsedText = await parseMarkdown(heading.heading, this.app);
        this.markdownCache[cacheKey] = parsedText;
      }
      // const headingItem = createDiv({
      //   cls,
      //   text: parsedText,
      // });
      // const icon = createDiv({ cls: 'sticky-headings-icon' });
      // setIcon(icon, `heading-${heading.level}`);
      // headingItem.prepend(icon);
      // headingItem.setAttribute('data-indent-level', `${indentLevels[i]}`);
      // headingContainer.append(headingItem);
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      // headingItem.addEventListener('click', () => {
      //   // @ts-expect-error typing error
      //   view.currentMode.applyScroll(heading.position.start.line, {
      //     highlight: true,
      //   });
      //   setTimeout(() => {
      //     // wait for headings tree rendered
      //     // @ts-expect-error typing error
      //     view.currentMode.applyScroll(heading.position.start.line, {
      //       highlight: true,
      //     });
      //   }, 20);
      // });
    }
    // const newHeight = headingContainer.scrollHeight;
    // const offset = newHeight - lastHeight;
    // headingContainer.parentElement!.style.height = newHeight + 'px';
    // const contentElement = container.querySelectorAll<HTMLElement>(
    //   '.markdown-source-view, .markdown-reading-view'
    // );
    // contentElement.forEach((item) => {
    //   const scroller = item.querySelector(
    //     '.cm-scroller, .markdown-preview-view'
    //   );
    //   item.style.paddingTop = newHeight + 'px';
    //   scroller?.scrollTo({
    //     top: scroller.scrollTop + offset,
    //     behavior: 'instant',
    //   });
    // });
  }

  onunload() {
    this.fileResolveMap.forEach((item) => {
      item.headingEl?.removeStickyHeader();
    });
  }

  async loadSettings() {
    this.settings = {
      ...defaultSettings,
      ...((await this.loadData()) as ISetting),
    };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
