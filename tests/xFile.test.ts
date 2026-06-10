import { describe, expect, jest } from '@jest/globals';
import XFile, { EOLType } from '../src/xFile';

const TEST_FILE_WINDOWS_EOL = './tests/files/test-note-Windows-EOL.md';
const TEST_FILE_LINUX_EOL = './tests/files/test-note-Linux-EOL.md';
const TEST_FILE_MACINTOSH_EOL = './tests/files/test-note-Macintosh-EOL.md';

let content: string = '';
let eol: string = '';

describe("XFile tests", () => {

    it('Windows EOL ', async () => {
        content = await XFile.loadFileContent(TEST_FILE_WINDOWS_EOL);
        eol = XFile.getNoteEOL(content);
        expect(eol).toBe(EOLType.Windows);
    });

    it('Linux EOL ', async () => {
        content = await XFile.loadFileContent(TEST_FILE_LINUX_EOL);
        eol = XFile.getNoteEOL(content);
        expect(eol).toBe(EOLType.Linux);
    });

    it('Macintosh EOL ', async () => {
        content = await XFile.loadFileContent(TEST_FILE_MACINTOSH_EOL);
        eol = XFile.getNoteEOL(content);
        expect(eol).toBe(EOLType.Macintosh);
    });

    //---

    it('Mixed EOLs, case 1 ', () => {
        content = '1\n2\n3\n4\n5\n ';
        eol = XFile.getNoteEOL(content);
        expect(eol).toBe(EOLType.Linux);
    });

    it('Mixed EOLs, case 2 ', () => {
        content = '1\n2\n3\n4\n5\n 1\r\n2\r\n3\r\n4\r\n5\r\n6\r\n ';
        eol = XFile.getNoteEOL(content);
        expect(eol).toBe(EOLType.Windows);
    });

    it('Mixed EOLs, case 3 ', () => {
        content = '1\n2\n3\n4\n5\n 1\r\n2\r\n3\r\n4\r\n5\r\n6\r\n 1\r2\r3\r4\r5\r6\r7\r8\r9\r ';
        eol = XFile.getNoteEOL(content);
        expect(eol).toBe(EOLType.Macintosh);
    });

    // ---

    it('Unknown EOLs, case 1 ', () => {
        jest.spyOn(XFile, 'getSystemEOL').mockReturnValue(EOLType.Linux);
        content = '     ';
        eol = XFile.getNoteEOL(content);
        expect(eol).toBe(EOLType.Linux);
    });

    it('Unknown EOLs, case 2 ', () => {
        jest.spyOn(XFile, 'getSystemEOL').mockReturnValue(EOLType.Linux);
        content = '1\n2\n3\n4\n5\n 1\r\n2\r\n3\r\n4\r\n5\r\n 1\r2\r3\r4\r5\r ';
        eol = XFile.getNoteEOL(content);
        expect(eol).toBe(EOLType.Linux);
    });

});
