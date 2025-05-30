import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Divider,
  Grid, // Added Grid
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LanguageIcon from '@mui/icons-material/Language';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import FunctionsIcon from '@mui/icons-material/Functions';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import DescriptionIcon from '@mui/icons-material/Description';
import ListAltIcon from '@mui/icons-material/ListAlt';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import adminService from '../services/adminService';
import ServiceCard from '../components/ServiceCard'; // Import ServiceCard

const initialServicesData = [
  { id: 'site', name: 'Site Frontend', apiId: 'site', testFunction: null, status: 'Online', details: 'Page loaded successfully.', testable: false, icon: <LanguageIcon />, isCrudService: false, crudStatus: null },
  { id: 'apiGateway', name: 'API Gateway', apiId: 'apiGateway', testFunction: null, status: 'Unknown', details: '', testable: false, icon: <CloudQueueIcon />, isCrudService: false, crudStatus: null },
  { id: 'lambdas', name: 'Lambda Functions', apiId: 'lambdas', testFunction: null, status: 'Unknown', details: '', testable: false, icon: <FunctionsIcon />, isCrudService: false, crudStatus: null },
  { id: 's3', name: 'S3 Storage (Avatars)', apiId: 's3', testFunction: adminService.checkS3Connectivity, status: 'Unknown', details: '', testable: true, icon: <StorageIcon />, isCrudService: false, crudStatus: null },
  { id: 'patientData', name: 'Patient Data (DynamoDB)', apiId: 'patients', testFunction: adminService.checkDynamoDBCrud, status: 'Unknown', crudStatus: { create: 'Unknown', read: 'Unknown', update: 'Unknown', delete: 'Unknown' }, details: '', testable: true, icon: <DescriptionIcon />, isCrudService: true },
  { id: 'serviceData', name: 'Services Data (DynamoDB)', apiId: 'services', testFunction: adminService.checkDynamoDBCrud, status: 'Unknown', crudStatus: { create: 'Unknown', read: 'Unknown', update: 'Unknown', delete: 'Unknown' }, details: '', testable: true, icon: <ListAltIcon />, isCrudService: true },
  { id: 'appointmentData', name: 'Appointment Data (DynamoDB)', apiId: 'appointments', testFunction: adminService.checkDynamoDBCrud, status: 'Unknown', crudStatus: { create: 'Unknown', read: 'Unknown', update: 'Unknown', delete: 'Unknown' }, details: '', testable: true, icon: <EventNoteIcon />, isCrudService: true },
  { id: 'cognitoUserData', name: 'User Data (Cognito)', apiId: 'cognito_users', testFunction: adminService.checkCognitoUsersCrud, status: 'Unknown', crudStatus: { create: 'Unknown', read: 'Unknown', update: 'Unknown', delete: 'Unknown' }, details: '', testable: true, icon: <PeopleAltIcon />, isCrudService: true }
];

