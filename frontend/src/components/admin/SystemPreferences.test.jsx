import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SystemPreferences from './SystemPreferences';

describe('SystemPreferences', () => {
  test('renders language selection dropdown with options', async () => {
    render(<SystemPreferences />);
    const user = userEvent.setup();

    // Check if the language dropdown is present
    const languageSelect = screen.getByLabelText('Language');
    expect(languageSelect).toBeInTheDocument();

    // Click the dropdown to show options
    await user.click(languageSelect);

    // Check for English option
    const englishOption = await screen.findByRole('option', { name: 'English' });
    expect(englishOption).toBeInTheDocument();

    // Check for Khmer option
    const khmerOption = await screen.findByRole('option', { name: 'Khmer' });
    expect(khmerOption).toBeInTheDocument();
  });
});
