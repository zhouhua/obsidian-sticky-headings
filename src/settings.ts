import type StickyHeadingsPlugin from 'main';
import { PluginSettingTab, App, Setting } from 'obsidian';
import L from './localisation';

export const defaultSettings = {
  max: 0,
  mode: 'default',
} satisfies ISetting;

export default class StickyHeadingsSetting extends PluginSettingTab {
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
        dropdown.addOption('default', L.setting.mode.default());
        dropdown.addOption('concise', L.setting.mode.concise());
        dropdown.setValue(this.plugin.settings.mode);
        dropdown.onChange((value) => {
          this.update({
            ...this.plugin.settings,
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            mode: value as 'default' | 'concise',
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
