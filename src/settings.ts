/* settings.ts */

import { HEADING_FORMAT } from './constants';

export class NoteRefactorSettings {
    includeFirstLineAsNoteHeading: boolean = false;
    excludeFirstLineInNote: boolean = false;
    openNewNote: boolean = true;
    headingFormat: string = HEADING_FORMAT;
    newFileLocation: Location = Location.VaultFolder;
    customFolder: string = '';
    fileNamePrefix: string = '';
    transcludeByDefault: boolean = false;
    noteLinkTemplate: string = '';
    refactoredNoteTemplate: string = '';
    normalizeHeaderLevels: boolean = false;

    /* fork:
     * 1. we are ignoring inline fields, they are contextual and they will be moved to the new notes accordingly.
     * 2. we are ignoring comments, the same way as inline fields, they are contextual and will be moved to the new notes accordingly.
     * 3. we are ignoring the frontmatter - that's why we wrote the code below. 
     */

    updateFrontmatter: boolean = false;
    /* This setting determines whether to update the frontmatter of the original and new notes after refactoring.
     * If true, the plugin will attempt to update the the origin and new notes frontmatter.
     * When disabled, the plugin will not make any changes into the original and new notes frontmatter.
     */

    frontmatterFormat: FrontmatterFormat = FrontmatterFormat.Compact;
    /* This setting determines how to write the frontmatter.
     */

    splitNewNotesAs: NoteRelationType = NoteRelationType.Child;
    /* This setting determines how to relate the new notes created during refactoring to the original note.
     * The options are:
     * - As Children: the origin note will have the children list pointing to each new note and all new notes will have the parent field pointing to the original note.
     * - As Siblings: the origin and new notes will have all the same parent.
     * - As Friends: TODO - the refactored notes will be created as friends of the original note, using a specific field - Obsidian's dataview plugin infers Friends based on links between notes.
     * This help to maintain a clear hierarchy between related notes.
     */

    newNotesComplement: string = '';
    /* This setting allows you to specify additional content to be added to the new notes created during refactoring.
     * This can be useful for adding context or metadata to the new notes, such as a link back to the original note, a tag, or any other relevant information that can help to maintain connections between related notes and improve organization within the vault.
     */

    newNotesInheritOriginFields: boolean = true;
    /* This setting determines whether to inherit fields from the original note when creating new notes during refactoring.
     * If true, the plugin will attempt to copy any fields found in the original note to the new notes created during refactoring, which can help to maintain consistency and organization across related notes.
     */

    newNotesFrontmatterIncludes: string = '';
    /* This setting allows you to specify additional content to be included in the frontmatter of the new notes created during refactoring.
     * This can be useful for adding specific metadata to the new notes, such as a tag, a category, or any other relevant information that can help to improve organization and searchability within the vault.
     */

    newNotesFrontmatterExcludes: string = '';
    /* This setting allows you to specify content to be excluded from the frontmatter of the new notes created during refactoring.
     * This can be useful for preventing certain metadata from being copied to the new notes, such as a specific tag, a category, or any other relevant information that may not be relevant or appropriate for the new notes, which can help to maintain clarity and organization within the vault.
     */
 
    createTagForEachNewNote: boolean = false;
    /* This setting determines whether to create a tag for each new note created during refactoring.
     * If true, the plugin will create a tag for each new note, which can help to improve organization and searchability within the vault by allowing you to easily identify and group related notes.
     * The name of the tag can be customized using the newNotesTagPrefix setting, which allows you to specify a prefix for the tags created for new notes.
     */
}
  
export enum Location {
    VaultFolder,
    SameFolder,
    SpecifiedFolder
}

export enum FrontmatterFormat {
  Normal = 'Normal',
  Compact = 'Compact'
}

export enum NoteRelationType {
  Parent = 'parent',
  Child = 'Child',
  Sibling = 'Sibling',
  Friend = 'Friend'
}

export enum EOLType {
  Windows = '\r\n',
  Linux = '\n',
  Macintosh = '\r'
}

export type ReplaceMode = 'split' | 'replace-selection' | 'replace-headings';

export class NotePlaceholders {
    newNoteTitle = new Placeholder('new_note_title');
    newNoteLink = new Placeholder('new_note_link');
    newNotePath = new Placeholder('new_note_path');
    newNotePathEncoded = new Placeholder('new_note_path_encoded');
    newNoteContent = new Placeholder('new_note_content');
    title = new Placeholder('title');
    link = new Placeholder('link');
}

export class Placeholder {
    key: string;

    constructor(key: string) {
        this.key = key;
    }

    replace(input: string, value: string): string {
        return input.replace(new RegExp(`\{\{${this.key}\}\}`, 'gmi'), () => value);
    }
}

/* EOF */