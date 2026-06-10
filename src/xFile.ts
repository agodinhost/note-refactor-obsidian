import { promises as fs } from 'fs';
import os from "os";

export enum EOLType {
  Windows = '\r\n',
  Linux = '\n',
  Macintosh = '\r'
}

/**
 * File utilities class.
 */
export default class XFile {

  static async loadFileContent(file: string): Promise<string> {
    return await fs.readFile(file, 'utf8');
  }

  /**
   * Returns the end-of-line character(s) for the current operating system.
   * - Windows → '\r\n'
   * - Linux → '\n'
   * - Macintosh → '\r'
   * If the text contains a mix of EOL characters, it will return the one that appears most frequently. If no EOL characters are detected, it defaults to the system's EOL.
   */
  static getSystemEOL(): string {
    return os.EOL;
  }

  /**
   * Returns the end-of-line character(s) used in the given text.
   * If multiple types of EOL characters are present, it will return the one that appears most frequently.
   * If no EOL characters are detected or there is a tie, it defaults to the system's EOL.
   */
  static getNoteEOL(note: string): string {
    const counts: Record<string, number> = {
      [EOLType.Windows]: (note.match(/\r\n/g) || []).length,
      [EOLType.Linux]: (note.match(/(?<!\r)\n/g) || []).length,
      [EOLType.Macintosh]: (note.match(/\r(?!\n)/g) || []).length
    };

    const entries = Object.entries(counts);
    const mostFreq = Math.max(...entries.map(([_, c]) => c));
    if (mostFreq === 0) return this.getSystemEOL();

    const score = entries.filter(([_, c]) => c === mostFreq);
    if (score.length === 1) return score[0][0];
    return this.getSystemEOL();
  }

  /**
   * splitLines divides the input text into an array of lines, using the EOL character(s) detected in the text.
   */
  static splitLines(note: string): string[] {
    return note.split(this.getNoteEOL(note));
  }

  static toArray(note: string, start?: number, end?: number): string[] {
    const eol = this.getNoteEOL(note);
    const output = note.split(eol);
    return output.slice(start, end);
  }

  static firstLine(note: string): string {
    const eol = this.getNoteEOL(note);
    const items = note.split(eol);
    return items[0];
  }

  static lastLine(note: string): string {
    const eol = this.getNoteEOL(note);
    const items = note.split(eol);
    return items[items.length - 1];
  }
}