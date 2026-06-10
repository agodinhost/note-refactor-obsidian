import {
  App,
  PluginSettingTab,
  Setting
} from 'obsidian';
import { Location, NoteRelationType } from './settings';
import MomentDateRegex from './moment-date-regex';
import NoteRefactor from './main';

export class NoteRefactorSettingsTab extends PluginSettingTab {
  folderUPop = document.createElement('b');
  filePrefixUPop = document.createElement('b');
  momentDateRegex = new MomentDateRegex();
  plugin: NoteRefactor;
  //
  splitNewNotesAsSetting!: Setting;
  newNotesInheritOriginFieldsSetting!: Setting;
  newNotesFrontmatterComplementSetting!: Setting;
  newNotesFrontmatterIncludesSetting!: Setting;
  newNotesFrontmatterExcludesSetting!: Setting;
  createTagForEachNewNoteSetting!: Setting;

  constructor(app: App, plugin: NoteRefactor) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    this.folderUPop.className = this.filePrefixUPop.className = 'u-pop';

    new Setting(containerEl)
      .setName('Default location for new notes')
      .setDesc('Where newly created notes are placed.')
      .addDropdown(dropDown =>
        dropDown
          .addOption(Location[Location.VaultFolder], "Vault folder")
          .addOption(Location[Location.SameFolder], "Same folder as current file")
          .addOption(Location[Location.SpecifiedFolder], "In the folder specified below")
          .setValue(Location[this.plugin.settings.newFileLocation] || Location.VaultFolder.toString())
          .onChange((value: string) => {
            this.plugin.settings.newFileLocation = Location[value as keyof typeof Location];
            this.plugin.saveData(this.plugin.settings);
            this.display();
          }));

    if (this.plugin.settings.newFileLocation == Location.SpecifiedFolder) {
      new Setting(containerEl)
        .setName('Folder for new notes')
        .setDesc(this.folderDescriptionContent())
        .addTextArea((text) =>
          text
            .setPlaceholder("Example: folder 1/folder")
            .setValue(this.plugin.settings.customFolder)
            .onChange((value) => {
              this.plugin.settings.customFolder = value;
              this.plugin.saveData(this.plugin.settings);
              this.updateFolderUPop();
            }));
    }

    new Setting(containerEl)
      .setName('File name prefix')
      .setDesc(this.filenamePrefixDescriptionContent())
      .addTextArea((text) => {
        text
          .setPlaceholder("Example: {{date:YYYYMMDDHHmm}}-")
          .setValue(this.plugin.settings.fileNamePrefix || '')
          .onChange((value) => {
            this.plugin.settings.fileNamePrefix = value;
            this.plugin.saveData(this.plugin.settings);
            this.updateFileNamePrefixUPop();
          });
        text.inputEl.rows = 2;
        text.inputEl.cols = 25;
      });

    new Setting(containerEl)
      .setName('Transclude by default')
      .setDesc('When content has been extracted/split into a new note, include a transclusion of the new note')
      .addToggle(toggle => toggle.setValue(this.plugin.settings.transcludeByDefault)
        .onChange((value) => {
          this.plugin.settings.transcludeByDefault = value;
          this.plugin.saveData(this.plugin.settings);
        }));

    new Setting(containerEl)
      .setName('Note link template')
      .setDesc(this.tempalteDescriptionContent('The template used to generate the link to the extracted note. This overrides the Transclude by Default setting.'))
      .addTextArea((text) => {
        text
          .setPlaceholder("Example:\n\nSee also -> {{new_note_link}}")
          .setValue(this.plugin.settings.noteLinkTemplate || '')
          .onChange((value) => {
            this.plugin.settings.noteLinkTemplate = value;
            this.plugin.saveData(this.plugin.settings);
            return text;
          })
        text.inputEl.rows = 10;
        text.inputEl.cols = 25;
      });

    new Setting(containerEl)
      .setName('Refactored note template')
      .setDesc(this.tempalteDescriptionContent('The template used to generate the content for the refactored note.'))
      .addTextArea((text) => {
        text
          .setPlaceholder('Example:\n\n{{new_note_content}}\n\n---\nLink to original note: {{link}}')
          .setValue(this.plugin.settings.refactoredNoteTemplate || '')
          .onChange((value) => {
            this.plugin.settings.refactoredNoteTemplate = value;
            this.plugin.saveData(this.plugin.settings);
            return text;
          })
        text.inputEl.rows = 10;
        text.inputEl.cols = 25;
      });

    new Setting(containerEl)
      .setName('Exclude First Line')
      .setDesc('Prevent the first line of selected/split note content from being included in the new note (only applies for first line as file name commands)')
      .addToggle(toggle => toggle.setValue(this.plugin.settings.excludeFirstLineInNote)
        .onChange((value) => {
          this.plugin.settings.excludeFirstLineInNote = value;
          this.plugin.saveData(this.plugin.settings);
          this.display();
        }));

