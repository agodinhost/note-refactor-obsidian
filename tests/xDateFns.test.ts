import { describe, expect, beforeAll, afterAll, jest } from '@jest/globals';

import { replaceDateMask } from '../src/xDateFns';

const fixedDate = new Date(2020, 9, 31, 14, 25, 15);

describe("Date formatting", () => {

    beforeAll(async () => {
        jest.useFakeTimers();
        jest.setSystemTime(fixedDate);
    });

    it("No date format formatting using standad format", () => {
        const input = 'Zettels/{{date}}';
        const expectedOuput = 'Zettels/202010311425';

        expect(replaceDateMask(input)).toBe(expectedOuput);
    });

    it("yyyyMMdd format", () => {
        const input = 'Zettels/{{date:yyyyMMdd}}';
        const expectedOuput = 'Zettels/20201031';

        expect(replaceDateMask(input)).toBe(expectedOuput);
    });

    it("Multiple dates", () => {
        const input = 'Zettels/{{date:yyyy}}/{{date:MMM}}/{{date:dd_EEE}}';
        const expectedOuput = 'Zettels/2020/Oct/31_Sat';

        expect(replaceDateMask(input)).toBe(expectedOuput);
    });

    it("Date path prefixing", () => {
        const input = '{{date:yyyy}}/{{date:MM}}/My Notes';
        const expectedOuput = '2020/10/My Notes';

        expect(replaceDateMask(input)).toBe(expectedOuput);
    });

    it("Text between date targets", () => {
        const input = '{{date:yyyy}}/Zettels/{{date:MMMM}}';
        const expectedOuput = '2020/Zettels/October';

        expect(replaceDateMask(input)).toBe(expectedOuput);
    });

    it("Date file name prefixing", () => {
        const input = '{{date:yyyyMMddHHmm}}-My New Note';
        const expectedOuput = '202010311425-My New Note';

        expect(replaceDateMask(input)).toBe(expectedOuput);
    });

    afterAll(() => {
        jest.useRealTimers();
    });
});

describe("Non-date input", () => {

    it("Input without dates", () => {
        const input = 'Inbox/New';
        const expectedOuput = 'Inbox/New';

        expect(replaceDateMask(input)).toBe(expectedOuput);
    });

    it("Input with date format without date target", () => {
        const input = 'Inbox/yyyy';
        const expectedOuput = 'Inbox/yyyy';

        expect(replaceDateMask(input)).toBe(expectedOuput);
    });

    it("Input with date format and partial date target", () => {
        const input = 'Inbox/{{date:yyyy';
        const expectedOuput = 'Inbox/{{date:yyyy';

        expect(replaceDateMask(input)).toBe(expectedOuput);
    });
});
