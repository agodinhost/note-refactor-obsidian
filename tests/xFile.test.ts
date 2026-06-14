import { describe, expect, beforeAll, afterAll, jest } from '@jest/globals';

import { EOLType } from '../src/settings';

import xApp from '../src/xApp';
import * as xFile from '../src/xFile';

const fixedDate = new Date(2020, 11, 25, 11, 17, 52);

const TEST_FILE_WINDOWS_EOL = './tests/files/test-note-Windows-EOL.md';
const TEST_FILE_LINUX_EOL = './tests/files/test-note-Linux-EOL.md';
const TEST_FILE_MACINTOSH_EOL = './tests/files/test-note-Macintosh-EOL.md';

describe("File Name Prefix", () => {

    beforeAll(async () => {
        jest.useFakeTimers();
        jest.setSystemTime(fixedDate);
        xApp.init();
    });

    it("Correct prefix for yyyyMMddHHmm", () => {
        xApp.settings.fileNamePrefix = '{{date:yyyyMMddHHmm}}-';
        const prefix = xFile.fileNamePrefix();
        expect(prefix).toBe('202012251117-');
    });

    it("Correct prefix for yyyyMMddHHmmss", () => {
        xApp.settings.fileNamePrefix = '{{date:yyyyMMddHHmmss}}-';
        const prefix = xFile.fileNamePrefix();
        expect(prefix).toBe('20201225111752-');
    });

    it("Correct prefix for word dates yyyy-MMMM-do_EEEE", () => {
        xApp.settings.fileNamePrefix = '{{date:yyyy-MMMM-do_EEEE}}-';
        const prefix = xFile.fileNamePrefix();
        expect(prefix).toBe('2020-December-25th_Friday-');
    });

    it("Correct prefix for with text and date", () => {
        xApp.settings.fileNamePrefix = 'ZK_{{date:yyyyMMddHHmm}}-';
        const prefix = xFile.fileNamePrefix();
        expect(prefix).toBe('ZK_202012251117-');
    });

    it("No date in prefix", () => {
        xApp.settings.fileNamePrefix = 'Inbox-Note-';
        const prefix = xFile.fileNamePrefix();
        expect(prefix).toBe('Inbox-Note-');
    });

    it("No prefix", () => {
        xApp.settings.fileNamePrefix = '';
        const prefix = xFile.fileNamePrefix();
        expect(prefix).toBe('');
    });

    afterAll(() => {
        jest.useRealTimers();
    });
});

describe("File Name Sanitisation", () => {
    let fileName = '';

    beforeAll(async () => {
        jest.useFakeTimers();
        jest.setSystemTime(fixedDate);
        xApp.init();
    });

    it("No sanitisation should be required", () => {
        fileName = '-- This should be allowed & (e.g. £$\'=)';
        const sanitised = xFile.sanitisedFileName(fileName);
        expect(sanitised).toBe(fileName);
    });

    it("Expected internal link sanitisation", () => {
        fileName = '[[Internal Link]] to something';
        const sanitised = xFile.sanitisedFileName(fileName);
        expect(sanitised).toBe('Internal Link to something');
    });

    it("Expected external link sanitisation", () => {
        fileName = '[Obsidian](https://en.wikipedia.org/wiki/Obsidian)';
        const sanitised = xFile.sanitisedFileName(fileName);
        expect(sanitised).toBe('Obsidian(httpsen.wikipedia.orgwikiObsidian)');
    });

    it("Heading sanitisation", () => {
        fileName = '## A Heading Goes Here';
        const sanitised = xFile.sanitisedFileName(fileName);
        expect(sanitised).toBe('A Heading Goes Here');
    });

    it("Illegal file path character sanitisation (*\"\/<>:|?", () => {
        fileName = '**This has**\\/ "a lot" of <illegal>: |characters??|';
        const sanitised = xFile.sanitisedFileName(fileName);
        expect(sanitised).toBe('This has a lot of illegal characters');
    });

    it("Should include prefix", () => {
        fileName = '## A Heading Goes Here';
        xApp.settings.fileNamePrefix = 'ZK-{{date:yyyy-MMM-dd-HHmm}}-';
        const sanitised = xFile.sanitisedFileName(fileName);
        expect(sanitised).toBe('ZK-2020-Dec-25-1117-A Heading Goes Here');
    });

    it("Idempotent sanitisation with no duplicate prefixes", () => {
        fileName = '## A Heading Goes Here';
        xApp.settings.fileNamePrefix = 'ZK-{{date:yyyy-MMM-dd-HHmm}}-';
        let sanitised = xFile.sanitisedFileName(fileName);
        sanitised = xFile.sanitisedFileName(sanitised);
        sanitised = xFile.sanitisedFileName(sanitised);
        expect(sanitised).toBe('ZK-2020-Dec-25-1117-A Heading Goes Here');
    });

    afterAll(() => {
        jest.useRealTimers();
    });
});

