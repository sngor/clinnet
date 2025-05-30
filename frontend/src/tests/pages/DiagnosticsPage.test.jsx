import React from 'react';
import { render, screen, fireEvent, waitFor, within as rtlWithin } from '@testing-library/react'; // Renamed 'within' to 'rtlWithin'
import '@testing-library/jest-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles'; // Ensure createTheme is imported
import DiagnosticsPage from '../../pages/DiagnosticsPage';
import adminService from '../../services/adminService';

// Mock the adminService
jest.mock('../../services/adminService', () => ({
  checkS3Connectivity: jest.fn(),
  checkDynamoDBCrud: jest.fn(),
  checkCognitoUsersCrud: jest.fn(),
}));

const theme = createTheme(); // Create a theme instance for ThemeProvider

// Helper function to render with ThemeProvider
const renderWithTheme = (component) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('DiagnosticsPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    adminService.checkS3Connectivity.mockReset();
    adminService.checkDynamoDBCrud.mockReset();
    adminService.checkCognitoUsersCrud.mockReset();

    // Default mock implementation for successful S3 check to simplify some tests
    adminService.checkS3Connectivity.mockResolvedValue({ success: true, message: 'S3 connection successful.' });
    // Default mock for CRUD to prevent breaking tests that don't focus on it
    adminService.checkDynamoDBCrud.mockImplementation(async (apiId) => {
        return {
            create: 'OK',
            read: 'OK',
            update: 'OK',
            delete: 'OK',
            message: `Default mock for ${apiId} successful.`
        };
    });
    adminService.checkCognitoUsersCrud.mockResolvedValue({
        create: 'OK',
        read: 'OK',
        update: 'OK',
        delete: 'OK',
        message: 'Default mock for Cognito successful.'
    });
  });

  test('renders the diagnostics page title and initial services', () => {
    renderWithTheme(<DiagnosticsPage />);
    expect(screen.getByText('System Diagnostics')).toBeInTheDocument();
    
    // Check for some service names
    expect(screen.getByText('Site Frontend')).toBeInTheDocument();
    expect(screen.getByText('API Gateway')).toBeInTheDocument();
    expect(screen.getByText('Lambda Functions')).toBeInTheDocument();
    expect(screen.getByText('S3 Storage (Avatars)')).toBeInTheDocument();
    expect(screen.getByText('Patient Data (DynamoDB)')).toBeInTheDocument();
  });

  test('initial status of Site Frontend is Online', () => {
    renderWithTheme(<DiagnosticsPage />);
    const siteFrontendCard = screen.getByText('Site Frontend').closest('div[class*="MuiCard-root"]');
    expect(siteFrontendCard).toBeInTheDocument();
    // Use rtlWithin for querying within an element
    expect(rtlWithin(siteFrontendCard).getByText('Online')).toBeInTheDocument(); // Chips are identified by their label text
  });

  describe('S3 Service Testing', () => {
    test('successfully tests S3 connection and updates status to Online', async () => {
      adminService.checkS3Connectivity.mockResolvedValueOnce({ success: true, message: 'S3 Connection OK' });
      renderWithTheme(<DiagnosticsPage />);

      const s3Card = screen.getByText('S3 Storage (Avatars)').closest('div[class*="MuiCard-root"]');
      expect(s3Card).toBeInTheDocument();

      // Initial status should be Unknown for S3
      expect(rtlWithin(s3Card).getByText('Unknown')).toBeInTheDocument();
      
      const testButton = rtlWithin(s3Card).getByRole('button', { name: /Test/i });
      fireEvent.click(testButton);

      // Check for loading indicator
      expect(await rtlWithin(s3Card).findByRole('progressbar')).toBeInTheDocument();
      expect(rtlWithin(s3Card).getByText('Checking...')).toBeInTheDocument();

      // Wait for the status to update to Online
      expect(await rtlWithin(s3Card).findByText('Online')).toBeInTheDocument();
      expect(adminService.checkS3Connectivity).toHaveBeenCalledTimes(1);
      
      // Expand details
      const expandButton = rtlWithin(s3Card).getByRole('button', { name: /expand/i }); // MUI uses aria-label "Show more" or "Show less" or similar, or check icon
      fireEvent.click(expandButton);
      expect(await rtlWithin(s3Card).findByText('S3 Connection OK')).toBeInTheDocument();
    });

    test('handles S3 connection failure and updates status to Error', async () => {
      adminService.checkS3Connectivity.mockResolvedValueOnce({ success: false, message: 'S3 Connection Failed' });
      renderWithTheme(<DiagnosticsPage />);

      const s3Card = screen.getByText('S3 Storage (Avatars)').closest('div[class*="MuiCard-root"]');
      const testButton = rtlWithin(s3Card).getByRole('button', { name: /Test/i });
      fireEvent.click(testButton);

      expect(await rtlWithin(s3Card).findByRole('progressbar')).toBeInTheDocument();
      expect(await rtlWithin(s3Card).findByText('Error')).toBeInTheDocument();
      expect(adminService.checkS3Connectivity).toHaveBeenCalledTimes(1);
      
      const expandButton = rtlWithin(s3Card).getByRole('button', { name: /expand/i });
      fireEvent.click(expandButton);
      expect(await rtlWithin(s3Card).findByText('S3 Connection Failed')).toBeInTheDocument();
    });
  });

  describe('Patient Data (DynamoDB) Service Testing', () => {
    const serviceName = 'Patient Data (DynamoDB)';
    const apiId = 'patients'; // as defined in initialServicesData

    test('successfully tests all CRUD operations and updates status to Online', async () => {
      adminService.checkDynamoDBCrud.mockResolvedValueOnce({
        create: 'OK', read: 'OK', update: 'OK', delete: 'OK',
      });
      renderWithTheme(<DiagnosticsPage />);

      const serviceCard = screen.getByText(serviceName).closest('div[class*="MuiCard-root"]');
      const testButton = rtlWithin(serviceCard).getByRole('button', { name: /Test/i });
      fireEvent.click(testButton);

      expect(await rtlWithin(serviceCard).findByText('Online')).toBeInTheDocument();
      expect(adminService.checkDynamoDBCrud).toHaveBeenCalledWith(apiId);
      
      // Check for API Gateway and Lambdas to also be Online
      const apiGatewayCard = screen.getByText('API Gateway').closest('div[class*="MuiCard-root"]');
      expect(await rtlWithin(apiGatewayCard).findByText('Online')).toBeInTheDocument();
      const lambdaCard = screen.getByText('Lambda Functions').closest('div[class*="MuiCard-root"]');
      expect(await rtlWithin(lambdaCard).findByText('Online')).toBeInTheDocument();

      // Expand details and check CRUD chips
      const expandButton = rtlWithin(serviceCard).getByRole('button', { name: /expand/i });
      fireEvent.click(expandButton);
      expect(await rtlWithin(serviceCard).findByText('All operations successful.')).toBeInTheDocument();
      expect(rtlWithin(serviceCard).getByText(/C: OK/)).toBeInTheDocument();
      expect(rtlWithin(serviceCard).getByText(/R: OK/)).toBeInTheDocument();
      expect(rtlWithin(serviceCard).getByText(/U: OK/)).toBeInTheDocument();
      expect(rtlWithin(serviceCard).getByText(/D: OK/)).toBeInTheDocument();
    });

    test('handles all CRUD operations failing and updates status to Offline', async () => {
      adminService.checkDynamoDBCrud.mockResolvedValueOnce({
        create: 'Failed: Network Error', read: 'Failed: Timeout', update: 'Failed: Access Denied', delete: 'Failed: Server Error',
      });
      renderWithTheme(<DiagnosticsPage />);
      
      const serviceCard = screen.getByText(serviceName).closest('div[class*="MuiCard-root"]');
      const testButton = rtlWithin(serviceCard).getByRole('button', { name: /Test/i });
      fireEvent.click(testButton);

      expect(await rtlWithin(serviceCard).findByText('Offline')).toBeInTheDocument();
      expect(adminService.checkDynamoDBCrud).toHaveBeenCalledWith(apiId);

      // Check for API Gateway and Lambdas to be Error
      const apiGatewayCard = screen.getByText('API Gateway').closest('div[class*="MuiCard-root"]');
      expect(await rtlWithin(apiGatewayCard).findByText('Error')).toBeInTheDocument();
      const lambdaCard = screen.getByText('Lambda Functions').closest('div[class*="MuiCard-root"]');
      expect(await rtlWithin(lambdaCard).findByText('Error')).toBeInTheDocument();
      
      const expandButton = rtlWithin(serviceCard).getByRole('button', { name: /expand/i });
      fireEvent.click(expandButton);
      expect(await rtlWithin(serviceCard).findByText('All operations failed or resulted in errors. Service is offline.')).toBeInTheDocument();
      expect(rtlWithin(serviceCard).getByText(/C: Failed: Network Error/)).toBeInTheDocument();
      // ... check other chips ...
    });

    test('handles mixed CRUD results (some OK, some Fail) and updates status to Error', async () => {
      adminService.checkDynamoDBCrud.mockResolvedValueOnce({
        create: 'OK', read: 'Failed: Timeout', update: 'OK', delete: 'Failed: Server Error',
      });
      renderWithTheme(<DiagnosticsPage />);
      
      const serviceCard = screen.getByText(serviceName).closest('div[class*="MuiCard-root"]');
      const testButton = rtlWithin(serviceCard).getByRole('button', { name: /Test/i });
      fireEvent.click(testButton);

      expect(await rtlWithin(serviceCard).findByText('Error')).toBeInTheDocument();
      expect(adminService.checkDynamoDBCrud).toHaveBeenCalledWith(apiId);

      // API Gateway and Lambdas should also be Error
      const apiGatewayCard = screen.getByText('API Gateway').closest('div[class*="MuiCard-root"]');
      expect(await rtlWithin(apiGatewayCard).findByText('Error')).toBeInTheDocument();

      const expandButton = rtlWithin(serviceCard).getByRole('button', { name: /expand/i });
      fireEvent.click(expandButton);
      expect(await rtlWithin(serviceCard).findByText('One or more operations failed.')).toBeInTheDocument();
      expect(rtlWithin(serviceCard).getByText(/C: OK/)).toBeInTheDocument();
      expect(rtlWithin(serviceCard).getByText(/R: Failed: Timeout/)).toBeInTheDocument();
    });
    
    test('handles some CRUD ops OK, some Unknown and updates status to Potentially Degraded', async () => {
      adminService.checkDynamoDBCrud.mockResolvedValueOnce({
        create: 'OK', read: 'Unknown', update: 'OK', delete: 'Unknown',
      });
      renderWithTheme(<DiagnosticsPage />);
      
      const serviceCard = screen.getByText(serviceName).closest('div[class*="MuiCard-root"]');
      const testButton = rtlWithin(serviceCard).getByRole('button', { name: /Test/i });
      fireEvent.click(testButton);

      expect(await rtlWithin(serviceCard).findByText('Potentially Degraded')).toBeInTheDocument();
      expect(adminService.checkDynamoDBCrud).toHaveBeenCalledWith(apiId);
      
      // API Gateway and Lambdas should be Potentially Degraded
      const apiGatewayCard = screen.getByText('API Gateway').closest('div[class*="MuiCard-root"]');
      expect(await rtlWithin(apiGatewayCard).findByText('Potentially Degraded')).toBeInTheDocument();

      const expandButton = rtlWithin(serviceCard).getByRole('button', { name: /expand/i });
      fireEvent.click(expandButton);
      expect(await rtlWithin(serviceCard).findByText('Some operations have issues or are in an unknown state.')).toBeInTheDocument();
      expect(rtlWithin(serviceCard).getByText(/C: OK/)).toBeInTheDocument();
      expect(rtlWithin(serviceCard).getByText(/R: Unknown/)).toBeInTheDocument();
    });

    test('handles direct error from checkDynamoDBCrud and updates status to Error', async () => {
      adminService.checkDynamoDBCrud.mockRejectedValueOnce(new Error('Network connection failed'));
      renderWithTheme(<DiagnosticsPage />);

      const serviceCard = screen.getByText(serviceName).closest('div[class*="MuiCard-root"]');
      const testButton = rtlWithin(serviceCard).getByRole('button', { name: /Test/i });
      fireEvent.click(testButton);

      // Service itself should be Error
      expect(await rtlWithin(serviceCard).findByText('Error')).toBeInTheDocument();
      // API Gateway and Lambdas should also be Error due to dependency failure
      const apiGatewayCard = screen.getByText('API Gateway').closest('div[class*="MuiCard-root"]');
      expect(await rtlWithin(apiGatewayCard).findByText('Error')).toBeInTheDocument();
      const lambdaCard = screen.getByText('Lambda Functions').closest('div[class*="MuiCard-root"]');
      expect(await rtlWithin(lambdaCard).findByText('Error')).toBeInTheDocument();
      
      const expandButton = rtlWithin(serviceCard).getByRole('button', { name: /expand/i });
      fireEvent.click(expandButton);
      expect(await rtlWithin(serviceCard).findByText('Network connection failed')).toBeInTheDocument();
    });

  });

  describe('User Data (Cognito) Service Testing', () => {
    const serviceName = 'User Data (Cognito)';
    // const apiId = 'cognito_users'; // Not passed for checkCognitoUsersCrud

    test('successfully tests all Cognito CRUD operations and updates status to Online', async () => {
      adminService.checkCognitoUsersCrud.mockResolvedValueOnce({
        create: 'OK', read: 'OK', update: 'OK', delete: 'OK (cleaned up)',
      });
      renderWithTheme(<DiagnosticsPage />);

      const serviceCard = screen.getByText(serviceName).closest('div[class*="MuiCard-root"]');
      const testButton = rtlWithin(serviceCard).getByRole('button', { name: /Test/i });
      fireEvent.click(testButton);

      expect(await rtlWithin(serviceCard).findByText('Online')).toBeInTheDocument();
      expect(adminService.checkCognitoUsersCrud).toHaveBeenCalledTimes(1);
      
      const apiGatewayCard = screen.getByText('API Gateway').closest('div[class*="MuiCard-root"]');
      expect(await rtlWithin(apiGatewayCard).findByText('Online')).toBeInTheDocument();
      const lambdaCard = screen.getByText('Lambda Functions').closest('div[class*="MuiCard-root"]');
      expect(await rtlWithin(lambdaCard).findByText('Online')).toBeInTheDocument();

      const expandButton = rtlWithin(serviceCard).getByRole('button', { name: /expand/i });
      fireEvent.click(expandButton);
      expect(await rtlWithin(serviceCard).findByText('All operations successful.')).toBeInTheDocument();
      expect(rtlWithin(serviceCard).getByText(/C: OK/)).toBeInTheDocument();
      expect(rtlWithin(serviceCard).getByText(/D: OK \(cleaned up\)/)).toBeInTheDocument();
    });

    test('handles all Cognito CRUD operations failing and updates status to Offline', async () => {
      adminService.checkCognitoUsersCrud.mockResolvedValueOnce({
        create: 'Failed', read: 'Failed', update: 'Failed', delete: 'Failed',
      });
      renderWithTheme(<DiagnosticsPage />);
      
      const serviceCard = screen.getByText(serviceName).closest('div[class*="MuiCard-root"]');
      const testButton = rtlWithin(serviceCard).getByRole('button', { name: /Test/i });
      fireEvent.click(testButton);

      expect(await rtlWithin(serviceCard).findByText('Offline')).toBeInTheDocument();
      expect(adminService.checkCognitoUsersCrud).toHaveBeenCalledTimes(1);

      const apiGatewayCard = screen.getByText('API Gateway').closest('div[class*="MuiCard-root"]');
      expect(await rtlWithin(apiGatewayCard).findByText('Error')).toBeInTheDocument();
      
      const expandButton = rtlWithin(serviceCard).getByRole('button', { name: /expand/i });
      fireEvent.click(expandButton);
      expect(await rtlWithin(serviceCard).findByText('All operations failed or resulted in errors. Service is offline.')).toBeInTheDocument();
    });
    
    // Add more tests for Cognito: mixed results, direct error, etc. as comprehensive as DynamoDB tests
    test('handles mixed Cognito CRUD results (some OK, some Fail) and updates status to Error', async () => {
        adminService.checkCognitoUsersCrud.mockResolvedValueOnce({
            create: 'OK', read: 'Failed: Something went wrong', update: 'OK', delete: 'Failed',
        });
        renderWithTheme(<DiagnosticsPage />);
        
        const serviceCard = screen.getByText(serviceName).closest('div[class*="MuiCard-root"]');
        const testButton = rtlWithin(serviceCard).getByRole('button', { name: /Test/i });
        fireEvent.click(testButton);

        expect(await rtlWithin(serviceCard).findByText('Error')).toBeInTheDocument();
        const apiGatewayCard = screen.getByText('API Gateway').closest('div[class*="MuiCard-root"]');
        expect(await rtlWithin(apiGatewayCard).findByText('Error')).toBeInTheDocument();

        const expandButton = rtlWithin(serviceCard).getByRole('button', { name: /expand/i });
        fireEvent.click(expandButton);
        expect(rtlWithin(serviceCard).getByText(/R: Failed: Something went wrong/)).toBeInTheDocument();
    });

    test('handles direct error from checkCognitoUsersCrud and updates status to Error', async () => {
        adminService.checkCognitoUsersCrud.mockRejectedValueOnce(new Error('Cognito service unavailable'));
        renderWithTheme(<DiagnosticsPage />);

        const serviceCard = screen.getByText(serviceName).closest('div[class*="MuiCard-root"]');
        const testButton = rtlWithin(serviceCard).getByRole('button', { name: /Test/i });
        fireEvent.click(testButton);

        expect(await rtlWithin(serviceCard).findByText('Error')).toBeInTheDocument();
        const apiGatewayCard = screen.getByText('API Gateway').closest('div[class*="MuiCard-root"]');
        expect(await rtlWithin(apiGatewayCard).findByText('Error')).toBeInTheDocument();
        
        const expandButton = rtlWithin(serviceCard).getByRole('button', { name: /expand/i });
        fireEvent.click(expandButton);
        expect(await rtlWithin(serviceCard).findByText('Cognito service unavailable')).toBeInTheDocument();
    });

  });
});
