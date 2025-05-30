import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppDataProvider, useAppData } from '../app/providers/DataProvider'; // Adjust path as needed
import PatientDetailPage, { getDisplayableS3Url } from './PatientDetailPage'; // Import the specific function
import *  as patientService from '../services/patients'; // To mock patientService

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'test-patient-id' }),
  useNavigate: () => jest.fn(),
}));

// Mock useAppData hook
jest.mock('../app/providers/DataProvider', () => ({
  ...jest.requireActual('../app/providers/DataProvider'),
  useAppData: jest.fn(),
}));

// Mock patientService
jest.mock('../services/patients');


// Helper function to wrap component in Router and Provider
const renderWithProviders = (ui, { providerProps, ...renderOptions } = {}) => {
  return render(
    <MemoryRouter initialEntries={['/patient/test-patient-id']}>
      <AppDataProvider {...providerProps}>
        <Routes>
          <Route path="/patient/:id" element={ui} />
        </Routes>
      </AppDataProvider>
    </MemoryRouter>,
    renderOptions
  );
};

describe('PatientDetailPage', () => {
  let mockUpdatePatient;

  beforeEach(() => {
    mockUpdatePatient = jest.fn().mockResolvedValue({});
    useAppData.mockReturnValue({
      patients: [], // Start with no patients in context to force fetch
      loading: false,
      error: null,
      updatePatient: mockUpdatePatient,
      // Add other context values if needed by the component
    });
    patientService.fetchPatientById.mockResolvedValue({
      id: 'test-patient-id',
      firstName: 'John',
      lastName: 'Doe',
      profileImage: null, // Default to no image
      // Add other necessary fields
    });
    patientService.updatePatient = mockUpdatePatient; // Ensure service uses the same mock

    // Mock FileReader
    global.FileReader = jest.fn(() => ({
      readAsDataURL: jest.fn(),
      onloadend: jest.fn(),
      result: 'data:image/png;base64,test-base64-string', // Mock result
    }));
  });

  // Test suite for getDisplayableS3Url (assuming it's part of PatientDetailPage or accessible)
  // To test it directly, it might be better to export it from PatientDetailPage or move to utils.
  // For now, we'll test its effect.

  test('getDisplayableS3Url utility function works correctly', () => {
    // This test is conceptual if getDisplayableS3Url is not exported.
    // We'll test its behavior via component rendering.
    // If exported:
    // expect(getDisplayableS3Url('s3://my-bucket/path/to/image.jpg')).toBe('https://my-bucket.s3.us-east-1.amazonaws.com/path/to/image.jpg');
    // expect(getDisplayableS3Url('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
    // expect(getDisplayableS3Url(null)).toBeNull();
    // For now, we assert its effect on the Avatar's src prop later.
    // We can also instantiate the component and call the method if it's a class component,
    // or find another way if it's a hook/functional component and the function is internal.
  
  // Direct tests for getDisplayableS3Url
  describe('getDisplayableS3Url', () => {
    test('correctly converts valid S3 URI to HTTPS URL', () => {
      const s3Uri = 's3://my-bucket/path/to/image.jpg';
      const expectedUrl = 'https://my-bucket.s3.us-east-1.amazonaws.com/path/to/image.jpg';
      expect(getDisplayableS3Url(s3Uri)).toBe(expectedUrl);
    });

    test('returns HTTPS URL unchanged', () => {
      const httpsUrl = 'https://example.com/image.jpg';
      expect(getDisplayableS3Url(httpsUrl)).toBe(httpsUrl);
    });

    test('returns null for null input', () => {
      expect(getDisplayableS3Url(null)).toBeNull();
    });

    test('returns null for undefined input', () => {
      expect(getDisplayableS3Url(undefined)).toBeNull();
    });

    test('handles S3 URI with different region if region is configurable (assuming us-east-1 default)', () => {
      // This test depends on REACT_APP_AWS_REGION. If not set, defaults to us-east-1.
      // To make this test robust, you might need to mock process.env.REACT_APP_AWS_REGION
      const s3Uri = 's3://my-bucket-other-region/path/image.png';
      const expectedUrl = 'https://my-bucket-other-region.s3.us-east-1.amazonaws.com/path/image.png';
      expect(getDisplayableS3Url(s3Uri)).toBe(expectedUrl);
    });

    test('returns null for malformed S3 URIs or unrecognized format', () => {
      expect(getDisplayableS3Url('my-bucket/path/image.jpg')).toBeNull(); // Does not start with s3:// or https://
      expect(getDisplayableS3Url('http://my-bucket/path/image.jpg')).toBeNull(); // Not https and not s3
      expect(getDisplayableS3Url('s3:/my-bucket/path/image.jpg')).toBeNull(); // Malformed s3 prefix
    });

    // Mock console.warn to ensure it's called for invalid URIs
    test('logs a warning for invalid S3 URI', () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        getDisplayableS3Url('invalid-uri-format');
        expect(consoleWarnSpy).toHaveBeenCalledWith("Invalid S3 URI or URL:", "invalid-uri-format");
        consoleWarnSpy.mockRestore();
    });
  });

  test('displays existing S3 image correctly', async () => {
    const s3Uri = 's3://test-bucket/test-patient-id/profile/image.png';
    const expectedHttpsUrl = 'https://test-bucket.s3.us-east-1.amazonaws.com/test-patient-id/profile/image.png';
    
    patientService.fetchPatientById.mockResolvedValueOnce({
      id: 'test-patient-id',
      firstName: 'Jane',
      lastName: 'Doe',
      profileImage: s3Uri,
    });

    renderWithProviders(<PatientDetailPage />);

    // Wait for patient data to load and UI to update
    // The Avatar component is in PersonalInfoTab, look for an img tag
    let avatarImg;
    await waitFor(() => {
      // The PersonalInfoTab renders an Avatar, which internally renders an <img>
      // We need to ensure PersonalInfoTab is rendered and receives the correct prop.
      // This might require a more specific selector if there are multiple images.
      avatarImg = screen.getByAltText('Profile Image'); // Alt text from PersonalInfoTab
      expect(avatarImg).toBeInTheDocument();
      expect(avatarImg).toHaveAttribute('src', expectedHttpsUrl);
    });
  });

  test('handles image preview when a new file is selected', async () => {
    renderWithProviders(<PatientDetailPage />);

    // Click edit button to show file input
    const editButton = await screen.findByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    const fileInput = screen.getByLabelText(/profile image/i, { selector: 'input[type="file"]' });
     // This selector assumes a label is associated with the input.
     // In PersonalInfoTab, the TextField for file input doesn't have a direct visible label.
     // We might need to use a more robust selector like testId or find by name if 'profileImageFile' is unique.
     // For now, let's assume we can find it. If not, we'll adjust.
     // A more direct approach if no label:
     // const fileInput = document.querySelector('input[name="profileImageFile"]');
     // expect(fileInput).toBeInTheDocument();


    // If the above selector fails, let's try finding by the 'name' attribute if it's unique enough,
    // though this is not standard RTL practice.
    // For now, we assume the input is identifiable.
    // Let's assume the TextField in PersonalInfoTab makes the input accessible.
    // The actual input is hidden by Material UI's TextField styling.
    // We might need to get creative or add a test-id.
    
    // A placeholder for finding the input. The actual input is type="file".
    // The visual part is a text field. We target the hidden input.
    // Let's assume the input is the one inside the TextField with name "profileImageFile"
    // This is a bit of a hacky way to get to the input if no proper label is available.
    // A data-testid on the input itself would be best.
    const fileInputElement = document.querySelector('input[name="profileImageFile"][type="file"]');
    expect(fileInputElement).toBeInTheDocument();


    const mockFile = new File(['dummy image content'], 'test.png', { type: 'image/png' });
    
    // Mock the FileReader instance that will be created in handleInputChange
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      onloadend: null, // We will trigger this manually
      result: 'data:image/png;base64,mock-file-content-base64',
    };
    global.FileReader = jest.fn(() => mockFileReaderInstance);

    fireEvent.change(fileInputElement, { target: { files: [mockFile] } });

    // Manually trigger onloadend
    expect(mockFileReaderInstance.readAsDataURL).toHaveBeenCalledWith(mockFile);
    if (mockFileReaderInstance.onloadend) {
      mockFileReaderInstance.onloadend();
    }

    await waitFor(() => {
      const avatarImg = screen.getByAltText('Profile Image');
      expect(avatarImg).toHaveAttribute('src', 'data:image/png;base64,mock-file-content-base64');
    });

    // Also verify that editedPatient state for upload contains the base64
    // This requires more advanced state testing or checking arguments to updatePatient on save.
    // For now, visual check of preview is primary.
  });

  test('getDisplayableS3Url handles various inputs as expected', () => {
    // To properly test getDisplayableS3Url, we'd need to export it or call it on an instance.
    // Simulating this by checking its effect when different profileImage values are set for the patient.
    
    // Case 1: Valid S3 URI
    const s3Uri = 's3://my-test-bucket/images/profile.jpg';
    const expectedUrl = 'https://my-test-bucket.s3.us-east-1.amazonaws.com/images/profile.jpg';
    patientService.fetchPatientById.mockResolvedValueOnce({ id: '1', profileImage: s3Uri });
    renderWithProviders(<PatientDetailPage />);
    waitFor(() => expect(screen.getByAltText('Profile Image')).toHaveAttribute('src', expectedUrl));

    // Case 2: Already HTTPS URL
    const httpsUrl = 'https://some-other-bucket.s3.another-region.amazonaws.com/pic.png';
    patientService.fetchPatientById.mockResolvedValueOnce({ id: '1', profileImage: httpsUrl });
    renderWithProviders(<PatientDetailPage />); // Re-render or update props
    waitFor(() => expect(screen.getByAltText('Profile Image')).toHaveAttribute('src', httpsUrl));
    
    // Case 3: Null input
    patientService.fetchPatientById.mockResolvedValueOnce({ id: '1', profileImage: null });
    renderWithProviders(<PatientDetailPage />);
    waitFor(() => expect(screen.getByAltText('Profile Image')).toHaveAttribute('src', '')); // Assuming Avatar src defaults to ""

    // Case 4: Malformed S3 URI (e.g. no s3:// prefix)
    // This depends on how getDisplayableS3Url handles it, currently it would return null or original.
    // The direct tests for getDisplayableS3Url cover its various outputs.
    // This integration test just ensures it's wired up correctly.
    const malformedUri = 'my-bucket/pic.png'; 
    patientService.fetchPatientById.mockResolvedValueOnce({ id: '1', profileImage: malformedUri });
    renderWithProviders(<PatientDetailPage />);
    await waitFor(() => {
        const avatarImg = screen.getByAltText('Profile Image');
        // getDisplayableS3Url will return null for this, Avatar gets ""
        expect(avatarImg).toHaveAttribute('src', ''); 
    });
  });

});
