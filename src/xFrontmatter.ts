import { App, TFile, FrontMatterCache } from "obsidian";
import yaml from "js-yaml";

export type FrontmatterFormat = "normal" | "compact";

export default class XFrontmatter {
    private app: App;
    private file: TFile;
    private eol: string | null;
    private frontmatter: FrontMatterCache | null;
    private format: FrontmatterFormat;

    constructor(app: App, file: TFile, eol: string |null = null, format: FrontmatterFormat = "normal") {
        this.app = app;
        this.file = file;
        this.eol = eol;
        this.format = format;
        /**
         * We can rely on the fact that if metadataCache.getFileCache(file).frontmatter is non‑null, Obsidian has already validated that:
         * - The file starts with --- and has a closing ---
         * - The content between the --- delimiters is valid YAML according to js‑yaml.The block in between is valid YAML according to js‑yaml
         * - If the block is malformed (e.g. horizontal rules, random ---), Obsidian won’t populate frontmatter at all — you’ll get null
         */
        const cache = this.app.metadataCache.getFileCache(file);
        this.frontmatter = cache?.frontmatter ?? null;
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
        if (!this.frontmatter) return;
        const foundKey = this.findKeyInsensitive(key);
        if (foundKey) {
            this.frontmatter[foundKey] = value; // preserve original case
        } else {
            this.frontmatter[key] = value; // new key, keep case as provided
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
        if (!this.frontmatter) return;

        const content = await this.app.vault.read(this.file);
        const lines = content.split(/\r?\n/);

        // Only consider frontmatter at the top
        if (lines[0].trim() !== "---") return;
        const endIndex = lines.findIndex((line, i) => i > 0 && line.trim() === "---");
        if (endIndex === -1) return;

        let fmBlock: string;

        if (this.format === "normal") {
            fmBlock = yaml.dump(this.frontmatter, { lineWidth: -1 }).trim();
        } else {
            fmBlock = Object.entries(this.frontmatter)
                .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
                .join(", ");
        }

        const newContent = [
            "---",
            fmBlock,
            "---",
            ...lines.slice(endIndex + 1),
        ].join("\n");

        await this.app.vault.modify(this.file, newContent);
    }
}
