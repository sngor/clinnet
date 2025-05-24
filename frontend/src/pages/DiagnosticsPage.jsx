import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
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

  const determineOverallStatus = (crudSt) => {
    if (!crudSt || typeof crudSt !== 'object') return 'Unknown';
    const ops = ['create', 'read', 'update', 'delete'];
    const statuses = ops.map(op => crudSt[op]).filter(s => s !== undefined);

    if (statuses.every(s => s === 'Checking...')) return 'Checking...';
    if (statuses.length < ops.length && !statuses.every(s => s === 'Unknown')) return 'Potentially Degraded';
    if (statuses.every(s => s === 'OK' || s === 'OK (cleaned up)')) return 'Online';
    if (statuses.some(s => s && typeof s === 'string' && !['OK', 'OK (cleaned up)', 'Unknown', 'PENDING', 'SKIPPED - User not created by this test.', 'Checking...'].includes(s))) return 'Error';
    if (statuses.some(s => s === 'OK' || s === 'OK (cleaned up)')) return 'Potentially Degraded';
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
            const newOverallStatus = determineOverallStatus(response); // response is the crudStatus object
            return {
              ...s,
              status: newOverallStatus,
              crudStatus: { 
                create: response.create || 'Unknown', read: response.read || 'Unknown',
                update: response.update || 'Unknown', delete: response.delete || 'Unknown',
              },
              details: response.cleanup_error ? `Cleanup: ${response.cleanup_error}` : (newOverallStatus === 'Online' ? 'All operations successful.' : (newOverallStatus === 'Error' ? 'One or more operations failed.' : (newOverallStatus === 'Potentially Degraded' ? 'Some operations have issues.' : 'Test complete.')))
            };
          } else { 
            if (response && response.success) {
              return { ...s, status: 'Online', details: response.message };
            } else {
              return { ...s, status: 'Error', details: response?.message || `${s.name} test failed.` };
            }
          }
        }
        return s;
      });
      
      const anyOnline = servicesAfterTest.some(s => s.testable && s.status === 'Online' && s.id !== 'apiGateway' && s.id !== 'lambdas');
      const anyError = servicesAfterTest.some(s => s.testable && s.status === 'Error' && s.id !== 'apiGateway' && s.id !== 'lambdas');
      const anyPotentiallyDegraded = servicesAfterTest.some(s => s.testable && s.status === 'Potentially Degraded' && s.id !== 'apiGateway' && s.id !== 'lambdas');

      servicesAfterTest = servicesAfterTest.map(s => {
        if (s.id === 'apiGateway' || s.id === 'lambdas') {
          if (anyOnline) return { ...s, status: 'Online', details: 'Connectivity implied by successful dependent service test.' };
          if (anyError) return { ...s, status: 'Error', details: 'Connectivity potentially compromised due to dependent service failure.' };
          if (anyPotentiallyDegraded) return { ...s, status: 'Potentially Degraded', details: 'Dependent services reporting mixed status.' };
          return { ...s, status: 'Unknown', details: ''};
        }
        return s;
      });
      setServices(servicesAfterTest);

    } catch (error) {
      setServices(prev => {
        let afterCatchServices = prev.map(s => s.id === serviceId ? { ...s, status: 'Error', details: error.message || `An unknown error occurred testing ${serviceToTest.name}.` } : s);
        afterCatchServices = afterCatchServices.map(s_ => {
            if(s_.id === 'apiGateway' || s_.id === 'lambdas') {
                return {...s_, status: 'Potentially Degraded', details: `Test for ${serviceToTest.name} failed, impacting API/Lambda status.`};
            }
            return s_;
        });
        return afterCatchServices;
      });
    }
  };

  const getStatusProps = (status) => {
    switch (status) {
      case 'Online': return { color: 'success', icon: <CheckCircleOutlineIcon /> };
      case 'Error': return { color: 'error', icon: <ErrorOutlineIcon /> };
      case 'Checking...': return { color: 'warning', icon: <HourglassEmptyIcon /> };
      case 'Potentially Degraded': return { color: 'info', icon: <SyncProblemIcon /> };
      case 'Unknown':
      default: return { color: 'default', icon: <HelpOutlineIcon /> };
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>System Diagnostics</Typography>
      <List>
        {services.map((service) => {
          const statusProps = getStatusProps(service.status);
          return (
            <React.Fragment key={service.id}>
              <ListItem>
                <ListItemIcon>{service.icon}</ListItemIcon>
                <ListItemText primary={service.name} />
                <Chip
                  icon={statusProps.icon}
                  label={service.status}
                  color={statusProps.color}
                  variant="filled"
                  sx={{ width: '180px', textAlign: 'left', mr: 2 }}
                />
                {service.testable && (
                  <Button
                    variant="contained"
                    onClick={() => handleTestService(service.id)}
                    disabled={service.status === 'Checking...'}
                    sx={{ width: '100px' }}
                  >
                    {service.status === 'Checking...' ? <CircularProgress size={24} /> : 'Test'}
                  </Button>
                )}
              </ListItem>

              {service.isCrudService && service.crudStatus && (
                <ListItem sx={{ pl: 9, pt: 0, pb: 0.5, display: 'block' }} dense>
                  <ListItemText 
                    secondaryTypographyProps={{ component: 'div' }}
                    secondary={
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                        {Object.entries(service.crudStatus)
                          .filter(([key]) => ['create', 'read', 'update', 'delete'].includes(key))
                          .map(([op, opStat]) => {
                            let chipColor = 'default';
                            let displayStatus = opStat || 'Unknown';
                            if (displayStatus === 'OK' || displayStatus === 'OK (cleaned up)') chipColor = 'success';
                            else if (displayStatus === 'Checking...') chipColor = 'warning';
                            else if (displayStatus !== 'Unknown' && displayStatus !== 'PENDING' && displayStatus !== 'SKIPPED - User not created by this test.') chipColor = 'error';
                            
                            return (
                              <Chip
                                key={op}
                                label={`${op.charAt(0).toUpperCase()}: ${displayStatus.substring(0, 20)}${displayStatus.length > 20 ? '...' : ''}`}
                                size="small"
                                color={chipColor}
                                variant="outlined"
                                sx={{mr:0.5, mb:0.5}}
                              />
                            );
                          })}
                      </Box>
                    } 
                  />
                </ListItem>
              )}

              {service.details && (
                <ListItem sx={{ pl: 9, pt: 0, pb: 1 }} dense>
                  <ListItemText 
                     secondary={service.details} 
                     secondaryTypographyProps={{
                         variant: 'caption',
                         sx: { color: (service.status === 'Error' && !service.isCrudService) || (service.isCrudService && service.details && (service.details.toLowerCase().includes('failed') || service.details.toLowerCase().includes('error'))) ? 'error.main' : 'text.secondary' }
                     }} 
                   />
                </ListItem>
              )}
              <Divider component="li" sx={{mb:1}} />
            </React.Fragment>
          );
        })}
      </List>
    </Container>
  );
};

export default DiagnosticsPage;
