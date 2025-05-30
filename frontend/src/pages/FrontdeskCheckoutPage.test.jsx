import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import FrontdeskCheckoutPage from './FrontdeskCheckoutPage';
import serviceApi from '../../services/serviceApi';
import patientService from '../../services/patientService';
import { apiPost } from '../../utils/api-helper';

// Mock the services and apiPost
jest.mock('../../services/serviceApi');
jest.mock('../../services/patientService');
jest.mock('../../utils/api-helper');

const mockPatients = [
  { id: 'P001', firstName: 'John', lastName: 'Doe', status: 'waiting' },
  { id: 'P002', firstName: 'Jane', lastName: 'Smith', status: 'in-progress' },
];

const mockServices = [
  { id: 'S001', name: 'General Consultation', price: 50 },
  { id: 'S002', name: 'Blood Test', price: 75 },
  { id: 'S003', name: 'X-Ray', price: 120 },
];

// Helper to resolve promises in tests
const flushPromises = () => new Promise(setImmediate);

describe('FrontdeskCheckoutPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    serviceApi.getAllServices.mockReset();
    patientService.getPatients.mockReset();
    apiPost.mockReset();

    // Default successful mocks
    serviceApi.getAllServices.mockResolvedValue({ data: mockServices });
    patientService.getPatients.mockResolvedValue({ data: mockPatients });
    apiPost.mockResolvedValue({ data: { success: true, transactionId: 'T123' } });

    // Mock window.alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    window.alert.mockRestore();
  });

  describe('Initial Render & Data Fetching', () => {
    test('renders page heading and loading indicator initially', () => {
      render(<FrontdeskCheckoutPage />);
      expect(screen.getByText('Patient Checkout')).toBeInTheDocument();
      expect(screen.getByText('Loading patients...')).toBeInTheDocument();
    });

    test('calls APIs on mount and populates lists on success', async () => {
      render(<FrontdeskCheckoutPage />);
      
      expect(patientService.getPatients).toHaveBeenCalledTimes(1);
      expect(serviceApi.getAllServices).toHaveBeenCalledTimes(1);

      // Wait for loading to finish
      await waitFor(() => expect(screen.queryByText('Loading patients...')).not.toBeInTheDocument());

      // Check if patient and service names are rendered
      expect(screen.getByText('John Doe')).toBeInTheDocument(); // Transformed name
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('General Consultation')).toBeInTheDocument();
      expect(screen.getByText('Blood Test')).toBeInTheDocument();
    });

    test('handles patient API error', async () => {
      patientService.getPatients.mockRejectedValueOnce(new Error('Failed to fetch patients'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<FrontdeskCheckoutPage />);
      
      await waitFor(() => expect(screen.queryByText('Loading patients...')).not.toBeInTheDocument());
      
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching initial data:", expect.any(Error));
      // Example: Check if an error message is shown or if lists are empty
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      consoleErrorSpy.mockRestore();
    });

    test('handles service API error', async () => {
      serviceApi.getAllServices.mockRejectedValueOnce(new Error('Failed to fetch services'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<FrontdeskCheckoutPage />);

      await waitFor(() => expect(screen.queryByText('Loading patients...')).not.toBeInTheDocument());
      
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching initial data:", expect.any(Error));
      expect(screen.queryByText('General Consultation')).not.toBeInTheDocument();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Patient Interaction', () => {
    test('allows searching and selecting a patient', async () => {
      render(<FrontdeskCheckoutPage />);
      await waitFor(() => expect(screen.queryByText('Loading patients...')).not.toBeInTheDocument());

      fireEvent.change(screen.getByPlaceholderText('Search patients...'), { target: { value: 'John' } });
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('John Doe'));
      // Check if checkout section updates
      expect(screen.getByText('Checkout: John Doe')).toBeInTheDocument();
      expect(screen.getByText('Patient ID: P001')).toBeInTheDocument();
    });
  });

  describe('Service Interaction', () => {
    beforeEach(async () => {
      render(<FrontdeskCheckoutPage />);
      await waitFor(() => expect(screen.queryByText('Loading patients...')).not.toBeInTheDocument());
      // Select a patient first
      fireEvent.click(screen.getByText('John Doe'));
      await screen.findByText('Checkout: John Doe'); // Wait for patient selection to reflect
    });

    test('allows selecting and deselecting services, updates totals', async () => {
      // Select 'General Consultation' ($50)
      const consultationButton = screen.getByText('General Consultation').closest('button');
      fireEvent.click(consultationButton);
      
      // Check selected services list
      expect(screen.getByText('Selected Services')).toBeInTheDocument();
      expect(screen.getByText((content, element) => element.tagName.toLowerCase() === 'li' && content.startsWith('General Consultation'))).toBeInTheDocument();
      expect(screen.getByText('$50.00', { selector: 'p' })).toBeInTheDocument(); // Subtotal
      expect(screen.getByText('$50.00', { selector: 'h6' })).toBeInTheDocument(); // Total

      // Select 'Blood Test' ($75)
      const bloodTestButton = screen.getByText('Blood Test').closest('button');
      fireEvent.click(bloodTestButton);

      await waitFor(() => expect(screen.getByText('$125.00', { selector: 'p' })).toBeInTheDocument()); // Subtotal
      expect(screen.getByText('$125.00', { selector: 'h6' })).toBeInTheDocument(); // Total

      // Remove 'General Consultation'
      const deleteButtons = screen.getAllByLabelText('delete');
      fireEvent.click(deleteButtons[0]); // Assuming it's the first selected service

      await waitFor(() => expect(screen.getByText('$75.00', { selector: 'p' })).toBeInTheDocument()); // Subtotal
      expect(screen.getByText('$75.00', { selector: 'h6' })).toBeInTheDocument(); // Total
      expect(screen.queryByText((content, element) => element.tagName.toLowerCase() === 'li' && content.startsWith('General Consultation'))).not.toBeInTheDocument();
    });
  });
  
  describe('Discount Application', () => {
    beforeEach(async () => {
      render(<FrontdeskCheckoutPage />);
      await waitFor(() => expect(screen.queryByText('Loading patients...')).not.toBeInTheDocument());
      fireEvent.click(screen.getByText('John Doe')); // Select patient
      await screen.findByText('Checkout: John Doe');
      const consultationButton = screen.getByText('General Consultation').closest('button'); // Price $50
      fireEvent.click(consultationButton);
      const bloodTestButton = screen.getByText('Blood Test').closest('button'); // Price $75
      fireEvent.click(bloodTestButton); // Total $125
      await waitFor(() => expect(screen.getByText('$125.00', { selector: 'p' })).toBeInTheDocument());
    });

    test('applies percentage discount correctly', async () => {
      fireEvent.mouseDown(screen.getByLabelText('Type')); // Open select
      fireEvent.click(screen.getByText('Percentage (%)')); // Select percentage type

      const discountInput = screen.getByLabelText('Discount %');
      fireEvent.change(discountInput, { target: { value: '10' } }); // 10% discount

      await waitFor(() => expect(screen.getByText('$112.50', { selector: 'h6' })).toBeInTheDocument()); // 125 * 0.9 = 112.50
      expect(screen.getByText('-$12.50')).toBeInTheDocument(); // Discount amount
    });

    test('applies fixed amount discount correctly', async () => {
      fireEvent.mouseDown(screen.getByLabelText('Type'));
      fireEvent.click(screen.getByText('Fixed Amount ($)'));

      const discountInput = screen.getByLabelText('Discount $');
      fireEvent.change(discountInput, { target: { value: '25' } }); // $25 discount

      await waitFor(() => expect(screen.getByText('$100.00', { selector: 'h6' })).toBeInTheDocument()); // 125 - 25 = 100
      expect(screen.getByText('-$25.00')).toBeInTheDocument(); // Discount amount
    });
  });

  describe('Checkout Process', () => {
    beforeEach(async () => {
      render(<FrontdeskCheckoutPage />);
      await waitFor(() => expect(screen.queryByText('Loading patients...')).not.toBeInTheDocument());
      
      // Select Patient
      fireEvent.click(screen.getByText('John Doe'));
      await screen.findByText('Checkout: John Doe');

      // Select Services
      const consultationButton = screen.getByText('General Consultation').closest('button'); // $50
      fireEvent.click(consultationButton);
      const bloodTestButton = screen.getByText('Blood Test').closest('button'); // $75
      fireEvent.click(bloodTestButton); // Total $125

      await waitFor(() => expect(screen.getByText('$125.00', { selector: 'p' })).toBeInTheDocument());

      // Select Payment Method
      fireEvent.click(screen.getByText('Cash').closest('button'));
    });

    test('Happy Path: calls apiPost with correct payload and shows receipt', async () => {
      const expectedPayload = {
        patientId: 'P001',
        items: [
          { serviceId: 'S001', quantity: 1 },
          { serviceId: 'S002', quantity: 1 },
        ],
        paymentMethod: 'cash',
        discount: 0, // No discount applied in this specific setup path
        notes: '',
        subtotal: 125,
        total: 125,
      };

      fireEvent.click(screen.getByText('Process Payment').closest('button'));

      await waitFor(() => {
        expect(apiPost).toHaveBeenCalledWith('/billing', expectedPayload);
      });
      expect(screen.getByText('Payment Receipt')).toBeInTheDocument(); // Receipt dialog title
    });
    
    test('Happy Path with discount: calls apiPost with correct discount amount', async () => {
      // Apply 10% discount
      fireEvent.mouseDown(screen.getByLabelText('Type'));
      fireEvent.click(screen.getByText('Percentage (%)'));
      fireEvent.change(screen.getByLabelText('Discount %'), { target: { value: '10' } }); // 10% discount
      await waitFor(() => expect(screen.getByText('$112.50', { selector: 'h6' })).toBeInTheDocument());


      const expectedPayload = {
        patientId: 'P001',
        items: [
          { serviceId: 'S001', quantity: 1 },
          { serviceId: 'S002', quantity: 1 },
        ],
        paymentMethod: 'cash',
        discount: 12.50, // 10% of 125
        notes: '',
        subtotal: 125,
        total: 112.50,
      };

      fireEvent.click(screen.getByText('Process Payment').closest('button'));

      await waitFor(() => {
        expect(apiPost).toHaveBeenCalledWith('/billing', expectedPayload);
      });
      expect(screen.getByText('Payment Receipt')).toBeInTheDocument();
    });


    test('Error Path: shows alert and no receipt on apiPost failure', async () => {
      apiPost.mockRejectedValueOnce(new Error('Network Error'));

      fireEvent.click(screen.getByText('Process Payment').closest('button'));

      await waitFor(() => {
        expect(apiPost).toHaveBeenCalledTimes(1);
      });
      
      expect(window.alert).toHaveBeenCalledWith('Checkout failed: Network Error');
      expect(screen.queryByText('Payment Receipt')).not.toBeInTheDocument();
    });
  });
});
