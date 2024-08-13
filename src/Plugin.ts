import debounce from "lodash/debounce";
import type { App, HeadingCache, TFile } from "obsidian";
import {
  MarkdownView,
  Plugin,
  PluginSettingTab,
  setIcon,
  Setting,
} from "obsidian";
import defaultSetting from "./defaultSetting";
import L from "./L";
import {
  calcIndentLevels,
  getHeadings,
  isMarkdownFile,
  parseMarkdown,
  trivial,
} from "./utils";

export default class StickyHeadingsPlugin extends Plugin {
  settings: ISetting;
  fileResolveMap: Record<
    string,
    {
      resolve: boolean;
      file: TFile;
      view: MarkdownView;
      container: HTMLElement;
    }
  > = {};

  markdownCache: Record<string, string> = {};

  detectPosition = debounce(
    (event: Event) => {
      const target = event.target as HTMLElement | null;
      const scroller = target?.classList.contains("cm-scroller") ||
        target?.classList.contains("markdown-preview-view");
      if (scroller) {
        const container = target?.closest(".view-content");
        if (container) {
          const ids = Object.keys(this.fileResolveMap).filter(
            (id) => this.fileResolveMap[id].container === container,
          );
          this.updateHeadings(ids);
        }
      }
    },
    20,
    { leading: true, trailing: true },
  );

