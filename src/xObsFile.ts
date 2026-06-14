/* xObsFile.ts */

import { normalizePath, MarkdownView } from 'obsidian';

import { Location } from './settings';

import xApp from './xApp';
import { replaceDateMask } from './xDateFns';

export const filePath = (
    view: any
): string => {
    let path = '';
    switch (xApp.settings.newFileLocation) {
        case Location.VaultFolder:
            path = xApp.vault.getRoot().path;
            break;
        case Location.SameFolder:
            path = view.file.parent.path;
            break;
        case Location.SpecifiedFolder:
            path = replaceDateMask(xApp.settings.customFolder);
            break;
    }
    return normalizePath(path);
};

export const filePathAndFileName = (
    fileName: string,
    view: any
): string =>
    normalizePath(`${filePath(view)}/${fileName}.md`);

export const createOrAppendFile = async (
    fileName: string,
    note: string
): Promise<string | undefined> => {
    const view = xApp.workspace.getActiveViewOfType(MarkdownView);
    if (!view) throw new Error('No current file selected');

    const folderPath = filePath(view);
    const fullPath = filePathAndFileName(fileName, view);

    const folderExists = await xApp.vault.adapter.exists(folderPath, false);
    if (!folderExists) {
        const folders = folderPath.split('/');
        try {
            await createFoldersFromVaultRoot('', folders);
        } catch (error) {
            console.error(error);
        }
    }

    try {
        const fileExists = await xApp.vault.adapter.exists(fullPath);
        if (fileExists) {
            await appendFile(fullPath, note);
        } else {
            await xApp.vault.create(fullPath, note);
        }
        return fullPath;
    } catch (error) {
        console.error(error);
    }
};

export const appendFile = async (
    filePath: string,
    note: string
): Promise<void> => {
    let existingContent = await xApp.vault.adapter.read(filePath);
    if (existingContent.length > 0) {
        existingContent = existingContent + '\r\r';
    }
    await xApp.vault.adapter.write(filePath, existingContent + note);
};

export const createFoldersFromVaultRoot = async (
    parentPath: string,
    folders: string[]
): Promise<void> => {
    if (folders.length === 0) return;

    const newFolderPath = normalizePath([parentPath, folders[0]].join('/'));
    const folderExists = await xApp.vault.adapter.exists(newFolderPath, false);
    folders.shift();

    if (folderExists) {
        await createFoldersFromVaultRoot(newFolderPath, folders);
    } else {
        await xApp.vault.createFolder(newFolderPath);
        await createFoldersFromVaultRoot(newFolderPath, folders);
    }
};

/* EOF */