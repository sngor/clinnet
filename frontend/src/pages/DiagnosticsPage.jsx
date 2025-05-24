import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Container,
  Divider,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LanguageIcon from '@mui/icons-material/Language';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import FunctionsIcon from '@mui/icons-material/Functions';
import StorageIcon from '@mui/icons-material/Storage';
import DnsIcon from '@mui/icons-material/Dns'; // Alternative for DynamoDB: DataObjectIcon

import adminService from '../services/adminService'; // Ensure this path is correct

const initialServices = [
  { id: 'site', name: 'Site Frontend', status: 'Online', details: 'Page loaded successfully.', testable: false, icon: <LanguageIcon /> },
  { id: 'apiGateway', name: 'API Gateway', status: 'Unknown', details: '', testable: false, icon: <CloudQueueIcon /> },
  { id: 'lambdas', name: 'Lambda Functions', status: 'Unknown', details: '', testable: false, icon: <FunctionsIcon /> },
  { id: 's3', name: 'S3 Storage', status: 'Unknown', details: '', testable: true, icon: <StorageIcon /> },
  { id: 'dynamodb', name: 'DynamoDB Database', status: 'Unknown', details: '', testable: true, icon: <DnsIcon /> },
];

const DiagnosticsPage = () => {
  const [services, setServices] = useState(initialServices);

  const handleTestService = async (serviceId) => {
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, status: 'Checking...', details: '' } : s));

    try {
      const response = serviceId === 's3'
        ? await adminService.checkS3Connectivity()
        : await adminService.checkDynamoDBConnectivity();

      if (response && response.success) {
        setServices(prev => prev.map(s => s.id === serviceId ? { ...s, status: 'Online', details: response.message } : s));
        // Update API Gateway & Lambdas if this test was successful
        setServices(prev => prev.map(s => {
          if ((s.id === 'apiGateway' || s.id === 'lambdas') && s.status !== 'Error') {
            return { ...s, status: 'Online', details: `Connectivity implied by successful ${serviceId.toUpperCase()} test.` };
          }
          return s;
        }));
      } else {
        throw new Error(response?.message || 'Test failed with no specific message.');
      }
    } catch (error) {
      setServices(prev => prev.map(s => s.id === serviceId ? { ...s, status: 'Error', details: error.message || 'An unknown error occurred' } : s));
      // Optionally mark API Gateway/Lambdas as potentially degraded if a specific test fails
      setServices(prev => prev.map(s => {
        if ((s.id === 'apiGateway' || s.id === 'lambdas') && s.status !== 'Error') {
          return { ...s, status: 'Potentially Degraded', details: `A ${serviceId.toUpperCase()} test failed.` };
        }
        return s;
      }));
    }
  };

  const getStatusProps = (status) => {
    switch (status) {
      case 'Online':
        return { color: 'success', icon: <CheckCircleOutlineIcon /> };
      case 'Error':
        return { color: 'error', icon: <ErrorOutlineIcon /> };
      case 'Checking...':
        return { color: 'warning', icon: <HourglassEmptyIcon /> };
      case 'Potentially Degraded':
        return { color: 'info', icon: <HelpOutlineIcon /> }; // Or a more specific warning icon
      case 'Unknown':
      default:
        return { color: 'default', icon: <HelpOutlineIcon /> };
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        System Diagnostics
      </Typography>
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
                  sx={{ width: '180px', textAlign: 'left', mr: 2 }} // Adjusted width for longer status text
                />
                {service.testable && (
                  <Button
                    variant="contained"
                    onClick={() => handleTestService(service.id)}
                    disabled={service.status === 'Checking...'}
                    sx={{ width: '100px' }} // Consistent button width
                  >
                    {service.status === 'Checking...' ? <CircularProgress size={24} /> : 'Test'}
                  </Button>
                )}
              </ListItem>
              {service.details && (
                <ListItem sx={{ pl: 9, pt: 0, pb: 1 }}> {/* Indent details, adjust padding */}
                  <ListItemText secondary={service.details} />
                </ListItem>
              )}
              <Divider component="li" />
            </React.Fragment>
          );
        })}
      </List>
    </Container>
  );
};

export default DiagnosticsPage;
