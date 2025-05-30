import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Box,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const ServiceCard = ({ service, onTestService }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(false);

  const getStatusProps = (status) => {
    switch (status) {
      case 'Online': return { color: 'success', icon: <CheckCircleOutlineIcon sx={{ color: theme.palette.success.main }} /> };
      case 'Error': return { color: 'error', icon: <ErrorOutlineIcon sx={{ color: theme.palette.error.main }} /> };
      case 'Checking...': return { color: 'warning', icon: <HourglassEmptyIcon sx={{ color: theme.palette.warning.main }} /> };
      case 'Potentially Degraded': return { color: 'info', icon: <SyncProblemIcon sx={{ color: theme.palette.info.main }} /> };
      case 'Unknown':
      default: return { color: 'default', icon: <HelpOutlineIcon sx={{ color: theme.palette.text.secondary }} /> };
    }
  };

  const statusProps = getStatusProps(service.status);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={{ 
        mb: 2, 
        boxShadow: 3,
        borderLeft: `5px solid ${statusProps.icon.props.sx.color || theme.palette.grey[400]}`
      }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {service.icon && React.cloneElement(service.icon, { sx: { mr: 1.5, color: statusProps.icon.props.sx.color } })}
            <Typography variant="h6" component="div">
              {service.name}
            </Typography>
          </Box>
          <Chip
            icon={statusProps.icon}
            label={service.status}
            variant="outlined"
            sx={{ 
              borderColor: statusProps.icon.props.sx.color, 
              color: statusProps.icon.props.sx.color,
              fontWeight: 'bold',
              width: '180px',
            }}
          />
        </Box>

        {service.testable && (
          <Button
            variant="contained"
            onClick={() => onTestService(service.id)}
            disabled={service.status === 'Checking...'}
            sx={{ mt: 1, width: '100px' }}
          >
            {service.status === 'Checking...' ? <CircularProgress size={24} color="inherit" /> : 'Test'}
          </Button>
        )}

        {(service.details || service.isCrudService) && (
          <IconButton onClick={handleToggleExpand} size="small" sx={{ float: 'right' }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </CardContent>

      {expanded && (service.details || service.isCrudService) && (
        <CardContent sx={{ pt: 0 }}>
          {service.details && (
            <Typography 
              variant="body2" 
              color={(service.status === 'Error' && !service.isCrudService) || (service.isCrudService && service.details && (service.details.toLowerCase().includes('failed') || service.details.toLowerCase().includes('error'))) ? 'error.main' : 'text.secondary'}
              sx={{ mt: 1 }}
            >
              {service.details}
            </Typography>
          )}

          {service.isCrudService && service.crudStatus && (
            <Box sx={{ mt: 1.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
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
                    />
                  );
                })}
            </Box>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ServiceCard;
