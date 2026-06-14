/* note-creation-modal.ts */

import { getLinkpath, MarkdownView, TFile } from 'obsidian';

import { ReplaceMode } from './settings';

import xApp from './xApp';
import { sanitisedFileName } from './xFile';
import { createOrAppendFile } from './xObsFile';
import ObsNote from './ObsNote';

export default class NoteCreationModal {
  parentNote: ObsNote;
  content: string;
  mode: ReplaceMode;

  constructor(doc: ObsNote, content: string, mode: ReplaceMode) {
    this.parentNote = doc;
    this.content = content;
    this.mode = mode;
  }

  async create(fileName: string): Promise<void> {
    fileName = sanitisedFileName(fileName);
    const currentFile = this.getCurrentFile();
    const filePath = await createOrAppendFile(fileName, '');
    const templatedContent = await this.templatedContent(this.content, currentFile, filePath!, fileName);
    await createOrAppendFile(fileName, templatedContent)
    await this.parentNote.replaceContent(fileName, filePath, currentFile, templatedContent, this.content, this.mode);
    if (xApp.settings.openNewNote) {
      xApp.workspace.openLinkText(fileName, getLinkpath(filePath!), true);
    }
  }

  async append(file: TFile, existingContent?: string) {
    const currentFile = this.getCurrentFile();
    const templatedContent = await this.templatedContent(this.content, currentFile, file.path, file.basename);
    existingContent = existingContent ?? (await xApp.vault.read(file) + '\r\r'); //TODO: should use the system EOL!
    await xApp.vault.modify(file, existingContent + templatedContent);
    await this.parentNote.replaceContent(file.basename, file.path, currentFile, templatedContent, this.content, this.mode);
    if (xApp.settings.openNewNote) {
      xApp.workspace.openLinkText(file.basename, getLinkpath(file.path), true);
    }
  }

  //TODO: move to -> XNote? getCurrentNoteFile
  getCurrentFile(): TFile {
    const mdView = xApp.workspace.getActiveViewOfType(MarkdownView);
    if (mdView) return mdView.file!;
    throw new Error('There is no file for the current document');
    // const currentView = xApp.workspace.activeLeaf.view as MarkdownView;
    // const currentFile = currentView.file;
    // return { currentView, currentFile };
  }

  private async templatedContent(note: string, curerntFile: TFile, filePath: string, fileName: string) {
    if (xApp.settings.refactoredNoteTemplate !== undefined && xApp.settings.refactoredNoteTemplate !== '') {
      const currentFileLink = await this.parentNote.markdownLink(curerntFile.path);
      const fileLink = await this.parentNote.markdownLink(filePath);
      return this.parentNote.templatedContent(note, xApp.settings.refactoredNoteTemplate, curerntFile.basename, currentFileLink, fileName, fileLink, '', note);
    }
    return note;
  }
}

/* EOF */