import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Divider,
  Grid,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import LanguageIcon from "@mui/icons-material/Language";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import FunctionsIcon from "@mui/icons-material/Functions";
import StorageIcon from "@mui/icons-material/Storage";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import DescriptionIcon from "@mui/icons-material/Description";
import ListAltIcon from "@mui/icons-material/ListAlt";
import EventNoteIcon from "@mui/icons-material/EventNote";
import SyncProblemIcon from "@mui/icons-material/SyncProblem";
import adminService from "../services/adminService";
import ServiceCard from "../components/ServiceCard";

const initialServicesData = [
  {
    id: "site",
    name: "Site Frontend",
    apiId: "site",
    testFunction: null,
    status: "Online",
    details: "Page loaded successfully.",
    testable: false,
    icon: <LanguageIcon />,
    isCrudService: false,
    crudStatus: null,
  },
  {
    id: "apiGateway",
    name: "API Gateway",
    apiId: "apiGateway",
    testFunction: null,
    status: "Unknown",
    details: "",
    testable: false,
    icon: <CloudQueueIcon />,
    isCrudService: false,
    crudStatus: null,
  },
  {
    id: "lambdas",
    name: "Lambda Functions",
    apiId: "lambdas",
    testFunction: null,
    status: "Unknown",
    details: "",
    testable: false,
    icon: <FunctionsIcon />,
    isCrudService: false,
    crudStatus: null,
  },
  {
    id: "s3",
    name: "S3 Storage (Avatars)",
    apiId: "s3",
    testFunction: adminService.checkS3Connectivity,
    status: "Unknown",
    details: "",
    testable: true,
    icon: <StorageIcon />,
    isCrudService: false,
    crudStatus: null,
  },
  {
    id: "patientData",
    name: "Patient Data (DynamoDB)",
    apiId: "patients",
    testFunction: adminService.checkDynamoDBCrud,
    status: "Unknown",
    crudStatus: {
      create: "Unknown",
      read: "Unknown",
      update: "Unknown",
      delete: "Unknown",
    },
    details: "",
    testable: true,
    icon: <DescriptionIcon />,
    isCrudService: true,
  },
  {
    id: "serviceData",
    name: "Services Data (DynamoDB)",
    apiId: "services",
    testFunction: adminService.checkDynamoDBCrud,
    status: "Unknown",
    crudStatus: {
      create: "Unknown",
      read: "Unknown",
      update: "Unknown",
      delete: "Unknown",
    },
    details: "",
    testable: true,
    icon: <ListAltIcon />,
    isCrudService: true,
  },
  {
    id: "appointmentData",
    name: "Appointment Data (DynamoDB)",
    apiId: "appointments",
    testFunction: adminService.checkDynamoDBCrud,
    status: "Unknown",
    crudStatus: {
      create: "Unknown",
      read: "Unknown",
      update: "Unknown",
      delete: "Unknown",
    },
    details: "",
    testable: true,
    icon: <EventNoteIcon />,
    isCrudService: true,
  },
  {
    id: "cognitoUserData",
    name: "User Data (Cognito)",
    apiId: "cognito_users",
    testFunction: adminService.checkCognitoUsersCrud,
    status: "Unknown",
    crudStatus: {
      create: "Unknown",
      read: "Unknown",
      update: "Unknown",
      delete: "Unknown",
    },
    details: "",
    testable: true,
    icon: <PeopleAltIcon />,
    isCrudService: true,
  },
];

const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

