import {
	App,
	HeadingCache,
	MarkdownView,
	Plugin,
	PluginSettingTab,
	setIcon,
	Setting,
	TFile,
} from "obsidian";
import defaultSetting from "./defaultSetting";
import { getHeadings, isMarkdownFile, trivial } from "./utils";
import debounce from "lodash/debounce";
import L from "./L";

export default class StickyHaeddingsPlugin extends Plugin {
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
	async onload() {
		await this.loadSettings();
		this.registerEvent(
			this.app.workspace.on("file-open", (file) => {
				if (file && isMarkdownFile(file)) {
					const activeView =
						this.app.workspace.getActiveViewOfType(MarkdownView);
					const id = activeView?.leaf.id;
					if (id) {
						if (!this.fileResolveMap[id]) {
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
			})
		);
		this.registerEvent(
			this.app.workspace.on("editor-change", (editor, info) => {
				const file = info.file;
				if (file && isMarkdownFile(file)) {
					Object.values(this.fileResolveMap).forEach((item) => {
						if (item.file.path === file.path) {
							item.resolve = false;
						}
					});
				}
			})
		);
		this.registerEvent(
			this.app.metadataCache.on("resolve", (file) => {
				if (isMarkdownFile(file as TFile)) {
					this.checkFileResolveMap();
					const ids: string[] = [];
					Object.keys(this.fileResolveMap).forEach((id) => {
						const item = this.fileResolveMap[id];
						if (item.file.path === file.path && !item.resolve) {
							item.resolve = true;
							ids.push(id);
						}
					});
					this.updateHeadings(ids);
				}
			})
		);
		this.registerDomEvent(document, "scroll", this.detectPosition, true)
		this.addSettingTab(new StickyHeadingsSetting(this.app, this));
	}

	checkFileResolveMap() {
		const validIds: string[] = [];
		this.app.workspace.iterateLeaves(
			this.app.workspace.getFocusedContainer(),
			(leaf) => {
				leaf.id && validIds.push(leaf.id);
			}
		);
		Object.keys(this.fileResolveMap).forEach((id) => {
			if (!validIds.includes(id)) {
				delete this.fileResolveMap[id];
			}
		});
	}

	detectPosition = debounce((event) => {
		const { target } = event;
		if(target.classList.contains('cm-scroller') || target.classList.contains('markdown-preview-view')) {
			const container = target.closest('.view-content');
			if(container) {
				const ids = Object.keys(this.fileResolveMap).filter(id => this.fileResolveMap[id].container === container);
				this.updateHeadings(ids);
			}
		}
	}, 20, { leading: true, trailing: true });

	makeResize(id: string) {
		return () => {
			this.updateHeadings([id]);
		}
	}

	updateHeadings(ids: string[]) {
		ids.forEach((id) => {
			const item = this.fileResolveMap[id];
			if (item) {
				const { file, view, container } = item;
				const headings = getHeadings(file, this.app);
				const scrollTop = view.currentMode.getScroll();
				this.renderHeadings(headings, container, scrollTop, file, view);
			}
		})
	}

	renderHeadings(headings: HeadingCache[] = [], container: HTMLElement, scrollTop: number, file: TFile, view: MarkdownView) {
		const validHeadings = headings.filter(heading => heading.position.end.line < scrollTop);
		let finalHeadings: HeadingCache[] = [];
		if(validHeadings.length) {
			trivial(validHeadings, finalHeadings, this.settings.mode);
		}
		let headeingContainer = container.querySelector('.sticky-headings-container');
		if(!headeingContainer) {
			headeingContainer = createDiv({cls: 'sticky-headings-container'});
			container.prepend(headeingContainer);
		}
		headeingContainer.empty();
		if(this.settings.max) {
			finalHeadings = finalHeadings.slice(-this.settings.max);
		}
		finalHeadings.forEach(heading => {
			const headingItem = createDiv({cls: `sticky-headings-item sticky-headings-level-${heading.level}`, text: heading.heading});
			const icon = createDiv({cls: 'sticky-headings-icon'});
			setIcon(icon, `heading-${heading.level}`);
			headingItem.prepend(icon);
			headeingContainer?.append(headingItem);
			headingItem.addEventListener('click', () => {
				view.setEphemeralState({line: heading.position.start.line});
			});
		});
		
	}

	onunload() {}

	async loadSettings() {
		this.settings = { ...defaultSetting, ...(await this.loadData()) };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class StickyHeadingsSetting extends PluginSettingTab {
	plugin: StickyHaeddingsPlugin;
	render: (settings: ISetting) => void;

	constructor(app: App, plugin: StickyHaeddingsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
	update(data: ISetting) {
		this.plugin.settings = data;
		this.plugin.saveSettings();
	}
	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		new Setting(containerEl)
			.setName(L.setting.mode.title())
			.setDesc(L.setting.mode.description())
			.addDropdown((dropdown) => {
				dropdown.addOption('default', L.setting.mode.default());
				dropdown.addOption('concise', L.setting.mode.concise());
				dropdown.setValue(this.plugin.settings.mode);
				dropdown.onChange(async (value) => {
					this.update({
						...this.plugin.settings,
						mode: value as 'default' | 'concise',
					});
				});
			});
		new Setting(containerEl)
			.setName(L.setting.max.title())
			.setDesc(L.setting.max.description())
			.addText((text) => {
				text.setValue(this.plugin.settings.max.toString());
				text.onChange(async (value) => {
					this.update({
						...this.plugin.settings,
						max: parseInt(value, 10) || 0,
					});
				});
			});
	}
}
