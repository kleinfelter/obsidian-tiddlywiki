import { App, Plugin, PluginSettingTab, Setting, Notice } from 'obsidian';
import * as path from 'path';
import { convertJSONToTiddlers, convertTiddlersToObsidianMarkdown, writeObsidianMarkdownFiles } from 'services/TiddlyWikiToMarkdownService';
import { exportAllMarkdownFilesToJSON } from 'services/MarkdownToTiddlyWikiService';
import { exportAllMarkdownFilesToJSONAsMarkdown } from 'services/MarkdownToTiddlyWikiAsMarkdownService';
import { downloadJsonAsFile } from 'utils/downloadJsonAsFile';

export default class ObsidianTiddlyWikiPlugin extends Plugin {
	async onload() {
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: ObsidianTiddlyWikiPlugin;

	constructor(app: App, plugin: ObsidianTiddlyWikiPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Import' });

		const form = containerEl.createEl('form', { attr: { "encType": "multipart/form-data", "hidden": true } })

		const input = containerEl.createEl('input')

		input.type = "file"
		input.id = "file-upload"
		input.multiple = false
		input.accept = ".json"

		input.addEventListener("change", async (event) => {
			if (input.files && input.files.length > 0) {
				for (let fileIndex = 0; fileIndex < input.files.length; fileIndex++) {
					const file = input.files.item(fileIndex)

					if (!file) {
						throw new Error('File is not defined')
					}

					const currentDate = new Date().toISOString().replace(/:/g, '_')

					const directoryPath = `TiddlyWiki-Import-${currentDate}`

					//@ts-ignore
					const exportPath = path.join(this.app.vault.adapter.basePath, directoryPath)

					const tiddlers = await convertJSONToTiddlers(file);
					const obsidianMarkdownArray = convertTiddlersToObsidianMarkdown(tiddlers);
					writeObsidianMarkdownFiles(obsidianMarkdownArray, exportPath);

					new Notice(`✅ Successfuly imported TiddlyWiki to ${exportPath}`, 10000)
				}
			}
		})

		form.appendChild(input)

		new Setting(containerEl)
			.setName('Import JSON')
			.setDesc('To export from TiddlyWiki : Tools->Export all->JSON File')
			.addButton(button => button
				.setButtonText("Import .json").onClick(() => {
					input.click()
				}))

		containerEl.createEl('h2', { text: 'Export' });

		new Setting(containerEl)
			.setName('Export JSON')
			.setDesc('To import in TiddlyWiki : Tools->Import')
			.addButton(button => button
				.setButtonText("Export .json as Wikitext").onClick(async () => {
					//@ts-ignore
					const basePath = this.app.vault.adapter.basePath

					const jsonExport = await exportAllMarkdownFilesToJSON(basePath)

					downloadJsonAsFile(jsonExport, "test.json")
				}))


		new Setting(containerEl)
			.setName('Export JSON as Markdown')
			.setDesc('To import in TiddlyWiki : Tools->Import')
			.addButton(button => button
				.setButtonText("Export .json as Markdown").onClick(async () => {
					//@ts-ignore
					const basePath = this.app.vault.adapter.basePath

					const jsonExport = await exportAllMarkdownFilesToJSONAsMarkdown(basePath)

					downloadJsonAsFile(jsonExport, "test.json")
				}))
	}
}

