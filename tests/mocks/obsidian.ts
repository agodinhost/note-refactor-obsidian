/* 
 * Obsidian test mocks. 
 */
import { jest } from '@jest/globals';

import { promises as fs } from 'fs';

export class App {
  workspace: {
    getActiveViewOfType: jest.Mock;
  };
  vault: {
    getAbstractFileByPath: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
  };
  metadataCache: {
    getFileCache: jest.Mock;
  };
  fileManager: {
    renameFile: jest.Mock;
    copyFile: jest.Mock;
  };
  scope: {
    register: jest.Mock;
    unregister: jest.Mock;
  };

  constructor() {
    this.workspace = {
      getActiveViewOfType: jest.fn()
    };
    this.vault = {
      getAbstractFileByPath: jest.fn(),
      create: jest.fn(),
      delete: jest.fn()
    };
    this.metadataCache = {
      getFileCache: jest.fn()
    };
    this.fileManager = {
      renameFile: jest.fn(),
      copyFile: jest.fn()
    };
    this.scope = {
      register: jest.fn(),
      unregister: jest.fn()
    };
  }
}

export class Editor {
  private content: string;
  constructor(content: string) {
    this.content = content;
    // console.log('Editor mocked');
  }
  getValue(): string {
    return this.content;
  }
}

export class TFile {
  path: string;
  name: string;
  constructor(filename: string) {
    this.path = filename;
    this.name = filename.split('/').pop() || 'mock.md';
    // console.log(`TFile mocked - filename = ${filename}`);
  }
}

export class MarkdownView {
  _editor!: Editor;
  _file!: TFile;
  // ---
  // app: any = {};
  // icon: string = 'document';
  // navigation: boolean = true;
  // leaf: any = {};
  // containerEl: any;
  // getState: any;
  // setState: any;
  // getEphemeralState: any;
  // setEphemeralState: any;
  // getIcon: any;
  // getDisplayText: any;
  // // ---
  // onResize: any;
  // onOpen: any;
  // onClose: any;
  // onPaneMenu: any;
  // load: any;
  // onload: any;
  // unload: any;
  // onunload: any;
  // // ---
  // addChild: any;
  // removeChild: any;
  // register: any;
  // registerEvent: any;
  // registerDomEvent: any;
  // registerInterval: any;
  //
  constructor() {
  }

  async loadContent(filename: string): Promise<MarkdownView> {
    if (filename == null) throw new Error('required filename is null or undefined')
    this._file = new TFile(filename);
    /* TODO: encoding should be a parameter somehow */
    const content = await fs.readFile(filename, 'utf8');
    this._editor = new Editor(content);
    return this;
  }

  setContent(content: string): MarkdownView {
    if (content == null) throw new Error('required content is null or undefined')
    this._file = new TFile('./mock.md');
    this._editor = new Editor(content);
    return this;
  }

  get editor(): Editor {
    return this._editor;
  }

  get file(): TFile {
    return this._file;
  }
}

// EOF