import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, ItemView } from 'obsidian';
import { Configuration, OpenAIApi } from "openai";
import { BMOView, VIEW_TYPE_EXAMPLE, setMessageHistory } from "./view";
import { BMOSettingTab } from './settings';

// Remember to rename these classes and interfaces!
export interface BMOSettings {
	apiKey: string;
	max_tokens: string;
	system_role: string;
	temperature: string;
	botName: string;
}

export const DEFAULT_SETTINGS: BMOSettings = {
	apiKey: '',
	max_tokens: '',
	system_role: 'You are a helpful assistant who responds in markdown.',
	temperature: '',
	botName: 'BOT',
}

export default class BMOGPT extends Plugin {
	settings: BMOSettings;
	openai: OpenAIApi;

	resetMessageHistory() {
		setMessageHistory("");
	  }

	async onload() {
		await this.loadSettings();
		this.registerView(
			VIEW_TYPE_EXAMPLE,
			(leaf) => new BMOView(leaf, this.settings)
		);

		this.addRibbonIcon("bot", "Chatbot (Clear chat)", () => {
			this.resetMessageHistory();
		    this.activateView();
		});

		const configuration = new Configuration({
			apiKey: this.settings.apiKey,
		});
		this.openai = new OpenAIApi(configuration);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new BMOSettingTab(this.app, this));

	}

	async onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);
		const configuration = new Configuration({
			apiKey: this.settings.apiKey,
		});
		this.openai = new OpenAIApi(configuration);

	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);
	
		await this.app.workspace.getRightLeaf(false).setViewState({
		  type: VIEW_TYPE_EXAMPLE,
		  active: true,
		});
	
		this.app.workspace.revealLeaf(
		  this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE)[0]
		);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

