/* main.ts */

import { MarkdownView, Plugin } from 'obsidian';

import { NoteRefactorSettings, ReplaceMode } from './settings';
import { NoteRefactorSettingsTab } from './settings-tab';

import xApp from './xApp';
import { ensureUniqueFileNames } from './xFile';
import ObsNote from './ObsNote';

import NoteRefactorModal from './note-refactor-modal';
import NoteCreationModal from './note-creation-modal';

export default class NoteRefactor extends Plugin {

  onInit() { }

  async onload() {
    console.log("Loading Note Refactor plugin");
    const settings = Object.assign(new NoteRefactorSettings(), await this.loadData());
    xApp.init(this.app, settings);

    this.addCommand({
      id: 'app:extract-selection-first-line',
      name: 'Extract selection to new note - first line as file name',
      callback: () => this.onEditModeGuard(async () => await this.onExtractSelectionFirstLine('replace-selection')),
      hotkeys: [
        {
          modifiers: ["Mod", "Shift"],
          key: "n",
        },
      ],
    });

    this.addCommand({
      id: 'app:extract-selection-content-only',
      name: 'Extract selection to new note - content only',
      callback: () => this.onEditModeGuard(() => this.onExtractSelectionContentOnly('replace-selection')),
      hotkeys: [
        {
          modifiers: ["Mod", "Shift"],
          key: "c",
        },
      ],
    });

    this.addCommand({
      id: 'app:extract-selection-autogenerate-name',
      name: 'Extract selection to new note - only prefix as file name',
      callback: () => this.onEditModeGuard(() => this.onExtractSelectionAutogenerate('replace-selection'))
    });

    this.addCommand({
      id: 'app:split-note-first-line',
      name: 'Split note here - first line as file name',
      callback: () => this.onEditModeGuard(() => this.onExtractSelectionFirstLine('split')),
    });

    this.addCommand({
      id: 'app:split-note-content-only',
      name: 'Split note here - content only',
      callback: () => this.onEditModeGuard(() => this.onExtractSelectionContentOnly('split')),
    });

    //TODO: include a option to find the max heading level in the note and split by that, or maybe even by all heading levels at once, creating a hierarchy of notes based on the heading levels.

    this.addCommand({
      id: 'app:split-note-by-heading-h1',
      name: 'Split note by headings - H1',
      callback: () => this.onEditModeGuard(() => this.onSplitOnHeading(1)),
    });

    this.addCommand({
      id: 'app:split-note-by-heading-h2',
      name: 'Split note by headings - H2',
      callback: () => this.onEditModeGuard(() => this.onSplitOnHeading(2)),
    });

    this.addCommand({
      id: 'app:split-note-by-heading-h3',
      name: 'Split note by headings - H3',
      callback: () => this.onEditModeGuard(() => this.onSplitOnHeading(3)),
    });

    this.addSettingTab(new NoteRefactorSettingsTab(this.app, this));
  }

  onunload() {
    console.log("Unloading Note Refactor plugin");
  }

  onEditModeGuard(command: () => any): void {
    // const mdView = this.app.workspace.activeLeaf.view as MarkdownView;
    const mdView = xApp.workspace.getActiveViewOfType(MarkdownView);
    if (!mdView || mdView.getMode() !== 'source') {
      new Notification('Please use Note Refactor plugin in edit mode');
      return;
    } else {
      command();
    }
  }

  // --------------------------------------------------------------------------------------------------------

  async onSplitOnHeading(headingLevel: number): Promise<void> {
    const curNote = new ObsNote();
    const headingNotes = curNote.contentSplitByHeading(headingLevel);
    const dedupedFileNames = ensureUniqueFileNames(headingNotes);

    //TODO -> working here ...
    // TODO: read the origin tags and pass them to the created notes,
    // and then update the origin children with the new notes,
    // and remove the origin tags from the original note.

    // This will ensure that the links between the notes are preserved,
    // and that the origin note is not linked to the new notes as a child,
    // but rather as a sibling, which is more accurate in terms of the note structure after the split.

    headingNotes.forEach((hn, i) => {
      if (xApp.settings.updateFrontmatter) {
        const newNoteFm = xApp.settings.newNotesInheritOriginFields ? curNote.frontmatter.clone : {};
        if (xApp.settings.createTagForEachNewNote) {
          //newNoteFm!.addCaseInsensitive('tags', dedupedFileNames[i])
        }
        //newNoteFmStr
        curNote.createNoteWithFirstLineAsFileName(dedupedFileNames[i], hn, 'replace-headings', true)
      } else {
        curNote.createNoteWithFirstLineAsFileName(dedupedFileNames[i], hn, 'replace-headings', true)
      }
    });

    if (xApp.settings.updateFrontmatter) {
      // TODO: updateOriginChildren - this will be needed to update the origin children list.
      //this.NRDoc.updateOriginFrontmatter(originNote, contentToInsert);
    }
  }

  async onExtractSelectionFirstLine(mode: ReplaceMode): Promise<void> {
    const curNote = new ObsNote();
    const selectedContent = mode === 'split' ? curNote.noteRemainder() : curNote.selectedContent();
    if (selectedContent.length <= 0) { return }
    await curNote.createNoteWithFirstLineAsFileName(selectedContent[0], selectedContent, mode, false);
  }

  async onExtractSelectionAutogenerate(mode: ReplaceMode): Promise<void> {
    const curNote = new ObsNote();
    const selectedContent = mode === 'split' ? curNote.noteRemainder() : curNote.selectedContent();
    if (selectedContent.length <= 0) { return }
    await curNote.createAutogeneratedNote(selectedContent, mode, true); // Don't open a new note in a new pane. TODO: perhaps a setting would be useful?
  }

  onExtractSelectionContentOnly(mode: ReplaceMode): void {
    const curNote = new ObsNote();
    const selectedContent = mode === 'split' ? curNote.noteRemainder() : curNote.selectedContent();
    if (selectedContent.length <= 0) { return }
    this.loadModal(selectedContent, curNote, mode);
  }

  loadModal(contentArr: string[], curNote: ObsNote, mode: ReplaceMode): void {
    const content = curNote.noteContent(contentArr[0], contentArr.slice(1), true);
    const noteCreationModal = new NoteCreationModal(curNote, content, mode);
    new NoteRefactorModal(noteCreationModal).open();
  }
}

/* EOF */