/* FrontMatter.ts */

import { TFile, FrontMatterCache } from 'obsidian';

import { FrontmatterFormat } from './settings';

import xApp from './xApp';

import yaml from 'js-yaml';

/**
 * Obsidian FrontMatter utility façade.
 */
export default class XFrontMatter {
    private eol: string;
    private file: TFile | null | undefined;
    private frontmatter: FrontMatterCache;

    constructor(eol: string, file?: TFile | null) {
        this.eol = eol;
        this.file = file;
        if (file) {
            /**
             * We can rely on the fact that if metadataCache.getFileCache(file).frontmatter is non‑null, Obsidian has already validated that:
             * - The file starts with --- and has a closing ---
             * - The content between the --- delimiters is valid YAML according to js‑yaml.The block in between is valid YAML according to js‑yaml
             * - If the block is malformed (e.g. horizontal rules, random ---), Obsidian won’t populate frontmatter at all — you’ll get null
             */
            const cache = xApp.metadataCache.getFileCache(file);
            this.frontmatter = cache?.frontmatter ?? {};
        } else {
            this.frontmatter = {};
        }
        if (xApp.settings.updateFrontmatter) this.log();
    }

    isEmpty(): boolean {
        return (
            !this.frontmatter ||
            Object.keys(this.frontmatter).length === 0 ||
            Object.values(this.frontmatter).every(v => v === undefined || v === null || v === '')
        );
    }

    log(): void {
        if (!this.frontmatter) {
            console.log("No frontmatter defined.");
            return;
        }
        for (const [key, value] of Object.entries(this.frontmatter)) {
            if (Array.isArray(value)) {
                console.log(`Key: ${key} | Value (array):`);
                value.forEach((item, index) => {
                    console.log(`  [${index}] ${item}`);
                });
            } else {
                console.log(`Key: ${key} | Value (string): ${value}`);
            }
        }
    }

    /** Returns the raw frontmatter object */
    getRaw(): FrontMatterCache | null {
        return this.frontmatter;
    }

    /** Returns a clone of our frontmatter */
    getClone(): FrontMatterCache | null {
        /* > node 17 */
        return structuredClone(this.frontmatter);
    }

    /** Returns all fields as a plain object */
    getAll(): Record<string, any> {
        return this.frontmatter ? { ...this.frontmatter } : {};
    }

    /** Helper: find actual key name by case-insensitive match */
    private findKeyInsensitive(key: string): string | undefined {
        if (!this.frontmatter) return undefined;
        const lower = key.toLowerCase();
        return Object.keys(this.frontmatter).find(k => k.toLowerCase() === lower);
    }

    /** Case-insensitive existence check */
    hasField(key: string): boolean {
        if (!this.frontmatter) return false;
        return !!this.findKeyInsensitive(key);
    }

    /** Case-insensitive lookup */
    getField<T = any>(key: string): T | undefined {
        if (!this.frontmatter) return undefined;
        const foundKey = this.findKeyInsensitive(key);
        return foundKey ? (this.frontmatter[foundKey] as T) : undefined;
    }

    /** Case-insensitive update/add */
    setField(key: string, value: any): void {
        if (this.frontmatter) {
            const foundKey = this.findKeyInsensitive(key);
            if (foundKey) {
                this.frontmatter[foundKey] = value; // preserve original case
            } else {
                this.frontmatter[key] = value; // new key, keep case as provided
            }
        } else {
            //TODO - implement ...
        }
    }

    /** Case-insensitive removal */
    removeField(key: string): void {
        if (!this.frontmatter) return;
        const foundKey = this.findKeyInsensitive(key);
        if (foundKey) {
            delete this.frontmatter[foundKey];
        }
    }

    /** Persists changes back to the file in the chosen format */
    async saveChanges(): Promise<void> {
        if (!this.file || !this.frontmatter) return;

        const content = await xApp.vault.read(this.file);
        const lines = content.split(this.eol);
        /* TODO: acima, era /\r?\n/, continua funcionando? */

        /* Only consider frontmatter at the top */
        if (lines[0].trim() !== '---') return;
        const endIndex = lines.findIndex((line, i) => i > 0 && line.trim() === '---');
        if (endIndex === -1) return;

        const fmBlock = xApp.settings.frontmatterFormat === FrontmatterFormat.Normal ?
            yaml.dump(this.frontmatter, { lineWidth: -1 }).trim() :
            Object.entries(this.frontmatter)
                .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
                .join(', ');

        const newContent = [
            '---',
            fmBlock,
            '---',
            ...lines.slice(endIndex + 1),
        ].join(this.eol);

        await xApp.vault.modify(this.file, newContent);
    }
}

/* EOF */