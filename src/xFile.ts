/* xFile.ts */

import { Editor } from 'obsidian';

import { FILE_NAME_REGEX } from './constants';
import { EOLType } from './settings';

import { replaceDateMask } from './xDateFns';

import xApp from './xApp';

import os from 'os';

//TODO: refactor, remove this funcion
import { promises as fs } from 'fs';
export const loadFileContent = async (file: string): Promise<string> => {
    return await fs.readFile(file, "utf8");
};

export const getSystemEOL = (): string => os.EOL;

export const getNoteEOL = (note: string): string => {
    const counts: Record<string, number> = {
        [EOLType.Windows]: (note.match(/\r\n/g) || []).length,
        [EOLType.Linux]: (note.match(/(?<!\r)\n/g) || []).length,
        [EOLType.Macintosh]: (note.match(/\r(?!\n)/g) || []).length,
    };

    const entries = Object.entries(counts);
    const mostFreq = Math.max(...entries.map(([_, c]) => c));
    if (mostFreq === 0) return getSystemEOL();

    const score = entries.filter(([_, c]) => c === mostFreq);
    return score.length === 1 ? score[0][0] : getSystemEOL();
};

//TODO: remove!
export const getEditorEOL = (doc: Editor): string => {
    return getNoteEOL(doc.getValue());
};

export const fileNamePrefix = (): string => {
    return xApp.settings.fileNamePrefix ? replaceDateMask(xApp.settings.fileNamePrefix) : '';
};

export const sanitisedFileName = (unsanitisedFilename: string): string => {
    const prefix = fileNamePrefix();
    const checkedPrefix = unsanitisedFilename.startsWith(prefix) ? '' : prefix;
    return (
        checkedPrefix +
        unsanitisedFilename.replace(FILE_NAME_REGEX, "").trim().slice(0, 255)
    );
};

export const ensureUniqueFileNames = (headingNotes: string[][]): string[] => {
    const fileNames: string[] = [];
    return headingNotes.map((hn) => {
        const fileName = sanitisedFileName(hn[0]);
        const duplicates = fileNames.filter((fn) => fn === fileName);
        fileNames.push(fileName);
        return duplicates.length >= 1
            ? `${fileName}${duplicates.length + 1}`
            : fileName;
    });
};

export const splitLines = (note: string): string[] => {
    return note.split(getNoteEOL(note));
};

export const toArray = (note: string, start?: number, end?: number): string[] => {
    return note.split(getNoteEOL(note)).slice(start, end);
};

export const firstLine = (note: string): string => {
    return note.split(getNoteEOL(note))[0];
};

export const lastLine = (note: string): string => {
    const items = note.split(getNoteEOL(note));
    return items[items.length - 1];
};

/* EOF */