    new Setting(containerEl)
      .setName('Include Heading')
      .setDesc('Include first line of selected/split note content as note heading (applies for both first line as title and content only commands)')
      .addToggle(toggle => toggle.setValue(this.plugin.settings.includeFirstLineAsNoteHeading)
        .onChange((value) => {
          this.plugin.settings.includeFirstLineAsNoteHeading = value;
          this.plugin.saveData(this.plugin.settings);
          this.display();
        }));

    new Setting(containerEl)
      .setName('Open New Note')
      .setDesc('Open the new note in a new pane')
      .addToggle(toggle => toggle.setValue(this.plugin.settings.openNewNote)
        .onChange((value) => {
          this.plugin.settings.openNewNote = value;
          this.plugin.saveData(this.plugin.settings);
        }));

    if (this.plugin.settings.includeFirstLineAsNoteHeading) {
      new Setting(containerEl)
        .setName('Heading format')
        .setDesc('Set format of the heading to be included in note content')
        .addText((text) =>
          text
            .setPlaceholder("# or ##")
            .setValue(this.plugin.settings.headingFormat)
            .onChange((value) => {
              this.plugin.settings.headingFormat = value;
              this.plugin.saveData(this.plugin.settings);
            }));
    }

    new Setting(containerEl)
      .setName('Normalize heading levels')
      .setDesc('When content has been extracted/split into a new note, normalize the levels of the headings')
      .addToggle(toggle => toggle.setValue(this.plugin.settings.normalizeHeaderLevels)
        .onChange((value) => {
          this.plugin.settings.normalizeHeaderLevels = value;
          this.plugin.saveData(this.plugin.settings);
        }));

    /* fork settings */
    new Setting(containerEl)
      .setName('Update Frontmatter?')
      .setDesc('When content has been extracted/split into a new note, update the frontmatter children and parent fields to reflect the new note structure')
      .addToggle(toggle => toggle.setValue(this.plugin.settings.updateFrontmatter)
        .onChange((value) => {
          this.plugin.settings.updateFrontmatter = value;
          this.plugin.saveData(this.plugin.settings);
          this.refresh();
        }));

    this.splitNewNotesAsSetting = new Setting(containerEl)
      .setName("Create New Notes As")
      .setDesc("How to relate the new notes created during refactoring to the original note?")
      .addDropdown(dropdown => {
        dropdown
          .addOption(NoteRelationType.Child, "Child")
          .addOption(NoteRelationType.Sibling, "Sibling")
          .addOption(NoteRelationType.Friend, "Friend")
          .setValue(this.plugin.settings.splitNewNotesAs)
          .onChange((value) => {
            this.plugin.settings.splitNewNotesAs = value as NoteRelationType;
            this.plugin.saveData(this.plugin.settings);
            this.refresh();
          });
      });

    this.newNotesFrontmatterComplementSetting = new Setting(containerEl)
      .setName('New Notes Complement')
      .setDesc('This setting allows you to specify additional content to be added to the new notes created during refactoring. ' +
        'This will be used ONLY to complement the new notes as friends.')
      .addText((text) =>
        text
          .setPlaceholder('Friend, Left, Right')
          .setValue(this.plugin.settings.newNotesComplement)
          .onChange((value) => {
            this.plugin.settings.newNotesComplement = value;
            this.plugin.saveData(this.plugin.settings);
          }));

    this.newNotesInheritOriginFieldsSetting = new Setting(containerEl)
      .setName('New Notes Inherit Origin Fields?')
      .setDesc('When content has been extracted/split into a new note, inherit fields from the original note')
      .addToggle(toggle => toggle.setValue(this.plugin.settings.newNotesInheritOriginFields)
        .onChange((value) => {
          this.plugin.settings.newNotesInheritOriginFields = value;
          this.plugin.saveData(this.plugin.settings);
          this.refresh();
        }));

    this.newNotesFrontmatterIncludesSetting = new Setting(containerEl)
      .setName('New Notes Frontmatter Includes')
      .setDesc('This setting allows you to specify additional content to be included in the frontmatter of the new notes created during refactoring. ' +
        'This can be useful for adding specific metadata to the new notes, such as a tag, a category, or any other relevant information that can help to improve organization and searchability within the vault. '+
        'You can use the same placeholders as in the refactored note template setting. For example, if you want to add a tag with the name of the original note to the new notes, you can use the {{title}} placeholder like this: ' + 
        '#{{title}}  - this will create a tag with the name of the original note for each new note created during refactoring.')
      .addText((text) =>
        text
          .setPlaceholder('left, right')
          .setValue(this.plugin.settings.newNotesFrontmatterIncludes)
          .onChange((value) => {
            this.plugin.settings.newNotesFrontmatterIncludes = value;
            this.plugin.saveData(this.plugin.settings);
          }));

