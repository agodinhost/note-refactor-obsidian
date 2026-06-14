/* FrontMatter.ts */

import { TFile, FrontMatterCache } from 'obsidian';

import { FrontmatterFormat } from './settings';

import xApp from './xApp';

const fileExists = (file: TFile): boolean => {
    const entry = xApp.vault.getAbstractFileByPath(file.name);
    return entry instanceof TFile;
}

/**
 * Obsidian FrontMatter class.
 */
export default class FrontMatter {
    private _eol: string;
    private _file?: TFile;
    private _fm!: FrontMatterCache;

    constructor(eol: string, file: TFile, content?: string) {
        this._eol = eol;
        this._file = file;
        if (fileExists(file)) {
            this.loadFrontmatter(file);
            console.log(`FrontMatter from file = '${file?.name}'.`)
        } else {
            this._fm = this.extractFrontmatter(content!);
        }
    }

    async loadFrontmatter(file: TFile) {
        /**
         * We can rely on the fact that if metadataCache.getFileCache(file).frontmatter is non‑null, Obsidian has already validated that:
         * - The file starts with --- and has a closing ---
         * - The content between the --- delimiters is valid YAML according to js‑yaml.The block in between is valid YAML according to js‑yaml
         * - If the block is malformed (e.g. horizontal rules, random ---), Obsidian won’t populate frontmatter at all — you’ll get null
         */
        const cache = xApp.metadataCache.getFileCache(file);
        this._fm = { ...(cache?.frontmatter ?? {}) };
        if (xApp.settings.updateFrontmatter) this.log();
    }

    extractFrontmatter(content: string): FrontMatterCache {
        if (content == null) return {};

        const lines = content.split(this._eol);
        if (lines[0].trim() !== '---') return {};

        const endIndex = lines.findIndex((line, i) => i > 0 && line.trim() === '---');
        if (endIndex === -1) return {};

        let curKey: string | null = null;
        const fm: FrontMatterCache = {};
        const fmLines = lines.slice(1, endIndex);
        fmLines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            if (trimmed.startsWith('-') && curKey) {
                (fm[curKey] as string[]).push(trimmed.slice(1).trim());
                return;
            }

            const [key, ...rest] = trimmed.split(':');
            if (!key) return;

            const value = rest.join(':').trim();
            const k = key.trim();
            if (value === '') {
                /* multiline array list */
                fm[k] = [];
                curKey = k;
            } else if (value.startsWith('[') && value.endsWith(']')) {
                /* compact array with [] */
                const inner = value.slice(1, -1).trim();
                fm[k] = inner ? inner.split(',').map(v => v.trim()) : [];
                curKey = null;
            } else if (value.includes(',')) {
                /* inline array without [] */
                fm[k] = value.split(',').map(v => v.trim());
                curKey = null;
            } else {
                /* scalar value */
                fm[k] = value;
                curKey = null;
            }
        });

        Object.keys(fm).forEach(k => { if (Array.isArray(fm[k]) && fm[k].length === 0) delete fm[k]; });
        return fm;
    }

    /** Returns the frontmatter object */
    get frontMatter(): FrontMatterCache {
        return this._fm;
    }

    /** Returns a clone of our frontmatter */
    get clone(): FrontMatterCache {
        /* > node 17 */
        return structuredClone(this._fm);
    }

    /** Returns all fields as a plain object */
    get record(): Record<string, any> {
        return this._fm ? { ...this._fm } : {};
    }

    isEmpty(): boolean {
        return (
            !this._fm ||
            Object.keys(this._fm).length === 0 ||
            Object.values(this._fm).every(v => v === undefined || v === null || v === '')
        );
    }

    log(): void {
        if (!this._fm) {
            console.log('No frontmatter defined.');
            return;
        }
        for (const [key, value] of Object.entries(this._fm)) {
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

    /** Helper: find actual key name by case-insensitive match */
    private findCi(key: string): string | undefined {
        if (!this._fm) return undefined;
        const lower = key.toLowerCase();
        //TODO: would be better to have a linked list with all keys as lowercase ...
        return Object.keys(this._fm).find(k => k.toLowerCase() === lower);
    }

    /** Case-insensitive existence check */
    has(key: string): boolean {
        if (!this._fm) return false;
        return !!this.findCi(key);
    }

    //TODO: hasValue

    /** Case-insensitive lookup */
    get<T = any>(key: string): T | undefined {
        if (!this._fm) return undefined;
        const foundKey = this.findCi(key);
        return foundKey ? (this._fm[foundKey] as T) : undefined;
    }

    /** Case-insensitive update/add */
    set(key: string, value: any): void {
        if (!this._fm) return;
        const foundKey = this.findCi(key);
        const targetKey = foundKey ?? key;
        if (Array.isArray(this._fm[targetKey])) {
            (this._fm[targetKey] as any[]).push(...(Array.isArray(value) ? value : [value]));
        } else {
            this._fm[targetKey] = Array.isArray(value) ? [...value] : value;
        }
    }

    /** Case-insensitive removal */
    remove(key: string): void {
        if (!this._fm) return;
        const foundKey = this.findCi(key);
        if (foundKey) {
            delete this._fm[foundKey];
        }
    }

    getYaml(): string {
        if (!this._fm) return '';

        if (xApp.settings.frontmatterFormat === FrontmatterFormat.Normal) {
            return Object.entries(this._fm)
                .map(([key, value]) => {
                    if (Array.isArray(value)) {
                        const items = value.map(v => `  - ${v}`).join(this._eol);
                        return `${key}:${this._eol}${items}`;
                    } else {
                        return `${key}: ${value}`;
                    }
                })
                .join(this._eol);
        } else if (xApp.settings.frontmatterFormat === FrontmatterFormat.Compact) {
            return Object.entries(this._fm)
                .map(([key, value]) => {
                    if (Array.isArray(value)) {
                        return `${key}: [${value.join(', ')}]`;
                    } else {
                        return `${key}: ${value}`;
                    }
                })
                .join(', ');
        }

        return '';
    }

    /** Persists changes back to the file in the chosen format */
    async save(): Promise<void> {
        if (!this._file || !this._fm) return;

        const content = await xApp.vault.read(this._file);
        const lines = content.split(this._eol);
        /* TODO: acima, era /\r?\n/, continua funcionando? */

        /* Only consider frontmatter at the top */
        if (lines[0].trim() !== '---') return;
        const endIndex = lines.findIndex((line, i) => i > 0 && line.trim() === '---');
        if (endIndex === -1) return;

        const newContent = [
            '---',
            this.getYaml(),
            '---',
            ...lines.slice(endIndex + 1),
        ].join(this._eol);

        await xApp.vault.modify(this._file, newContent);
    }
}

/* EOF */