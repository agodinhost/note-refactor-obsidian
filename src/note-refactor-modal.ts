/* note-refactor-modal.ts */

import { FuzzyMatch, FuzzySuggestModal, TFile } from 'obsidian';

import NoteCreationModal from './note-creation-modal';
import xApp from './xApp';

const EMPTY_TEXT = 'No files found to append content. Enter to create a new one.'
const PLACEHOLDER_TEXT = 'Type file to append to or create';
const instructions = [
    { command: '↑↓', purpose: 'to navigate' },
    { command: '↵', purpose: 'to append content to file' },
    { command: 'esc', purpose: 'to dismiss' }
];

export default class NoteRefactorModal extends FuzzySuggestModal<TFile> {
    noteCreationModal: NoteCreationModal;
    files: TFile[];
    newNoteResult: HTMLDivElement;
    suggestionEmpty: HTMLDivElement;
    obsFile: any;
    noSuggestion: boolean;

    constructor(noteCreationModal: NoteCreationModal) {
        super(xApp.app);
        this.noteCreationModal = noteCreationModal;
        this.init();
    }

    init() {
        this.files = xApp.vault.getMarkdownFiles();
        this.emptyStateText = EMPTY_TEXT;
        this.setPlaceholder(PLACEHOLDER_TEXT);
        this.setInstructions(instructions);
    }

    getItems(): TFile[] {
        const inputName = this.inputEl.value;
        if (inputName.length == 0 || this.files.filter(f => this.isMatch(f.path, inputName + '.md')).length > 0) {
            return this.files;
        }
        const newFile: TFile = { basename: this.inputEl.value, path: undefined, stat: undefined, vault: undefined, extension: undefined, parent: undefined, name: undefined };
        newFile.path = this.inputEl.value;
        return [newFile, ...this.files];
    }

    getItemText(item: TFile): string {
        this.noSuggestion = false;
        return item.path;
    }

    onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): void {
        if (this.noSuggestion || item.vault == undefined) {
            this.noteCreationModal.create(this.inputEl.value);
        } else {
            this.noteCreationModal.append(item);
        }
    }

    renderSuggestion(item: FuzzyMatch<TFile>, el: HTMLElement) {
        el.innerText = item.item.path.replace('.md', '');
        if (item.item.vault == undefined) {
            this.itemInstructionMessage(el, 'Enter to create new file');
        }
    }

    itemInstructionMessage(resultEl: HTMLElement, message: string) {
        const el = document.createElement('kbd');
        el.addClass('suggestion-hotkey');
        el.innerText = message;
        resultEl.appendChild(el);
    }

    isMatch(input: string, match: string) {
        return input.toLocaleLowerCase() == match.toLocaleLowerCase()
    }

}

/* EOF */