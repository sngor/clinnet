import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next'; // Import i18next
import { initReactI18next } from 'react-i18next';
import AdminSettingsPage from './AdminSettingsPage';
import { vi } from 'vitest';

// Mock dependencies that might cause side effects or are not relevant to this test
vi.mock('../components/admin/SystemPreferences', () => ({
  __esModule: true,
  default: () => <div data-testid="system-preferences-mock">System Preferences Mock</div>,
}));

vi.mock('./DiagnosticsPage', () => ({
  __esModule: true,
  default: () => <div data-testid="diagnostics-page-mock">Diagnostics Page Mock</div>,
}));

// Mock adminService as it seems to initialize Cognito
vi.mock('../services/adminService.js', () => ({
  // Add mock implementations for any functions used by AdminSettingsPage or its children if necessary
  // For now, an empty mock might suffice if AdminSettingsPage itself doesn't directly call adminService functions
}));


// Test i18n instance
const testI18n = i18n.createInstance();
testI18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  debug: false, // Disable debug for cleaner test output
  resources: {
    en: {
      translation: {
        "admin_settings_title": "Admin Settings",
        "system_preferences_tab": "System Preferences",
        "system_diagnostics_tab": "System Diagnostics",
        // Add any other keys used by SystemPreferences if not deeply mocked
        "system_preferences": "System Preferences Title from AdminSettingsTest"
      }
    },
    km: {
      translation: {
        "admin_settings_title": "ការកំណត់អ្នកគ្រប់គ្រង",
        "system_preferences_tab": "ការកំណត់ប្រព័ន្ធ",
        "system_diagnostics_tab": "ការវិនិច្ឆ័យប្រព័ន្ធ",
        "system_preferences": "ចំណងជើងការកំណត់ប្រព័ន្ធពី AdminSettingsTest"
      }
    }
  },
  interpolation: {
    escapeValue: false,
  }
});

// Helper function to render with I18nextProvider
const renderWithI18n = (component, instance = testI18n) => {
  return render(<I18nextProvider i18n={instance}>{component}</I18nextProvider>);
};

describe('AdminSettingsPage', () => {
  beforeEach(async () => {
    await act(async () => {
      await testI18n.changeLanguage('en');
    });
  });

  test('renders correctly in English', async () => {
    renderWithI18n(<AdminSettingsPage />);

    expect(await screen.findByText('Admin Settings')).toBeInTheDocument();
    // Tabs are identified by role 'tab' and their accessible name (the label)
    expect(await screen.findByRole('tab', { name: 'System Preferences' })).toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: 'System Diagnostics' })).toBeInTheDocument();

    // Check if the mock for SystemPreferences is rendered (it should be the active tab by default)
    expect(screen.getByTestId('system-preferences-mock')).toBeInTheDocument();
  });

  test('switches to Khmer and verifies translations', async () => {
    renderWithI18n(<AdminSettingsPage />);

    expect(await screen.findByText('Admin Settings')).toBeInTheDocument();

    await act(async () => {
      await testI18n.changeLanguage('km');
    });

    expect(await screen.findByText('ការកំណត់អ្នកគ្រប់គ្រង')).toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: 'ការកំណត់ប្រព័ន្ធ' })).toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: 'ការវិនិច្ឆ័យប្រព័ន្ធ' })).toBeInTheDocument();
  });
});
