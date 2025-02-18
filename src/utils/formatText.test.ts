import { toSentenceCase } from './formatText';

describe('toSentenceCase', () => {
    it('should convert a lowercase string to sentence case', () => {
        expect(toSentenceCase('hello world')).toBe('Hello world');
    });

    it('should convert an uppercase string to sentence case', () => {
        expect(toSentenceCase('HELLO WORLD')).toBe('Hello world');
    });

    it('should convert a mixed case string to sentence case', () => {
        expect(toSentenceCase('hElLo WoRlD')).toBe('Hello world');
    });

    it('should return an empty string if input is empty', () => {
        expect(toSentenceCase('')).toBe('');
    });

    it('should return the same string if input is a single character', () => {
        expect(toSentenceCase('a')).toBe('A');
        expect(toSentenceCase('A')).toBe('A');
    });

    it('should handle strings with leading and trailing spaces', () => {
        expect(toSentenceCase('  hello world  ')).toBe('  hello world  ');
    });

    it('should handle strings with special characters', () => {
        expect(toSentenceCase('hello-world')).toBe('Hello-world');
        expect(toSentenceCase('hello_world')).toBe('Hello_world');
    });

    it('should return the same string if input is already in sentence case', () => {
        expect(toSentenceCase('Hello world')).toBe('Hello world');
    });
});