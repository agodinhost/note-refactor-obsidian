/* xApp.ts */

import { App, FileManager, MetadataCache, Scope, TFile, Vault, Workspace } from 'obsidian';

import { NoteRefactorSettings } from './settings';

/**
 * Singleton to keep the Obsidian app, workspace, vault and the plugin settings references.
 */
export default class xApp {
  private static _app: App;
  private static _settings: NoteRefactorSettings;

  static init(
    app?: App,
    settings?: NoteRefactorSettings
  ) {
    if (app) this._app = app;
    else this._app = new App();
    if (settings) this._settings = settings;
    else this._settings = new NoteRefactorSettings();
  }

  static get app(): App {
    if (!this._app) throw new Error('xApp not initialized');
    return this._app;
  }

  static get settings(): NoteRefactorSettings {
    if (!this._app) throw new Error('xApp not initialized');
    return this._settings;
  }

  static get workspace(): Workspace {
    return this.app.workspace;
  }

  static get vault(): Vault {
    return this.app.vault;
  }

  static get metadataCache(): MetadataCache {
    return this.app.metadataCache;
  }

  static getFrontmatter(file: TFile): Record<string, any> {
    const cache = this.app.metadataCache.getFileCache(file);
    if (!cache?.frontmatter) return {};
    return cache.frontmatter;
  }

  static get fileManager(): FileManager {
    return this.app.fileManager;
  }

  static get scope(): Scope {
    return this.app.scope;
  }
}

/* EOF */