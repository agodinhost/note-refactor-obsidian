import { describe, expect, beforeAll, jest } from '@jest/globals';

import { App, MarkdownView } from '../tests/mocks/obsidian';

import xApp from '../src/xApp';
import * as xFile from '../src/xFile';
import ObsNote from '../src/ObsNote';

const newLocal = './tests/files/test-note-Linux-EOL.md';

let mockedApp: jest.Mocked<App>;
let note!: ObsNote;
let value!: string;
let content: string[];

const prepareMocks = async (start: number, end: number) => {
  mockedApp = new App() as any;
  const mdView = await new MarkdownView().loadContent(newLocal);
  (mockedApp.workspace.getActiveViewOfType as jest.Mock).mockReturnValue(mdView as any);
  xApp.init(mockedApp as any);

  note = new ObsNote();
  value = note.doc.getValue();
  content = xFile.toArray(value, start, end);
}

describe("Note content - Content Only", () => {

  beforeAll(async () => {
    await prepareMocks(0, 15);
  });

  it("First line content", () => {
    const noteContent = note.noteContent(content[0], content.slice(1), true);
    expect(xFile.firstLine(noteContent)).toBe("Hi there! I'm a note in your vault.");
  });

  it("Last line content", () => {
    const noteContent = note.noteContent(content[0], content.slice(1), true);
    expect(xFile.lastLine(noteContent)).toBe("- How to [[Working with multiple notes|open multiple files side by side]]");
  });

  it("Character count", () => {
    const noteContent = note.noteContent(content[0], content.slice(1), true);
    expect(noteContent.length).toBe(746);
  });

});

describe("Note content - Content Only - Normalize header levels", () => {

  beforeAll(async () => {
    await prepareMocks(42, 51);
    xApp.settings.normalizeHeaderLevels = true;
  });

  it("First line content", () => {
    const noteContent = note.noteContent(content[0], content.slice(1), true);
    expect(xFile.firstLine(noteContent)).toBe("# I have questions.");
  });

  it("Header 3 content", () => {
    const noteContent = note.noteContent(content[0], content.slice(1), true);
    expect(xFile.toArray(noteContent)[4]).toBe("## Header 3");
  });

  it("Last line content", () => {
    const noteContent = note.noteContent(content[0], content.slice(1), true);
    expect(xFile.lastLine(noteContent)).toBe("This is for testing normalizing header levels.");
  });

  it("Character count", () => {
    const noteContent = note.noteContent(content[0], content.slice(1), true);
    expect(noteContent.length).toBe(232);
  });

});

describe("Note content - First Line as File Name, exclude first line", () => {

  beforeAll(async () => {
    await prepareMocks(0, 15);
    xApp.settings.excludeFirstLineInNote = true;
  });

  it("First Line text", () => {
    const noteContent = note.noteContent(content[0], content.slice(1));
    expect(xFile.firstLine(noteContent)).toBe("At the same time, I'm also just a Markdown file sitting on your hard disk. It's all in plain text, so you don't need to worry about losing me in case [[Obsidian]] disappears one day.");
  });

  it("Last line text", () => {
    const noteContent = note.noteContent(content[0], content.slice(1));
    expect(xFile.lastLine(noteContent)).toBe("- How to [[Working with multiple notes|open multiple files side by side]]");
  });

  it("External links preserved", () => {
    const noteContent = note.noteContent(content[0], content.slice(1));
    expect(xFile.toArray(noteContent)[9]).toBe('- How to use [Markdown](https://www.markdownguide.org) to [[Format your notes]]');
  });

  it("Embeds preserved", () => {
    const noteContent = note.noteContent(content[0], content.slice(1));
    expect(xFile.toArray(noteContent)[7]).toBe('- How to ![[Create notes|create new notes]].');
  });

  it("Character count", () => {
    const noteContent = note.noteContent(content[0], content.slice(1));
    expect(noteContent.length).toBe(709);
  });

});

describe("Note content - First Line as File Name, first line as heading", () => {

  beforeAll(async () => {
    await prepareMocks(0, 15);
    xApp.settings.includeFirstLineAsNoteHeading = true;
    xApp.settings.headingFormat = '#';
  });

  it("First Line text", () => {
    const noteContent = note.noteContent(content[0], content.slice(1));
    expect(xFile.firstLine(noteContent)).toBe("# Hi there! I'm a note in your vault.");
  });

  it("Last line text", () => {
    const noteContent = note.noteContent(content[0], content.slice(1));
    expect(xFile.lastLine(noteContent)).toBe("- How to [[Working with multiple notes|open multiple files side by side]]");
  });

  it("External links preserved", () => {
    const noteContent = note.noteContent(content[0], content.slice(1));
    expect(xFile.toArray(noteContent)[11]).toBe('- How to use [Markdown](https://www.markdownguide.org) to [[Format your notes]]');
  });

  it("Embeds preserved", () => {
    const noteContent = note.noteContent(content[0], content.slice(1));
    expect(xFile.toArray(noteContent)[9]).toBe('- How to ![[Create notes|create new notes]].');
  });

  it("Character count", () => {
    const noteContent = note.noteContent(content[0], content.slice(1));
    expect(noteContent.length).toBe(748);
  });

});

describe("Note content - First Line as File Name, first line as heading (modified heading)", () => {

  beforeAll(async () => {
    await prepareMocks(4, 28);
    xApp.settings.includeFirstLineAsNoteHeading = true;
    xApp.settings.headingFormat = '#';
  });

  it("First Line text", () => {
    const noteContent = note.noteContent(content[0], content.slice(1));
    expect(xFile.firstLine(noteContent)).toBe("# Quick Start");
  });

  it("Last line text", () => {
    const noteContent = note.noteContent(content[0], content.slice(1));
    expect(xFile.lastLine(noteContent)).toBe("## Workflows");
  });

  it("Internal links preserved", () => {
    const noteContent = note.noteContent(content[0], content.slice(1));
    expect(xFile.toArray(noteContent)[9]).toBe('- [[Keyboard shortcuts]]');
  });

  it("External links preserved", () => {
    const noteContent = note.noteContent(content[0], content.slice(1));
    expect(xFile.toArray(noteContent)[18]).toBe('If you are a [Catalyst supporter](https://obsidian.md/pricing), and want to turn on Insider Builds, see [[Insider builds]].');
  });

  it("Embeds preserved", () => {
    const noteContent = note.noteContent(content[0], content.slice(1));
    expect(xFile.toArray(noteContent)[20]).toBe('![Obsidian.md](https://obsidian.md/images/screenshot.png)');
  });

  it("Character count", () => {
    const noteContent = note.noteContent(content[0], content.slice(1));
    expect(noteContent.length).toBe(1105);
  });

});
