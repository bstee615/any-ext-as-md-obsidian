import { App, ButtonComponent, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface AnyExtAsMdSettings {
  extensionsCommaDelimited: string;
}

const DEFAULT_SETTINGS: AnyExtAsMdSettings = {
  extensionsCommaDelimited: ''
}

export default class AnyExtAsMdPlugin extends Plugin {
  settings: AnyExtAsMdSettings;

  // There is no option to UNregisterExtensions, so we keep a list of previously registered extensions here.
  currentlyRegisteredExtensions: Set<string> = new Set<string>();

  async onload() {
    super.onload();

    await this.loadSettings();

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new AnyExtAsMdSettingTab(this.app, this));

    // register the view and extensions
    this.doRegisterExtensions();
  }

  /**
   * Load settings from disk.
   */
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  /**
   * Save settings to disk.
   */
  async saveSettings() {
    await this.saveData(this.settings);
  }

  /**
   * Register new extensions based on the settings.
   */
  doRegisterExtensions() {
    let extensions = this.settings.extensionsCommaDelimited.split(",").map(e => e.trim()).filter(e => e.length > 0);
    let newExtensions = extensions.filter(e => !this.currentlyRegisteredExtensions.has(e));
    this.registerExtensions(newExtensions, "markdown");
    extensions.forEach(e => this.currentlyRegisteredExtensions.add(e));
    console.log("Registered new extensions:", newExtensions, "All registered extensions:", this.currentlyRegisteredExtensions);
  }

  /**
   * Get a comma-delimited list of currently registered extensions for pretty-printing.
   */
  get currentlyRegisteredPretty() {
    let crList = Array.from(this.currentlyRegisteredExtensions);
    crList.sort();
    return crList.join(", ");
  }
}

class AnyExtAsMdSettingTab extends PluginSettingTab {
  plugin: AnyExtAsMdPlugin;

  constructor(app: App, plugin: AnyExtAsMdPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    // Text input for list of extensions
    new Setting(containerEl)
      .setName('File extensions to recognize as Markdown')
      .setDesc('Comma-delimited list without dots (e.g. "txt,mdx,rmd"). Currently registered extensions: ' + this.plugin.currentlyRegisteredPretty)
      .addText(text => text
        .setPlaceholder('Enter your custom file extensions')
        .setValue(this.plugin.settings.extensionsCommaDelimited)
        .onChange(async (value) => {
          this.plugin.settings.extensionsCommaDelimited = value;
        }));

    // Save button
    new Setting(containerEl)
      .setName('Save file extensions')
      .setDesc('Save and register the current set of file extensions.')
      .addButton((button: ButtonComponent) => {
        button.setButtonText('Save');
        button.onClick(async () => {
          await this.plugin.saveSettings();
          await this.plugin.doRegisterExtensions();
          this.display();
        });
        button.setCta();
      });

    containerEl.createDiv({ text: 'Note: Obsidian doesn\'t have functionality to remove file extensions once added. Reload Obsidian to reset the list of file extensions.' })
  }
}