describe("Regression - Issue #84 - File Name Duplication Protection", () => {
    let fileNames = [
        ["## Duplicate Heading", "Some text"],
        ["#### Some other heading", "Paragraph text", "", "Another paragraph"],
        ["### Test", "", "Sentence 7"],
        ["### Another test", "", "Sentence text"],
        ["## Duplicate Heading", "", "More text under heading"],
        ["# Test", "", "Testing"],
    ];

    beforeAll(async () => {
        jest.useFakeTimers();
        jest.setSystemTime(fixedDate);
        xApp.init();
    });

    it("Should return expected count", () => {
        const deduped = xFile.ensureUniqueFileNames(fileNames);
        expect(deduped.length).toBe(6);
    });

    it("Should sanitised filenames", () => {
        const deduped = xFile.ensureUniqueFileNames(fileNames);
        const includingHash = deduped.filter(d => d[0].includes("#"));
        expect(includingHash.length).toBe(0);
    });

    it("First duplicate should have unchanged filename", () => {
        const deduped = xFile.ensureUniqueFileNames(fileNames);
        expect(deduped[0]).toBe("Duplicate Heading");
    });

    it("Second duplicate should have filename with incremented number", () => {
        const deduped = xFile.ensureUniqueFileNames(fileNames);
        expect(deduped[4]).toBe("Duplicate Heading2");
    });

    it("Duplicate should have filename with incremented number regardless of heading level", () => {
        const deduped = xFile.ensureUniqueFileNames(fileNames);
        expect(deduped[5]).toBe("Test2");
    });

    afterAll(() => {
        jest.useRealTimers();
    });

});

describe("XFile tests", () => {
    let content: string = '';
    let eol: string = '';
    xApp.init();

    it('Windows EOL ', async () => {
        content = await xFile.loadFileContent(TEST_FILE_WINDOWS_EOL);
        eol = xFile.getNoteEOL(content);
        expect(eol).toBe(EOLType.Windows);
    });

    it('Linux EOL ', async () => {
        content = await xFile.loadFileContent(TEST_FILE_LINUX_EOL);
        eol = xFile.getNoteEOL(content);
        expect(eol).toBe(EOLType.Linux);
    });

    it('Macintosh EOL ', async () => {
        content = await xFile.loadFileContent(TEST_FILE_MACINTOSH_EOL);
        eol = xFile.getNoteEOL(content);
        expect(eol).toBe(EOLType.Macintosh);
    });

    //---

    it('Mixed EOLs, case 1 ', () => {
        content = '1\n2\n3\n4\n5\n ';
        eol = xFile.getNoteEOL(content);
        expect(eol).toBe(EOLType.Linux);
    });

    it('Mixed EOLs, case 2 ', () => {
        content = '1\n2\n3\n4\n5\n 1\r\n2\r\n3\r\n4\r\n5\r\n6\r\n ';
        eol = xFile.getNoteEOL(content);
        expect(eol).toBe(EOLType.Windows);
    });

    it('Mixed EOLs, case 3 ', () => {
        content = '1\n2\n3\n4\n5\n 1\r\n2\r\n3\r\n4\r\n5\r\n6\r\n 1\r2\r3\r4\r5\r6\r7\r8\r9\r ';
        eol = xFile.getNoteEOL(content);
        expect(eol).toBe(EOLType.Macintosh);
    });

    // ---

    it('Unknown EOLs, case 1 ', () => {
        jest.spyOn(xFile, 'getSystemEOL').mockReturnValue(EOLType.Linux);
        content = '     ';
        eol = xFile.getNoteEOL(content);
        expect(eol).toBe(EOLType.Linux);
    });

    it('Unknown EOLs, case 2 ', () => {
        jest.spyOn(xFile, 'getSystemEOL').mockReturnValue(EOLType.Linux);
        content = '1\n2\n3\n4\n5\n 1\r\n2\r\n3\r\n4\r\n5\r\n 1\r2\r3\r4\r5\r ';
        eol = xFile.getNoteEOL(content);
        expect(eol).toBe(EOLType.Linux);
    });

});
