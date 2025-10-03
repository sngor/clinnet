import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Divider,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import LanguageIcon from "@mui/icons-material/Language";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import FunctionsIcon from "@mui/icons-material/Functions";
import StorageIcon from "@mui/icons-material/Storage";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import DescriptionIcon from "@mui/icons-material/Description";
import ListAltIcon from "@mui/icons-material/ListAlt";
import EventNoteIcon from "@mui/icons-material/EventNote";
import adminService from "../services/adminService";
import ServiceCard from "../components/ServiceCard";
import { StandardPageLayout, UnifiedButton } from "../components/ui";
import SystemAlertsSection from "../components/SystemAlertsSection";

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

const DiagnosticsPage = () => {
  const theme = useTheme();
  const [services, setServices] = useState(initialServicesData);

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

  // Remove all auto-checks on mount
  // Add a handler for 'Test All'
  const handleTestAll = useCallback(() => {
    const testable = services.filter((s) => s.testable);
    testable.forEach((service) => {
      handleTestService(service.id);
    });
  }, [services, handleTestService]);

  return (
    <StandardPageLayout
      title="System Diagnostics"
      subtitle="Check the status and connectivity of all core system services"
      action={
        <UnifiedButton
          variant="contained"
          onClick={handleTestAll}
          data-testid="test-all-btn"
        >
          Test All
        </UnifiedButton>
      }
    >
      {/* System Alerts Section */}
      <SystemAlertsSection />

      {/* Diagnostics List */}
      <Stack spacing={3}>
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onTestService={handleTestService}
          />
        ))}
      </Stack>
    </StandardPageLayout>
  );
};

export default DiagnosticsPage;
