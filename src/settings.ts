import type StickyHeadingsPlugin from 'main';
import type { App } from 'obsidian';
import { PluginSettingTab, Setting } from 'obsidian';
import L from './i18n';
import type { ISetting } from './types';

export const defaultSettings = {
  max: 0,
  mode: 'default',
  scrollBehaviour: 'smooth',
  theme: 'flat',
  showIcon: true,
  autoShowFileName: true,
  showInStatusBar: false,
} satisfies ISetting;

export default class StickyHeadingsSetting extends PluginSettingTab {
  plugin: StickyHeadingsPlugin;

  constructor(app: App, plugin: StickyHeadingsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  update(data: ISetting) {
    this.plugin.settings = data;
    this.plugin.saveSettings();
    this.plugin.onSettingChanged();
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    new Setting(containerEl)
      .setName(L.setting.mode.title())
      .setDesc(L.setting.mode.description())
      .addDropdown(dropdown => {
        dropdown.addOption('default', L.setting.mode.default());
        dropdown.addOption('concise', L.setting.mode.concise());
        dropdown.setValue(this.plugin.settings.mode);
        dropdown.onChange(value => {
          this.update({
            ...this.plugin.settings,

            mode: value as 'default' | 'concise',
          });
        });
      });
    new Setting(containerEl)
      .setName(L.setting.max.title())
      .setDesc(L.setting.max.description())
      .addText(text => {
        text.setValue(this.plugin.settings.max.toString());
        text.onChange(value => {
          this.update({
            ...this.plugin.settings,
            max: parseInt(value, 10) || 0,
          });
        });
      });
    new Setting(containerEl)
      .setName(L.setting.scrollBehaviour.title())
      .setDesc(L.setting.scrollBehaviour.description())
      .addDropdown(dropdown => {
        dropdown.addOption('smooth', L.setting.scrollBehaviour.smooth());
        dropdown.addOption('instant', L.setting.scrollBehaviour.instant());
        dropdown.setValue(this.plugin.settings.scrollBehaviour);
        dropdown.onChange(value => {
          this.update({
            ...this.plugin.settings,
            scrollBehaviour: value as ScrollBehavior,
          });
        });
      });
    new Setting(containerEl).setName(L.setting.theme.title()).addDropdown(dropdown => {
      dropdown.addOption('flat', 'flat');
      dropdown.addOption('blur', 'blur');
      dropdown.addOption('float', 'float');
      dropdown.setValue(this.plugin.settings.theme);
      dropdown.onChange(value => {
        this.update({
          ...this.plugin.settings,

          theme: value,
        });
      });
    });
    new Setting(containerEl)
      .setName(L.setting.indicators.title())
      .setDesc(L.setting.indicators.description())
      .addToggle(toggle => {
        toggle.setValue(this.plugin.settings.showIcon);
        toggle.onChange(value => {
          this.update({
            ...this.plugin.settings,
            showIcon: value,
          });
        });
      });
    new Setting(containerEl)
      .setName(L.setting.autoShowFileName.title())
      .setDesc(L.setting.autoShowFileName.description())
      .addToggle(toggle => {
        toggle.setValue(this.plugin.settings.autoShowFileName);
        toggle.onChange(value => {
          this.update({
            ...this.plugin.settings,
            autoShowFileName: value,
          });
        });
      });
    new Setting(containerEl).setName(L.setting.showInStatusBar()).addToggle(toggle => {
      toggle.setValue(this.plugin.settings.showInStatusBar);
      toggle.onChange(value => {
        this.update({
          ...this.plugin.settings,
          showInStatusBar: value,
        });
      });
    });
  }
}
