import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next'; // Import i18next
import { initReactI18next } from 'react-i18next';
import SystemPreferences from './SystemPreferences';

// Test i18n instance
const testI18n = i18n.createInstance();
testI18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  debug: false,
  resources: {
    en: {
      translation: {
        "system_preferences": "System Preferences",
        "font_size": "Font Size",
        "allow_notifications": "Allow Notifications",
        "language": "Language"
      }
    },
    km: {
      translation: {
        "system_preferences": "ការកំណត់ប្រព័ន្ធ",
        "font_size": "ទំហំពុម្ពអក្សរ",
        "allow_notifications": "អនុញ្ញាតការជូនដំណឹង",
        "language": "ភាសា"
      }
    }
  },
  interpolation: {
    escapeValue: false, // Not needed for react as it escapes by default
  }
});


// Helper function to render with I18nextProvider
const renderWithI18n = (component, instance = testI18n) => {
  // It's important that the instance is fully initialized before rendering.
  // If init is async, ensure it's resolved. Here, our init is synchronous.
  return render(<I18nextProvider i18n={instance}>{component}</I18nextProvider>);
};

describe('SystemPreferences', () => {
  beforeEach(async () => {
    await act(async () => {
      await testI18n.changeLanguage('en');
    });
  });

  test('renders correctly in English and allows language switching to Khmer', async () => {
    renderWithI18n(<SystemPreferences />);
    const user = userEvent.setup({ delay: null }); // Using delay: null for potentially faster user events

    // Initial English assertions
    expect(screen.getByText('System Preferences')).toBeInTheDocument();
    expect(screen.getByLabelText('Allow Notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Font Size')).toBeInTheDocument();
    expect(screen.getByLabelText('Language')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Language' })).toHaveTextContent('English');

    // Click the language dropdown
    // The getByRole for combobox should find the div that is the visible part of the Select
    await user.click(screen.getByRole('combobox', { name: 'Language' }));

    // Click 'Khmer' option
    const khmerOption = await screen.findByRole('option', { name: 'Khmer' });
    await user.click(khmerOption);

    // Assertions for Khmer
    expect(await screen.findByText('ការកំណត់ប្រព័ន្ធ')).toBeInTheDocument();
    expect(await screen.findByLabelText('អនុញ្ញាតការជូនដំណឹង')).toBeInTheDocument();
    expect(await screen.findByLabelText('ទំហំពុម្ពអក្សរ')).toBeInTheDocument();
    expect(await screen.findByLabelText('ភាសា')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'ភាសា' })).toHaveTextContent('Khmer');
  });

  test('renders language selection dropdown with options', async () => {
    renderWithI18n(<SystemPreferences />);
    const user = userEvent.setup({ delay: null });

    const languageSelect = screen.getByRole('combobox', { name: 'Language' }); // Use English label for initial find
    expect(languageSelect).toBeInTheDocument();

    await user.click(languageSelect);

    const englishOption = await screen.findByRole('option', { name: 'English' });
    expect(englishOption).toBeInTheDocument();
    expect(englishOption.getAttribute('data-value')).toBe('en');

    const khmerOption = await screen.findByRole('option', { name: 'Khmer' });
    expect(khmerOption).toBeInTheDocument();
    expect(khmerOption.getAttribute('data-value')).toBe('km');
  });
});
