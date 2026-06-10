import { describe, expect, beforeAll, afterAll } from '@jest/globals';
import XFile, { EOLType } from '../src/xFile';

const TEST_FILE_WINDOWS_EOL = './tests/files/test-note-Windows-EOL.md';

let fileContents: string = '';
let eol: string = '';
let content: string = '';

describe("XFile tests", () => {

    beforeAll(async () => {
        fileContents = await XFile.loadFileContent(TEST_FILE_WINDOWS_EOL);
    });

    it("Windows EOL ", () => {
        eol = XFile.getNoteEOL(fileContents);
        expect(eol).toBe(EOLType.Windows);
    });

});