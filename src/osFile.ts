import { promises as fs } from 'fs';
import os from "os";

export default class OSFile {

    async loadFileContent(file: string): Promise<string> {
      return await fs.readFile(file, 'utf8');
    }

    /**
     * Returns the end-of-line character(s) for the current operating system.
     * - Windows → '\r\n'
     * - Linux/macOS → '\n'
     * - MacOS (older) → '\r'
     * If the text contains a mix of EOL characters, it will return the one that appears most frequently. If no EOL characters are detected, it defaults to the system's EOL.
     */
    getSystemEOL(): string {
      return os.EOL;
    }

    /**
     * Returns the end-of-line character(s) used in the given text. It checks for the presence of common EOL characters and returns the one that is found.
     * If multiple types of EOL characters are present, it will return the one that appears most frequently.
     * If no EOL characters are detected, it defaults to the system's EOL.
     */
    getFileEOL(note: string): string {
      if (note.includes('\r\n')) {
        return '\r\n'; /* Windows */
      } else if (note.includes('\n')) {
        return '\n';   /* Linux/macOS */
      } else if (note.includes('\r')) {
        return '\r';   /* MacOS */
      }
      /* fallback: uses the system's EOL if no line breaks are detected. */
      return this.getSystemEOL();
    }

    /**
     * splitLines divides the input text into an array of lines, using the EOL character(s) detected in the text.
     */
    splitLines(note: string): string[] {
      return note.split(this.getFileEOL(note));
    }

    toArray(note:string, start?:number, end?:number): string[] {
      const eol = this.getFileEOL(note);
      const output = note.split(eol);
      return output.slice(start, end);
    }

    firstLine(note:string): string {
      const eol = this.getFileEOL(note);
      const items = note.split(eol);
      return items[0];
    }

    lastLine(note:string): string {
      const eol = this.getFileEOL(note);
      const items = note.split(eol);
      return items[items.length - 1];
    }
}