const DiagnosticsPage = () => {
  const theme = useTheme();
  const [services, setServices] = useState(initialServicesData);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false);
  const [autoRefreshIntervalId, setAutoRefreshIntervalId] = useState(null);
  const determineOverallStatus = useCallback((crudSt) => {
    if (!crudSt || typeof crudSt !== "object") return "Unknown";
    const ops = ["create", "read", "update", "delete"];
    const currentStatuses = ops
      .map((op) => crudSt[op])
      .filter((s) => s !== undefined);

    if (currentStatuses.every((s) => s === "Checking...")) return "Checking...";

    const successfulOps = currentStatuses.filter(
      (s) => s === "OK" || s === "OK (cleaned up)"
    ).length;
    const errorOps = currentStatuses.filter(
      (s) =>
        s &&
        typeof s === "string" &&
        ![
          "OK",
          "OK (cleaned up)",
          "Unknown",
          "PENDING",
          "SKIPPED - User not created by this test.",
          "Checking...",
        ].includes(s)
    ).length;

    if (successfulOps === ops.length) return "Online";
    if (successfulOps === 0 && errorOps > 0) return "Offline";
    if (errorOps > 0) return "Error";
    if (successfulOps > 0 && successfulOps < ops.length)
      return "Potentially Degraded";
    if (
      currentStatuses.length < ops.length &&
      currentStatuses.every((s) =>
        [
          "Unknown",
          "PENDING",
          "SKIPPED - User not created by this test.",
          "Checking...",
        ].includes(s)
      )
    )
      return "Potentially Degraded";

    return "Unknown";
  }, []);

  const handleTestService = useCallback(
    async (serviceId) => {
      const currentServiceToTest = services.find((s) => s.id === serviceId);
      if (!currentServiceToTest || !currentServiceToTest.testFunction) {
        return;
      }

      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId
            ? {
                ...s,
                status: "Checking...",
                details: "",
                crudStatus: s.isCrudService
                  ? {
                      create: "Checking...",
                      read: "Checking...",
                      update: "Checking...",
                      delete: "Checking...",
                    }
                  : s.crudStatus,
              }
            : s
        )
      );

      try {
        let response;
        if (
          currentServiceToTest.apiId === "s3" ||
          currentServiceToTest.apiId === "cognito_users"
        ) {
          response = await currentServiceToTest.testFunction();
        } else {
          response = await currentServiceToTest.testFunction(
            currentServiceToTest.apiId
          );
        }

        setServices((prevServices) => {
          let servicesAfterTestUpdate = prevServices.map((s) => {
            if (s.id === serviceId) {
              if (s.isCrudService) {
                const crudStatusObject = {
                  create: response.create || "Unknown",
                  read: response.read || "Unknown",
                  update: response.update || "Unknown",
                  delete: response.delete || "Unknown",
                };
                const newOverallStatus =
                  determineOverallStatus(crudStatusObject);
                let detailsMessage = "Test complete.";
                if (newOverallStatus === "Online")
                  detailsMessage = "All operations successful.";
                else if (newOverallStatus === "Offline")
                  detailsMessage =
                    "All operations failed or resulted in errors. Service is offline.";
                else if (newOverallStatus === "Error")
                  detailsMessage = "One or more operations failed.";
                else if (newOverallStatus === "Potentially Degraded")
                  detailsMessage =
                    "Some operations have issues or are in an unknown state.";
                if (response.cleanup_error)
                  detailsMessage += ` Cleanup: ${response.cleanup_error}`;
                return {
                  ...s,
                  status: newOverallStatus,
                  crudStatus: crudStatusObject,
                  details: detailsMessage,
                };
              } else {
                if (response && response.success) {
                  return { ...s, status: "Online", details: response.message };
                } else {
                  return {
                    ...s,
                    status: "Error",
                    details:
                      response?.message ||
                      `${currentServiceToTest.name} test failed.`,
                  };
                }
              }
            }
            return s;
          });

          const testableServices = servicesAfterTestUpdate.filter(
            (s) => s.testable && s.id !== "apiGateway" && s.id !== "lambdas"
          );
          const anyOnline = testableServices.some((s) => s.status === "Online");
          const anyError = testableServices.some((s) => s.status === "Error");
          const anyOffline = testableServices.some(
            (s) => s.status === "Offline"
          );
          const anyPotentiallyDegraded = testableServices.some(
            (s) => s.status === "Potentially Degraded"
          );

          return servicesAfterTestUpdate.map((s) => {
            if (s.id === "apiGateway" || s.id === "lambdas") {
              if (anyOffline)
                return {
                  ...s,
                  status: "Error",
                  details:
                    "Critical dependency offline. Gateway/Lambdas likely non-functional.",
                };
              if (anyError)
                return {
                  ...s,
                  status: "Error",
                  details:
                    "Connectivity potentially compromised due to dependent service failure.",
                };
              if (
                anyOnline &&
                !anyError &&
                !anyOffline &&
                !anyPotentiallyDegraded
              )
                return {
                  ...s,
                  status: "Online",
                  details:
                    "Connectivity implied by successful dependent service tests.",
                };
              if (anyPotentiallyDegraded)
                return {
                  ...s,
                  status: "Potentially Degraded",
                  details: "Dependent services reporting mixed status.",
                };
              return {
                ...s,
                status: "Unknown",
                details:
                  "Status of dependent services is unclear or mixed without clear errors.",
              };
            }
            return s;
          });
        });
      } catch (error) {
        setServices((prevServices) => {
          const serviceFailedId = serviceId;
          let afterCatchServices = prevServices.map((s) =>
            s.id === serviceFailedId
              ? {
                  ...s,
                  status: "Error",
                  details:
                    error.message ||
                    `An unknown error occurred testing ${currentServiceToTest.name}.`,
                }
              : s
          );

          const failedServiceForGatewayCheck = prevServices.find(
            (s) => s.id === serviceFailedId && s.testable
          );

          if (failedServiceForGatewayCheck) {
            afterCatchServices = afterCatchServices.map((s_) => {
              if (s_.id === "apiGateway" || s_.id === "lambdas") {
                if (s_.status !== "Error" && s_.status !== "Offline") {
                  return {
                    ...s_,
                    status: "Error",
                    details: `Test for ${failedServiceForGatewayCheck.name} failed directly, impacting API/Lambda status.`,
                  };
                }
              }
              return s_;
            });
          }
          return afterCatchServices;
        });
      }
    },
    [services, determineOverallStatus]
  );

  // useEffect for initial auto-testing on mount
  useEffect(() => {
    const servicesToAutoTest = initialServicesData.filter((s) => s.testable);
    servicesToAutoTest.forEach((service) => {
      handleTestService(service.id);
    });
    // handleTestService is a dependency, auto-testing runs when it's stable (after initial `services` state set)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleTestService]);

  // useEffect for managing the periodic refresh interval
  useEffect(() => {
    if (isAutoRefreshEnabled) {
      const triggerAllTests = () => {
        const servicesToAutoTest = initialServicesData.filter(
          (s) => s.testable
        );
        servicesToAutoTest.forEach((service) => {
          handleTestService(service.id);
        });
      };

      const intervalId = setInterval(triggerAllTests, AUTO_REFRESH_INTERVAL);
      setAutoRefreshIntervalId(intervalId); // Store the interval ID

      // Cleanup function to clear the interval
      return () => {
        clearInterval(intervalId);
        setAutoRefreshIntervalId(null);
      };
    } else {
      // If auto-refresh is disabled and there's an interval ID, clear it
      if (autoRefreshIntervalId) {
        clearInterval(autoRefreshIntervalId);
        setAutoRefreshIntervalId(null);
      }
    }
    // Dependencies for this effect:
    // isAutoRefreshEnabled: to start/stop the interval
    // handleTestService: to ensure the interval uses the latest version of this function
    // autoRefreshIntervalId: to ensure cleanup uses the correct ID if it were to change (though less likely here)
  }, [isAutoRefreshEnabled, handleTestService, autoRefreshIntervalId]);

  const handleAutoRefreshToggle = (event) => {
    setIsAutoRefreshEnabled(event.target.checked);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
          System Diagnostics
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={isAutoRefreshEnabled}
              onChange={handleAutoRefreshToggle}
            />
          }
          label={`Enable Auto-Refresh (${AUTO_REFRESH_INTERVAL / 1000}s)`}
        />
      </Box>

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