  async onload() {
    await this.loadSettings();
    this.registerEvent(
      this.app.workspace.on("file-open", (file) => {
        if (file && isMarkdownFile(file)) {
          const activeView = this.app.workspace.getActiveViewOfType(
            MarkdownView,
          );
          const id = activeView?.leaf.id;
          if (id) {
            if (!(id in this.fileResolveMap)) {
              activeView.onResize = this.makeResize(id);
            }
            this.fileResolveMap[id] = {
              resolve: true,
              file,
              container: activeView.contentEl,
              view: activeView,
            };
            this.checkFileResolveMap();
            this.updateHeadings([id]);
          }
        }
      }),
    );
    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.checkFileResolveMap();
        this.updateHeadings(Object.keys(this.fileResolveMap));
      }),
    );
    this.registerEvent(
      this.app.workspace.on("window-open", (workspaceWindow) => {
        this.registerDomEvent(
          workspaceWindow.doc,
          "scroll",
          this.detectPosition,
          true,
        );
      }),
    );
    this.registerEvent(
      this.app.workspace.on("editor-change", (editor, info) => {
        const { file } = info;
        if (file && isMarkdownFile(file)) {
          Object.values(this.fileResolveMap).forEach((item) => {
            if (item.file.path === file.path) {
              item.resolve = false;
            }
          });
        }
      }),
    );
    this.registerEvent(
      this.app.metadataCache.on("resolve", (file) => {
        if (isMarkdownFile(file)) {
          const ids: string[] = [];
          Object.keys(this.fileResolveMap).forEach((id) => {
            const item = this.fileResolveMap[id];
            if (item.file.path === file.path && !item.resolve) {
              item.resolve = true;
              ids.push(id);
            }
          });
          if (ids.length > 0) {
            this.checkFileResolveMap();
            this.updateHeadings(ids);
          }
        }
      }),
    );
    this.registerDomEvent(document, "scroll", this.detectPosition, true);
    this.addSettingTab(new StickyHeadingsSetting(this.app, this));
  }

  checkFileResolveMap() {
    const validIds: string[] = [];
    this.app.workspace.iterateAllLeaves(
      (leaf) => {
        if (leaf.id && leaf.view instanceof MarkdownView) {
          validIds.push(leaf.id);
          if (!(leaf.id in this.fileResolveMap)) {
            const file = leaf.view.getFile();
            if (file) {
              this.fileResolveMap[leaf.id] = {
                resolve: true,
                file,
                container: leaf.view.contentEl,
                view: leaf.view,
              };
            }
          }
        }
      },
    );
    Object.keys(this.fileResolveMap).forEach((id) => {
      if (!validIds.includes(id)) {
        delete this.fileResolveMap[id];
      }
    });
  }

  makeResize(id: string) {
    return () => {
      this.updateHeadings([id]);
    };
  }

  rerenderAll() {
    this.updateHeadings(Object.keys(this.fileResolveMap));
  }

  updateHeadings(ids: string[]) {
    ids.forEach((id) => {
      const item = this.fileResolveMap[id];
      if (item) {
        const { file, view, container } = item;
        const headings = getHeadings(file, this.app);
        const scrollTop = view.editor.getScrollInfo().top;
        this.renderHeadings(headings, container, scrollTop, view);
      }
    });
  }

  async renderHeadings(
    headings: HeadingCache[] = [],
    container: HTMLElement,
    scrollTop: number,
    view: MarkdownView,
  ) {
    let headingContainer = container.querySelector(
      ".sticky-headings-container",
    );
    const stickyContainerHeight = headingContainer?.getBoundingClientRect()
      .height || 0;
    const validHeadings = headings.filter((heading) =>
      view.editor.cm.lineBlockAt(
        heading.position.end.offset,
      ).bottom <= scrollTop + stickyContainerHeight
    );
    let finalHeadings: HeadingCache[] = [];
    if (validHeadings.length) {
      trivial(validHeadings, finalHeadings, this.settings.mode);
    }
    let lastHeight = 0;
    if (!headingContainer) {
      const headingRoot = createDiv({ cls: "sticky-headings-root" });
      headingContainer = headingRoot.createDiv({
        cls: "sticky-headings-container",
      });
      container.prepend(headingRoot);
    } else {
      lastHeight = headingContainer.getBoundingClientRect().height;
    }
    headingContainer?.empty();
    if (this.settings.max) {
      finalHeadings = finalHeadings.slice(-this.settings.max);
    }
    const indentLevels: number[] = calcIndentLevels(finalHeadings);
    for (const [i, heading] of finalHeadings.entries()) {
      const cls = `sticky-headings-item sticky-headings-level-${heading.level}`;
      const cacheKey = heading.heading;
      let parsedText: string;
      if (cacheKey in this.markdownCache) {
        parsedText = this.markdownCache[cacheKey];
      } else {
        parsedText = await parseMarkdown(heading.heading, this.app);
        this.markdownCache[cacheKey] = parsedText;
      }
      const headingItem = createDiv({
        cls,
        text: parsedText,
      });
      const icon = createDiv({ cls: "sticky-headings-icon" });
      setIcon(icon, `heading-${heading.level}`);
      headingItem.prepend(icon);
      headingItem.setAttribute("data-indent-level", `${indentLevels[i]}`);
      headingContainer.append(headingItem);
      // const scroller = container.querySelector(
      //   ".cm-scroller, .markdown-preview-view",
      // );
      // need to update to get live preview scroller manually
      const scroller = view.editor.cm.scrollDOM;
      headingItem.addEventListener("click", () => {
        const stickyContainerHeight = headingContainer.offsetHeight || 0;

        // Use the heading's offset to get the block information allowing scroll in document
        // lineBlockAt works for headings outside of current dom too
        // https://codemirror.net/docs/ref/#view.EditorView.lineBlockAt
        const blockInfo = view.editor.cm.lineBlockAt(
          heading.position.end.offset,
        );

        // Calculate the target scroll position
        // this is the offset essentially, which allows for precise scrolling
        const targetScrollTop = blockInfo.top;

        // stickyContainerHeight is still the height pre-scrolled
        // behavior can be set as an option, smooth or instant (I prefer smooth, others might not)
        // smooth has issues with debouncing
        scroller?.scrollTo({
          top: targetScrollTop - stickyContainerHeight,
          behavior: "instant",
        });

        // maybe necessary to calculate new stickyheaderheight except that it doesn't update the headers in here
        // setTimeout(() => {
        //   const newHeight = headingContainer.getBoundingClientRect().height;
        //   const offset = lastHeight - newHeight;
        //   console.log("🚀 ~ offset:", newHeight, lastHeight, offset);
        //   // const stickyContainerHeight = headingContainer.offsetHeight || 0;
        //   // console.log("🚀 ~ stickyContainerHeight:", stickyContainerHeight);
        //   scroller?.scrollTo({
        //     top: scroller.scrollTop + offset,
        //     behavior: "instant",
        //   });
        // }, 1000);

        // todo
        // fix issues with sticky container height interfering with scrollTo
      });
    }
  }

  onunload() {}

  async loadSettings() {
    this.settings = {
      ...defaultSetting,
      ...(await this.loadData() as ISetting),
    };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class StickyHeadingsSetting extends PluginSettingTab {
  plugin: StickyHeadingsPlugin;
  render: (settings: ISetting) => void;

  constructor(app: App, plugin: StickyHeadingsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  update(data: ISetting) {
    this.plugin.settings = data;
    this.plugin.saveSettings();
    this.plugin.rerenderAll();
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    new Setting(containerEl)
      .setName(L.setting.mode.title())
      .setDesc(L.setting.mode.description())
      .addDropdown((dropdown) => {
        dropdown.addOption("default", L.setting.mode.default());
        dropdown.addOption("concise", L.setting.mode.concise());
        dropdown.setValue(this.plugin.settings.mode);
        dropdown.onChange((value) => {
          this.update({
            ...this.plugin.settings,
            mode: value as "default" | "concise",
          });
        });
      });
    new Setting(containerEl)
      .setName(L.setting.max.title())
      .setDesc(L.setting.max.description())
      .addText((text) => {
        text.setValue(this.plugin.settings.max.toString());
        text.onChange((value) => {
          this.update({
            ...this.plugin.settings,
            max: parseInt(value, 10) || 0,
          });
        });
      });
  }
}