    this.newNotesFrontmatterExcludesSetting = new Setting(containerEl)
      .setName('New Notes Frontmatter Excludes')
      .setDesc('This setting allows you to specify content to be excluded from the frontmatter of the new notes created during refactoring. ' +
        'This can be useful for removing specific metadata from the new notes, such as a tag, a category, or any other relevant information that can help to improve organization and searchability within the vault. '+
        'You can use the same placeholders as in the refactored note template setting. For example, if you want to add a tag with the name of the original note to the new notes, you can use the {{title}} placeholder like this: ' + 
        '#{{title}}  - this will create a tag with the name of the original note for each new note created during refactoring.')
      .addText((text) =>
        text
          .setPlaceholder('up, down')
          .setValue(this.plugin.settings.newNotesFrontmatterExcludes)
          .onChange((value) => {
            this.plugin.settings.newNotesFrontmatterExcludes = value;
            this.plugin.saveData(this.plugin.settings);
          }));

    this.createTagForEachNewNoteSetting = new Setting(containerEl)
      .setName('Create a Tag For Each New Note?')
      .setDesc('When content has been extracted/split into a new note, create a tag for each new note')
      .addToggle(toggle => toggle.setValue(this.plugin.settings.createTagForEachNewNote)
        .onChange((value) => {
          this.plugin.settings.createTagForEachNewNote = value;
          this.plugin.saveData(this.plugin.settings);
        }));

    this.refresh();
  }
  
  refresh(): void {
    const stt = this.plugin.settings;
    const vis = stt.updateFrontmatter ? "" : "none";
    const visFriend = stt.updateFrontmatter && stt.splitNewNotesAs === NoteRelationType.Friend ? "" : "none";
    const visIncExc = stt.updateFrontmatter && stt.newNotesInheritOriginFields ? "" : "none";
    this.splitNewNotesAsSetting.settingEl.style.display = vis;
    this.newNotesFrontmatterComplementSetting.settingEl.style.display = visFriend;
    this.newNotesInheritOriginFieldsSetting.settingEl.style.display = vis;
    this.newNotesFrontmatterIncludesSetting.settingEl.style.display = visIncExc;
    this.newNotesFrontmatterExcludesSetting.settingEl.style.display = visIncExc;
    this.createTagForEachNewNoteSetting.settingEl.style.display = vis;
  }

  private tempalteDescriptionContent(introText: string): DocumentFragment {
    const descEl = document.createDocumentFragment();
    descEl.appendText(introText);
    descEl.appendChild(document.createElement('br'));
    descEl.appendText('Supported placeholders:');
    descEl.appendChild(document.createElement('br'));
    descEl.appendText('{{date}} {{title}} {{link}} {{new_note_title}} {{new_note_link}} {{new_note_content}}');
    return descEl;
  }

  private folderDescriptionContent(): DocumentFragment {
    const descEl = document.createDocumentFragment();
    descEl.appendText('Newly created notes will appear under this folder.');
    descEl.appendChild(document.createElement('br'));
    descEl.appendText('For more syntax, refer to ');
    this.dateFormattingDescription(descEl);
    descEl.appendText('Your current folder path syntax looks like this:');
    descEl.appendChild(document.createElement('br'));
    this.updateFolderUPop()
    descEl.appendChild(this.folderUPop);
    return descEl;
  }

  private updateFolderUPop() {
    this.folderUPop.innerText = this.momentDateRegex.replace(this.plugin.settings.customFolder);
  }

  private filenamePrefixDescriptionContent(): DocumentFragment {
    const descEl = document.createDocumentFragment();
    descEl.appendText('Newly created notes will have this prefix');
    descEl.appendChild(document.createElement('br'));
    this.dateFormattingDescription(descEl);
    descEl.appendText('Your current file name prefix syntax looks like this:');
    descEl.appendChild(document.createElement('br'));
    this.updateFileNamePrefixUPop();
    descEl.appendChild(this.filePrefixUPop);
    return descEl;
  }

  private dateFormattingDescription(descEl: DocumentFragment) {
    descEl.appendText('Date formats are supported {{date:YYYYMMDDHHmm}}');
    descEl.appendChild(document.createElement('br'));
    descEl.appendText('and used with current date and time when note is created.');
    descEl.appendChild(document.createElement('br'));
    descEl.appendText('For more syntax, refer to ');
    this.addMomentDocsLink(descEl);
  }

  private updateFileNamePrefixUPop() {
    this.filePrefixUPop.innerText = this.momentDateRegex.replace(this.plugin.settings.fileNamePrefix);
  }

  private addMomentDocsLink(descEl: DocumentFragment) {
    const a = document.createElement('a');
    a.href = 'https://momentjs.com/docs/#/displaying/format/';
    a.text = 'format reference';
    a.target = '_blank';
    descEl.appendChild(a);
    descEl.appendChild(document.createElement('br'));
  }
}