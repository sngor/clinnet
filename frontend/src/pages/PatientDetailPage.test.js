import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppDataProvider, useAppData } from '../app/providers/DataProvider'; // Adjust path as needed
import PatientDetailPage from './PatientDetailPage'; // getDisplayableS3Url is now imported from utils
import * as patientService from '../services/patients'; // To mock patientService
// Import utilities to be used directly if not mocked
import { getDisplayableS3Url } from '../utils/s3Utils'; 
import { calculateAge } from '../utils/dateUtils';


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
    // Default AppData mock
    useAppData.mockReturnValue({
      patients: [], // contextPatients - can be used for initial cache check if desired
      contextLoading: false, // Renamed to avoid clash with pageLoading
      contextError: null,   // Renamed
      updatePatient: mockUpdatePatient,
    });

    // Default patientService.fetchPatientById mock
    patientService.fetchPatientById.mockResolvedValue({ 
      data: {
        id: 'test-patient-id',
        firstName: 'John',
        lastName: 'Doe',
        profileImage: null,
        dateOfBirth: '1990-01-01', // Add other necessary fields
      }, 
      error: null 
    });
    
    // patientService.updatePatient is already assigned mockUpdatePatient by jest.mock,
    // but we need to ensure its mock implementation logic is correct later.
    // For now, direct assignment is fine if the mock is simple.

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

  // REMOVED: Redundant describe block for getDisplayableS3Url as it's tested in s3Utils.test.js

  test('displays existing S3 image correctly', async () => {
    const s3Uri = 's3://test-bucket/test-patient-id/profile/image.png';
    // Use the actual utility function for expected URL if not mocking it.
    const expectedHttpsUrl = getDisplayableS3Url(s3Uri); 
    
    patientService.fetchPatientById.mockResolvedValueOnce({
      data: {
        id: 'test-patient-id',
        firstName: 'Jane',
        lastName: 'Doe',
        profileImage: s3Uri,
        dateOfBirth: '1985-07-22',
      },
      error: null,
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
        // getDisplayableS3Url (actual util) would return 'my-bucket/pic.png' based on current s3Utils.js logic for unrecognized.
        // The Avatar src would then be this value. If strict null is desired, s3Utils needs change.
        // For now, assuming current s3Utils behavior:
        expect(avatarImg).toHaveAttribute('src', malformedUri); 
    });
  });

  test('displays loading state initially', async () => {
    // Prevent fetchPatientById from resolving immediately
    patientService.fetchPatientById.mockImplementation(() => new Promise(() => {})); 
    
    renderWithProviders(<PatientDetailPage />);
    
    expect(screen.getByText(/Loading patient information.../i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays error message if fetching patient fails', async () => {
    const errorMessage = 'Network Error: Failed to fetch patient details';
    patientService.fetchPatientById.mockResolvedValue({ 
      data: null, 
      error: new Error(errorMessage) 
    });

    // Use act for updates related to promises resolving
    await act(async () => {
      renderWithProviders(<PatientDetailPage />);
    });

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument(); // Verify no patient data shown
  });

  test('displays "patient not found" message if patient data is null from service (and no error object)', async () => {
    patientService.fetchPatientById.mockResolvedValue({ 
      data: null, 
      error: null 
    });

    await act(async () => {
      renderWithProviders(<PatientDetailPage />);
    });
    
    // Component's internal logic sets pageError to "Patient not found."
    expect(await screen.findByText(/Patient not found./i)).toBeInTheDocument();
  });
  
  describe('Save/Update Patient Data', () => {
    const initialPatient = {
      id: 'test-patient-id',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      email: 'john.doe@example.com',
      phone: '1234567890',
      // ensure all fields edited are here
    };

    beforeEach(() => {
      // Reset fetchPatientById to return initial patient for each test in this describe block
      patientService.fetchPatientById.mockResolvedValue({ data: initialPatient, error: null });
    });

    test('successfully saves edited patient data', async () => {
      const updatedPatientData = { ...initialPatient, firstName: 'Johnny', email: 'johnny.new@example.com' };
      
      // patientService.updatePatient is mocked by jest.mock('../services/patients')
      // We need to provide its specific mock implementation for this test
      patientService.updatePatient.mockResolvedValue({ data: updatedPatientData, error: null });
      
      // useAppData().updatePatient mock: DataProvider throws on error, returns data on success
      mockUpdatePatient.mockResolvedValue(updatedPatientData);


      await act(async () => {
        renderWithProviders(<PatientDetailPage />);
      });
      // Wait for initial data to load by checking for an element that depends on it
      expect(await screen.findByDisplayValue('John')).toBeInTheDocument();


      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      
      const firstNameInput = screen.getByDisplayValue('John');
      fireEvent.change(firstNameInput, { target: { value: 'Johnny' } });
      
      const emailInput = screen.getByDisplayValue('john.doe@example.com');
      fireEvent.change(emailInput, { target: { value: 'johnny.new@example.com' } });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /save/i }));
      });

      expect(patientService.updatePatient).toHaveBeenCalledWith('test-patient-id', expect.objectContaining({
        firstName: 'Johnny',
        email: 'johnny.new@example.com',
      }));
      
      // Check for success snackbar
      expect(await screen.findByText('Patient details updated successfully!')).toBeInTheDocument();
      
      // Verify UI is updated (e.g., no longer in edit mode, display reflects changes)
      expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
      expect(screen.getByText('Johnny Doe')).toBeInTheDocument(); // Header name update
      // Check if form fields display updated values (if they are still visible and not replaced by text)
      // This depends on how the component switches from edit to display mode.
      // If it re-renders with new patient prop, then check displayed text.
      expect(screen.getByText('johnny.new@example.com')).toBeInTheDocument(); // Check updated email display
    });

    test('handles error when saving edited patient data', async () => {
      const updateError = new Error('Update Conflict: Version mismatch');
      patientService.updatePatient.mockResolvedValue({ data: null, error: updateError });
      
      // DataProvider's updatePatient re-throws the error
      mockUpdatePatient.mockRejectedValue(updateError);

      await act(async () => {
        renderWithProviders(<PatientDetailPage />);
      });
      expect(await screen.findByDisplayValue('John')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      
      const firstNameInput = screen.getByDisplayValue('John');
      fireEvent.change(firstNameInput, { target: { value: 'Johnny Error' } });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /save/i }));
      });

      expect(patientService.updatePatient).toHaveBeenCalledWith('test-patient-id', expect.objectContaining({
        firstName: 'Johnny Error',
      }));

      // Check for error snackbar
      expect(await screen.findByText(/Error updating patient: Update Conflict: Version mismatch/i)).toBeInTheDocument();
      // Ensure still in edit mode (or other expected error state UI)
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });
  });
});
