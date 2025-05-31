import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FontSizeProvider, useFontSize } from './FontSizeContext';
import theme from '../app/theme'; // To access fontSizes

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Helper component to consume and display context values
const TestConsumer = () => {
  const { fontSize, updateFontSize, fontSizes } = useFontSize();
  return (
    <div>
      <div data-testid="fontSize">{fontSize}</div>
      <button onClick={() => updateFontSize('small')}>Set Small</button>
      <button onClick={() => updateFontSize('large')}>Set Large</button>
      <button onClick={() => updateFontSize('invalidSize')}>Set Invalid</button>
      <div data-testid="fontSizes">{JSON.stringify(fontSizes)}</div>
    </div>
  );
};

describe('FontSizeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    // Reset console.warn mock
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.warn
    console.warn.mockRestore();
  });

  test('initializes with "medium" if no localStorage value', () => {
    render(
      <FontSizeProvider>
        <TestConsumer />
      </FontSizeProvider>
    );
    expect(screen.getByTestId('fontSize')).toHaveTextContent('medium');
  });

  test('initializes with value from localStorage if valid', () => {
    localStorageMock.setItem('appFontSize', 'large');
    render(
      <FontSizeProvider>
        <TestConsumer />
      </FontSizeProvider>
    );
    expect(screen.getByTestId('fontSize')).toHaveTextContent('large');
  });

  test('initializes with "medium" if localStorage value is invalid', () => {
    localStorageMock.setItem('appFontSize', 'extra-large'); // an invalid size
    render(
      <FontSizeProvider>
        <TestConsumer />
      </FontSizeProvider>
    );
    expect(screen.getByTestId('fontSize')).toHaveTextContent('medium');
  });

  test('updateFontSize changes the font size and updates localStorage', () => {
    render(
      <FontSizeProvider>
        <TestConsumer />
      </FontSizeProvider>
    );

    act(() => {
      screen.getByText('Set Small').click();
    });
    expect(screen.getByTestId('fontSize')).toHaveTextContent('small');
    expect(localStorageMock.getItem('appFontSize')).toBe('small');

    act(() => {
      screen.getByText('Set Large').click();
    });
    expect(screen.getByTestId('fontSize')).toHaveTextContent('large');
    expect(localStorageMock.getItem('appFontSize')).toBe('large');
  });

  test('updateFontSize does not change font size for invalid values and logs a warning', () => {
    render(
      <FontSizeProvider>
        <TestConsumer />
      </FontSizeProvider>
    );
    // Initial state
    expect(screen.getByTestId('fontSize')).toHaveTextContent('medium');

    act(() => {
      screen.getByText('Set Invalid').click();
    });
    // State should not change
    expect(screen.getByTestId('fontSize')).toHaveTextContent('medium');
    // localStorage should still be medium (or initial if it was different)
    expect(localStorageMock.getItem('appFontSize')).toBe('medium');
    // Check if console.warn was called
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid font size: invalidSize'));
  });

  test('provides fontSizes from theme', () => {
    render(
      <FontSizeProvider>
        <TestConsumer />
      </FontSizeProvider>
    );
    expect(screen.getByTestId('fontSizes')).toHaveTextContent(JSON.stringify(theme.fontSizes));
  });
});