const DiagnosticsPage = () => {
  const theme = useTheme();
  const [services, setServices] = useState(initialServicesData);

  // Removed getStatusProps function as it's now in ServiceCard.jsx

  const determineOverallStatus = (crudSt) => {
    if (!crudSt || typeof crudSt !== 'object') return 'Unknown';
    const ops = ['create', 'read', 'update', 'delete'];
    const statuses = ops.map(op => crudSt[op]).filter(s => s !== undefined);

    const ops = ['create', 'read', 'update', 'delete'];
    const currentStatuses = ops.map(op => crudSt[op]).filter(s => s !== undefined); // Renamed to avoid conflict

    if (currentStatuses.every(s => s === 'Checking...')) return 'Checking...';

    const successfulOps = currentStatuses.filter(s => s === 'OK' || s === 'OK (cleaned up)').length;
    const benignOps = currentStatuses.filter(s => ['Unknown', 'PENDING', 'SKIPPED - User not created by this test.'].includes(s)).length;
    const checkingOps = currentStatuses.filter(s => s === 'Checking...').length;
    // Any status string that isn't OK, OK (cleaned up), Unknown, PENDING, SKIPPED, or Checking... is an error.
    const errorOps = currentStatuses.filter(s => s && typeof s === 'string' && !['OK', 'OK (cleaned up)', 'Unknown', 'PENDING', 'SKIPPED - User not created by this test.', 'Checking...'].includes(s)).length;

    if (successfulOps === ops.length) return 'Online'; // All 4 ops are successful

    // Condition for Offline: No successful operations, and at least one actual error.
    // The rest can be errors or benign/checking.
    if (successfulOps === 0 && errorOps > 0) {
        return 'Offline';
    }

    // Condition for Error: At least one error, but some operations might be successful or unknown.
    // This distinguishes from 'Offline' where *nothing* works.
    if (errorOps > 0) return 'Error';
    
    // Condition for Potentially Degraded: Some successes, but not all, and no errors.
    // Or, if all are unknown/pending/skipped but not all operations reported.
    if (successfulOps > 0 && successfulOps < ops.length) return 'Potentially Degraded';
    if (currentStatuses.length < ops.length && currentStatuses.every(s => ['Unknown', 'PENDING', 'SKIPPED - User not created by this test.', 'Checking...'].includes(s))) return 'Potentially Degraded';


    // Default to Unknown if none of the above conditions are met (e.g., all are Unknown)
    return 'Unknown';
  };

  const handleTestService = async (serviceId) => {
    const serviceToTest = services.find(s => s.id === serviceId);
    if (!serviceToTest || !serviceToTest.testFunction) return;

    setServices(prev => prev.map(s => s.id === serviceId ? { 
      ...s, 
      status: 'Checking...', 
      details: '', 
      crudStatus: s.isCrudService ? { create: 'Checking...', read: 'Checking...', update: 'Checking...', delete: 'Checking...' } : s.crudStatus 
    } : s));

    try {
      let response;
      if (serviceToTest.apiId === 's3' || serviceToTest.apiId === 'cognito_users') {
        response = await serviceToTest.testFunction();
      } else { 
        response = await serviceToTest.testFunction(serviceToTest.apiId);
      }

      let servicesAfterTest = services.map(s => {
        if (s.id === serviceId) {
          if (s.isCrudService) {
            const crudStatusObject = {
              create: response.create || 'Unknown', read: response.read || 'Unknown',
              update: response.update || 'Unknown', delete: response.delete || 'Unknown',
            };
            const newOverallStatus = determineOverallStatus(crudStatusObject);
            let detailsMessage = 'Test complete.';
            if (newOverallStatus === 'Online') detailsMessage = 'All operations successful.';
            else if (newOverallStatus === 'Offline') detailsMessage = 'All operations failed or resulted in errors. Service is offline.';
            else if (newOverallStatus === 'Error') detailsMessage = 'One or more operations failed.';
            else if (newOverallStatus === 'Potentially Degraded') detailsMessage = 'Some operations have issues or are in an unknown state.';
            if(response.cleanup_error) detailsMessage += ` Cleanup: ${response.cleanup_error}`;

            return {
              ...s,
              status: newOverallStatus,
              crudStatus: crudStatusObject,
              details: detailsMessage
            };
          } else {
            // For non-CRUD services like S3
            if (response && response.success) {
              return { ...s, status: 'Online', details: response.message };
            } else {
              return { ...s, status: 'Error', details: response?.message || `${s.name} test failed.` };
            }
          }

        }
        return s;
      });
      
      // Determine status for API Gateway and Lambdas based on other testable services
      const testableServices = servicesAfterTest.filter(s => s.testable && s.id !== 'apiGateway' && s.id !== 'lambdas');
      const anyOnline = testableServices.some(s => s.status === 'Online');
      const anyError = testableServices.some(s => s.status === 'Error');
      const anyOffline = testableServices.some(s => s.status === 'Offline'); // Added check for Offline
      const anyPotentiallyDegraded = testableServices.some(s => s.status === 'Potentially Degraded');

      servicesAfterTest = servicesAfterTest.map(s => {
        if (s.id === 'apiGateway' || s.id === 'lambdas') {
          if (anyOffline) return { ...s, status: 'Error', details: 'Critical dependency offline. Gateway/Lambdas likely non-functional.' }; // If any dependency is Offline, gateway is Error
          if (anyError) return { ...s, status: 'Error', details: 'Connectivity potentially compromised due to dependent service failure.' };
          if (anyOnline && !anyError && !anyOffline && !anyPotentiallyDegraded) return { ...s, status: 'Online', details: 'Connectivity implied by successful dependent service tests.' };
          if (anyPotentiallyDegraded) return { ...s, status: 'Potentially Degraded', details: 'Dependent services reporting mixed status.' };
          // If only Unknown or a mix that doesn't fit above, keep as Unknown or determine a more specific status
          return { ...s, status: 'Unknown', details: 'Status of dependent services is unclear or mixed without clear errors.'};
        }
        return s;
      });

      setServices(servicesAfterTest);

    } catch (error) {
      // This catch block handles errors from the testFunction itself (e.g., network error calling the adminService)
      setServices(prev => {
        const serviceFailedId = serviceId; // serviceId from outer scope
        let afterCatchServices = prev.map(s => 
          s.id === serviceFailedId ? { ...s, status: 'Error', details: error.message || `An unknown error occurred testing ${s.name}.` } : s
        );
        
        // Check if this failure should impact API Gateway/Lambdas
        const failedServiceImpactsGateway = prev.find(s => s.id === serviceFailedId && s.testable);

        if (failedServiceImpactsGateway) {
          afterCatchServices = afterCatchServices.map(s_ => {
              if(s_.id === 'apiGateway' || s_.id === 'lambdas') {
                  // If API Gateway/Lambdas are not already Error or Offline, mark as Potentially Degraded or Error
                  if (s_.status !== 'Error' && s_.status !== 'Offline') {
                    return {...s_, status: 'Error', details: `Test for ${failedServiceImpactsGateway.name} failed directly, impacting API/Lambda status.`};
                  }
              }
              return s_;
          });
        }
        return afterCatchServices;
      });
    }
  };

  // Removed getStatusProps function as it's now in ServiceCard.jsx

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        System Diagnostics
      </Typography>

      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid item xs={12} md={6} lg={4} key={service.id}>
            <ServiceCard service={service} onTestService={handleTestService} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default DiagnosticsPage;
