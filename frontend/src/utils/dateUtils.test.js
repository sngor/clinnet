// frontend/src/utils/dateUtils.test.js
import { calculateAge, formatDateForInput, isValidDateFormat } from './dateUtils';

describe('dateUtils', () => {
  describe('calculateAge', () => {
    // Mock current date for consistent testing
    const mockCurrentDate = new Date('2024-03-15T10:00:00.000Z');
    const originalDate = Date;

    beforeAll(() => {
      global.Date = class extends originalDate {
        constructor(...args) {
          if (args.length) {
            // @ts-ignore
            super(...args);
          } else {
            return mockCurrentDate;
          }
        }
      };
    });

    afterAll(() => {
      global.Date = originalDate; // Restore original Date object
    });

    test('should return "N/A" for null or empty input', () => {
      expect(calculateAge(null)).toBe('N/A');
      expect(calculateAge(undefined)).toBe('N/A');
      expect(calculateAge('')).toBe('N/A');
    });

    test('should correctly calculate age for a valid DOB string', () => {
      expect(calculateAge('1990-01-10')).toBe(34); // Assuming current date is 2024-03-15
    });

    test('should return "N/A" for an invalid date string format', () => {
      expect(calculateAge('10/01/1990')).toBe('N/A'); // Handled by new Date() returning Invalid Date
    });
    
    test('should return "N/A" for an invalid date (e.g., Feb 30)', () => {
      expect(calculateAge('1990-02-30')).toBe('N/A');
    });

    test('should handle birthday that already passed this year', () => {
      expect(calculateAge('2000-02-20')).toBe(24); // Birthday passed
    });

    test('should handle birthday yet to come this year', () => {
      expect(calculateAge('2000-07-20')).toBe(23); // Birthday upcoming
    });

    test('should handle birthday that is today', () => {
      expect(calculateAge('1995-03-15')).toBe(29); // Birthday is today
    });
    
    test('should return 0 for a baby less than 1 year old', () => {
        expect(calculateAge('2023-07-10')).toBe(0); // Born in July 2023
    });

    test('should handle future date as "N/A" or 0 if age is negative', () => {
        // The function returns "N/A" for negative ages.
        expect(calculateAge('2040-01-01')).toBe('N/A');
    });
  });

  describe('formatDateForInput', () => {
    test('should return empty string for null, undefined, or empty input', () => {
      expect(formatDateForInput(null)).toBe('');
      expect(formatDateForInput(undefined)).toBe('');
      expect(formatDateForInput('')).toBe('');
    });

    test('should return already correctly formatted YYYY-MM-DD string', () => {
      expect(formatDateForInput('2023-03-25')).toBe('2023-03-25');
    });

    test('should correctly format a valid ISO string (Date object)', () => {
      const isoDate = new Date('2023-11-05T14:30:00Z');
      expect(formatDateForInput(isoDate.toISOString())).toBe('2023-11-05');
    });
    
    test('should correctly format a date string like "MM/DD/YYYY"', () => {
      expect(formatDateForInput('11/05/2023')).toBe('2023-11-05');
    });

    test('should return empty string for an invalid date string', () => {
      expect(formatDateForInput('invalid-date-string')).toBe('');
    });
    
    test('should return empty string for an invalid date like YYYY-MM-DD but logically incorrect', () => {
      expect(formatDateForInput('2023-02-30')).toBe(''); // February 30th is invalid
    });

    test('should handle date objects directly', () => {
      const dateObj = new Date(2024, 0, 15); // Jan 15, 2024
      expect(formatDateForInput(dateObj.toString())).toBe('2024-01-15'); // toString() conversion then format
      // To be more precise with Date objects, the function itself would need to check `instanceof Date`
      // Current implementation relies on string parsing.
    });
  });

  describe('isValidDateFormat', () => {
    test('should return true for a valid YYYY-MM-DD string', () => {
      expect(isValidDateFormat('2023-01-15')).toBe(true);
    });

    test('should return false for null or empty string', () => {
      expect(isValidDateFormat(null)).toBe(false);
      expect(isValidDateFormat(undefined)).toBe(false);
      expect(isValidDateFormat('')).toBe(false);
    });

    test('should return false for invalid formats', () => {
      expect(isValidDateFormat('15/01/2023')).toBe(false);
      expect(isValidDateFormat('2023/01/15')).toBe(false);
      expect(isValidDateFormat('Jan 15, 2023')).toBe(false);
      expect(isValidDateFormat('2023-01-15T10:00:00Z')).toBe(false);
      expect(isValidDateFormat('randomstring')).toBe(false);
    });

    test('should return false for YYYY-MM-DD strings that are not valid dates', () => {
      expect(isValidDateFormat('2023-02-30')).toBe(false); // Feb 30 is not a valid date
      expect(isValidDateFormat('2023-13-01')).toBe(false); // Invalid month
      expect(isValidDateFormat('0000-00-00')).toBe(false); // Invalid date
    });
    
    test('should return true for leap year date', () => {
      expect(isValidDateFormat('2024-02-29')).toBe(true);
    });

    test('should return false for non-leap year Feb 29', () => {
      expect(isValidDateFormat('2023-02-29')).toBe(false);
    });
  });
});
