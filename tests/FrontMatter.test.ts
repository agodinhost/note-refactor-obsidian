import { describe, expect, beforeAll, jest } from '@jest/globals';

import { App, MarkdownView } from './mocks/obsidian';

import xApp from '../src/xApp';
import ObsNote from '../src/ObsNote';

let mockedApp: jest.Mocked<App>;
let note!: ObsNote;
let value!: string;

const prepareMocks = (content: string) => {
  mockedApp = new App() as any;
  const mdView = new MarkdownView().setContent(content);
  (mockedApp.workspace.getActiveViewOfType as jest.Mock).mockReturnValue(mdView as any);
  xApp.init(mockedApp as any);

  note = new ObsNote();
  value = note.doc.getValue();
}

//TODO: existing files.
//TODO: new files.

describe('Frontmatter - no frontmatter, no content', () => {

  beforeAll(() => {
    prepareMocks('');
  });

  it('No frontmatter', () => {
    const yaml = note.frontmatter.getYaml();
    expect(yaml).toBe('');
  });

});

describe('Frontmatter - no frontmatter, some content', () => {

  beforeAll(() => {
    prepareMocks('# heading one\n\nsome text');
  });

  it('Some content', () => {
    const yaml = note.frontmatter.getYaml();
    expect(yaml).toBe('');
  });

});

describe('Frontmatter - some frontmatter, no content', () => {

  beforeAll(() => {
    prepareMocks('---\ntags: [tag1,tag2,tag3]\n---\ntext-line1\ntext-line2\n');
  });

  it('Some frontmatter', () => {
    const yaml = note.frontmatter.getYaml();
    expect(yaml).toBe('tags: [tag1, tag2, tag3]');
  });

});

describe('Frontmatter - some frontmatter 2, no content', () => {

  beforeAll(() => {
    prepareMocks('---\ntags: [tag1,tag2,tag3]\n\nparent: parent_doc\nnoValue\n\n---\ntext-line1\ntext-line2\n');
  });

  it('Some frontmatter 2', () => {
    const yaml = note.frontmatter.getYaml();
    expect(yaml).toBe('tags: [tag1, tag2, tag3], parent: parent_doc');
  });

});

describe('Frontmatter - frontmatter manipulation', () => {

  beforeAll(() => {
    prepareMocks('---\ntags: [tag1,tag2,tag3]\n\nparent: parent_doc\n\n---\ntext-line1\ntext-line2\n');
  });

  it('Some frontmatter 2', () => {
    const fm = note.frontmatter;

    const yaml = fm.getYaml();
    expect(yaml).toBe('tags: [tag1, tag2, tag3], parent: parent_doc');

    expect(fm.isEmpty()).toBeFalsy();

    fm.set('Tags', 'tag4');
    fm.set('topic', 'test-topic');

    const yaml2 = fm.getYaml();
    expect(yaml2).toBe('tags: [tag1, tag2, tag3, tag4], parent: parent_doc, topic: test-topic');

    expect(fm.has('tags')).toBeTruthy();
    expect(fm.has('Tags')).toBeTruthy();
    expect(fm.has('tagS')).toBeTruthy();

    expect(fm.has('topic')).toBeTruthy();
    fm.remove('topic');
    expect(fm.has('topic')).toBeFalsy();

    expect(fm.has('tags')).toBeTruthy();

    const fmClone = fm.clone();
    expect(fm).not.toEqual(fmClone);


  });

});
