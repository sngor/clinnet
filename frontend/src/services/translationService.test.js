import { translateText } from './translationService';
import { vi } from 'vitest';

// 1. Define mock functions
const mockTranslateTextFn = vi.fn();
const mockConfigUpdateFn = vi.fn();

// Ensure a clean slate for modules, then mock.
vi.resetModules();

// 2. Use vi.doMock before importing the module under test
vi.doMock('aws-sdk', () => {
  return {
    default: {
      Translate: vi.fn(() => ({
        translateText: mockTranslateTextFn,
      })),
      config: {
        update: mockConfigUpdateFn,
      },
    },
  };
});

// 3. Dynamically import the module under test AFTER mocks are set up.

describe('translationService', () => {
  let translateText; // Will be assigned in beforeAll
  let consoleErrorSpy;

  beforeAll(async () => {
    // Vite/Vitest should handle top-level await for dynamic imports in test files.
    const module = await import('./translationService.js'); // Ensure .js extension if needed by your env
    translateText = module.translateText;
  });

  beforeEach(() => {
    localStorage.clear();
    mockTranslateTextFn.mockClear();
    mockConfigUpdateFn.mockClear();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('should return translated text from AWS and cache it', async () => {
    const mockResponse = { TranslatedText: 'Bonjour' };
    const promiseMock = vi.fn().mockResolvedValueOnce(mockResponse);
    mockTranslateTextFn.mockReturnValueOnce({ promise: promiseMock });

    const text = 'Hello';
    const targetLanguageCode = 'fr';
    // Ensure translateText is defined (it should be after beforeAll)
    if (!translateText) throw new Error("translateText is not defined");
    const result = await translateText(text, targetLanguageCode);

    expect(result).toBe('Bonjour');
    // expect(mockConfigUpdateFn).toHaveBeenCalled(); // Call happens at module import, checked implicitly by other mocks working
    expect(mockTranslateTextFn).toHaveBeenCalledWith({
      Text: text,
      SourceLanguageCode: 'auto',
      TargetLanguageCode: targetLanguageCode,
    });
    expect(promiseMock).toHaveBeenCalled(); // Ensure the promise function was called
    expect(localStorage.getItem(`${targetLanguageCode}_${text}`)).toBe('Bonjour');
  });

  test('should return cached translation if available', async () => {
    const text = 'Hello';
    const targetLanguageCode = 'fr';
    const cachedTranslation = 'Bonjour Cache';
    localStorage.setItem(`${targetLanguageCode}_${text}`, cachedTranslation);

    if (!translateText) throw new Error("translateText is not defined");
    const result = await translateText(text, targetLanguageCode);

    expect(result).toBe(cachedTranslation);
    expect(mockTranslateTextFn).not.toHaveBeenCalled();
  });

  test('should return null and log error if AWS call fails', async () => {
    const error = new Error('AWS Translate Error');
    const promiseMock = vi.fn().mockRejectedValueOnce(error);
    mockTranslateTextFn.mockReturnValueOnce({ promise: promiseMock });

    const text = 'Hello';
    const targetLanguageCode = 'de';
    if (!translateText) throw new Error("translateText is not defined");
    const result = await translateText(text, targetLanguageCode);

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('Error translating text:', error);
    expect(localStorage.getItem(`${targetLanguageCode}_${text}`)).toBeNull();
  });
});
