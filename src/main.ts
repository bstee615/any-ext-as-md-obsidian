import { App, ButtonComponent, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: ''
}

export default class MdxAsMdPlugin extends Plugin {
	settings: MyPluginSettings;
  currentlyRegistered: Set<string> = new Set<string>();

  async onload() {
    super.onload();
    
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

    // register the view and extensions
    this.doRegisterExtensions();
  }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

  doRegisterExtensions() {
    let extensions = this.settings.mySetting.split(",").map(e => e.trim());
    let newExtensions = extensions.filter(e => !this.currentlyRegistered.has(e));
    this.registerExtensions(newExtensions, "markdown");
    extensions.forEach(e => this.currentlyRegistered.add(e));
    console.log("Registered new extensions:", newExtensions, "All registered extensions:", this.currentlyRegistered);
  }

  get currentlyRegisteredPretty() {
    let crList = Array.from(this.currentlyRegistered);
    crList.sort();
    return crList.join(", ");
  }
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MdxAsMdPlugin;

	constructor(app: App, plugin: MdxAsMdPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('File extensions to recognize as Markdown')
			.setDesc('Comma-delimited (e.g. "txt,mdx,rmd"). Currently registered extensions: ' + this.plugin.currentlyRegisteredPretty)
			.addText(text => text
				.setPlaceholder('Enter your Markdown file extensions')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
          this.plugin.settings.mySetting = value;
        }));
    
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
	}
}
