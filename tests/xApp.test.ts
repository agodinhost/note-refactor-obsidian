import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { App, TFile } from 'obsidian';

import { NoteRefactorSettings } from '../src/settings';

import xApp from '../src/xApp';

describe("xApp utility class", () => {
  let mockApp: jest.Mocked<App>;
  let mockSettings: NoteRefactorSettings;

  beforeEach(() => {
    mockApp = {
      workspace: {},
      vault: {},
      metadataCache: {
        getFileCache: jest.fn()
      },
      fileManager: {},
      scope: {}
    } as unknown as jest.Mocked<App>;
    mockSettings = new NoteRefactorSettings();
    xApp.init(mockApp, mockSettings);
  });

  it("should initialize with provided settings and app", () => {
    expect(xApp.settings).toBe(mockSettings);
    expect(xApp.app).toBe(mockApp);
  });

  it("should initialize with defaults when no arguments are provided", () => {
    xApp.init();
    expect(xApp.settings).toBeInstanceOf(NoteRefactorSettings);
    expect(xApp.app).toBeInstanceOf(App);
  });

  it("should throw an error if app is not initialized", () => {
    (xApp as any)._app = undefined;
    expect(() => xApp.app).toThrow("xApp not initialized");
  });

  it("should expose workspace, vault, metadataCache, fileManager and scope", () => {
    expect(xApp.workspace).toBe(mockApp.workspace);
    expect(xApp.vault).toBe(mockApp.vault);
    expect(xApp.metadataCache).toBe(mockApp.metadataCache);
    expect(xApp.fileManager).toBe(mockApp.fileManager);
    expect(xApp.scope).toBe(mockApp.scope);
  });

  it("getFrontmatter should return empty object if no frontmatter exists", () => {
    const file = {} as TFile;
    mockApp.metadataCache.getFileCache.mockReturnValue(undefined);

    expect(xApp.getFrontmatter(file)).toEqual({});
  });

  it("getFrontmatter should return frontmatter if it exists", () => {
    const file = {} as TFile;
    const fm = { title: "Test Note" };
    mockApp.metadataCache.getFileCache.mockReturnValue({ frontmatter: fm });

    expect(xApp.getFrontmatter(file)).toEqual(fm);
  });
});
