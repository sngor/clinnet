// backend/tests/handlers/medical_reports/index.test.js

// Environment variables (MEDICAL_REPORTS_TABLE, AWS_REGION) are now expected
// to be set by the Jest setup file: ./tests/setupTests.js

import { handler } from "../../../src/handlers/medical_reports/index";
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234')
}));

const ddbMock = mockClient(DynamoDBDocumentClient);
const TABLE_NAME_FROM_SETUP = 'test-medical-reports-table-from-setup';

describe("Medical Reports Lambda Handler", () => {
  beforeEach(() => {
    ddbMock.reset();
    jest.clearAllMocks();
    // Ensure the environment variable is set to what setupTests.js configured,
    // as tests might run in parallel or modify it.
    process.env.MEDICAL_REPORTS_TABLE = TABLE_NAME_FROM_SETUP;
  });

  const mockContext = { awsRequestId: "test-request-id" };

  // --- createReport ---
  describe("createReport", () => {
    it("should create a report successfully", async () => {
      ddbMock.on(PutCommand).resolves({});
      const event = {
        httpMethod: "POST",
        path: "/reports",
        body: JSON.stringify({
          patientId: "patient-001",
          doctorId: "doctor-001",
          reportContent: "Patient is recovering well.",
        }),
      };

      const result = await handler(event, mockContext);
      const resultBody = JSON.parse(result.body);

      expect(result.statusCode).toBe(201);
      expect(resultBody.reportId).toBe("test-uuid-1234");
      expect(resultBody.patientId).toBe("patient-001");
      // ... other assertions ...
      expect(ddbMock).toHaveReceivedCommandWith(PutCommand, {
        TableName: TABLE_NAME_FROM_SETUP, // Corrected
        Item: expect.objectContaining({
          reportId: "test-uuid-1234",
          patientId: "patient-001",
        }),
      });
    });

    it("should return 400 if required fields are missing for createReport", async () => {
      const event = {
        httpMethod: "POST",
        path: "/reports",
        body: JSON.stringify({ patientId: "patient-001" }),
      };
      const result = await handler(event, mockContext);
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).message).toBe("Missing required fields: patientId, doctorId, reportContent");
    });

    it("should handle DynamoDB error during createReport", async () => {
      ddbMock.on(PutCommand).rejects(new Error("DynamoDB Put error"));
      const event = {
        httpMethod: "POST",
        path: "/reports",
        body: JSON.stringify({
          patientId: "patient-001",
          doctorId: "doctor-001",
          reportContent: "Test content",
        }),
      };
      const result = await handler(event, mockContext);
      expect(result.statusCode).toBe(500);
    });
  });

  // --- getReportById ---
  describe("getReportById", () => {
    it("should retrieve a report successfully by ID", async () => {
      const mockReport = { reportId: "report-123", patientId: "patient-002", content: "Details" };
      ddbMock.on(GetCommand, { TableName: TABLE_NAME_FROM_SETUP, Key: { reportId: "report-123" } }).resolves({ Item: mockReport });

      const event = {
        httpMethod: "GET",
        path: "/reports/report-123",
        pathParameters: { reportId: "report-123" },
      };
      const result = await handler(event, mockContext);
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockReport);
    });

    it("should return 404 if report not found by ID", async () => {
      ddbMock.on(GetCommand, { TableName: TABLE_NAME_FROM_SETUP, Key: { reportId: "report-nonexistent" } }).resolves({});
      const event = {
        httpMethod: "GET",
        path: "/reports/report-nonexistent",
        pathParameters: { reportId: "report-nonexistent" },
      };
      const result = await handler(event, mockContext);
      expect(result.statusCode).toBe(404);
    });
  });

  // --- getReportsByPatientId ---
  describe("getReportsByPatientId", () => {
    it("should retrieve reports for a patient successfully", async () => {
      const mockReports = [{ reportId: "report-p01", patientId: "patient-003" }];
      ddbMock.on(QueryCommand).resolves({ Items: mockReports });

      const event = {
        httpMethod: "GET",
        path: "/reports/patient/patient-003",
        pathParameters: { patientId: "patient-003" },
      };
      const result = await handler(event, mockContext);
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockReports);
      expect(ddbMock).toHaveReceivedCommandWith(QueryCommand, {
        TableName: TABLE_NAME_FROM_SETUP, // Corrected
        IndexName: "PatientIdIndex",
        KeyConditionExpression: "patientId = :patientId",
        ExpressionAttributeValues: { ":patientId": "patient-003" },
      });
    });
  });

  // --- getReportsByDoctorId ---
  describe("getReportsByDoctorId", () => {
    it("should retrieve reports for a doctor successfully", async () => {
      const mockReports = [{ reportId: "report-d01", doctorId: "doctor-004" }];
      ddbMock.on(QueryCommand).resolves({ Items: mockReports });
      const event = {
        httpMethod: "GET",
        path: "/reports/doctor/doctor-004",
        pathParameters: { doctorId: "doctor-004" },
      };
      const result = await handler(event, mockContext);
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockReports);
      expect(ddbMock).toHaveReceivedCommandWith(QueryCommand, {
        TableName: TABLE_NAME_FROM_SETUP, // Corrected
        IndexName: "DoctorIdIndex",
        KeyConditionExpression: "doctorId = :doctorId",
        ExpressionAttributeValues: { ":doctorId": "doctor-004" },
      });
    });
  });

  // --- updateReport ---
  describe("updateReport", () => {
    const reportIdToUpdate = "report-upd1";
    const currentReport = {
      reportId: reportIdToUpdate,
      patientId: "patient-005",
      doctorId: "doctor-005",
      reportContent: "Initial content.",
      doctorNotes: "Initial notes.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it("should update a report successfully", async () => {
      ddbMock.on(GetCommand, { TableName: TABLE_NAME_FROM_SETUP, Key: { reportId: reportIdToUpdate } })
             .resolves({ Item: currentReport });
      const updatedAttributes = { ...currentReport, reportContent: "Updated content.", updatedAt: new Date().toISOString() };
      ddbMock.on(UpdateCommand).resolves({ Attributes: updatedAttributes });

      const event = {
        httpMethod: "PUT",
        path: `/reports/${reportIdToUpdate}`,
        pathParameters: { reportId: reportIdToUpdate },
        body: JSON.stringify({ reportContent: "Updated content." }),
      };
      const result = await handler(event, mockContext);
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body).reportContent).toBe("Updated content.");
      expect(ddbMock).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: TABLE_NAME_FROM_SETUP, // Corrected
        Key: { reportId: reportIdToUpdate },
      });
    });

    it("should return 404 if report not found for update", async () => {
      ddbMock.on(GetCommand, { TableName: TABLE_NAME_FROM_SETUP, Key: { reportId: "report-nonexistent" } }).resolves({});
      const event = {
        httpMethod: "PUT",
        path: "/reports/report-nonexistent",
        pathParameters: { reportId: "report-nonexistent" },
        body: JSON.stringify({ reportContent: "Updated content." }),
      };
      const result = await handler(event, mockContext);
      expect(result.statusCode).toBe(404);
    });
  });

  // --- deleteReport ---
  describe("deleteReport", () => {
    const reportIdToDelete = "report-del1";
    it("should delete a report successfully", async () => {
      ddbMock.on(GetCommand, { TableName: TABLE_NAME_FROM_SETUP, Key: { reportId: reportIdToDelete } })
             .resolves({ Item: { reportId: reportIdToDelete } }); // Simulate item exists
      ddbMock.on(DeleteCommand).resolves({});

      const event = {
        httpMethod: "DELETE",
        path: `/reports/${reportIdToDelete}`,
        pathParameters: { reportId: reportIdToDelete },
      };
      const result = await handler(event, mockContext);
      expect(result.statusCode).toBe(204);
      expect(ddbMock).toHaveReceivedCommandWith(DeleteCommand, {
        TableName: TABLE_NAME_FROM_SETUP, // Corrected
        Key: { reportId: reportIdToDelete },
      });
    });

    it("should return 404 if report not found for deletion", async () => {
      ddbMock.on(GetCommand, { TableName: TABLE_NAME_FROM_SETUP, Key: { reportId: "report-nonexistent" } }).resolves({});
      const event = {
        httpMethod: "DELETE",
        path: "/reports/report-nonexistent",
        pathParameters: { reportId: "report-nonexistent" },
      };
      const result = await handler(event, mockContext);
      expect(result.statusCode).toBe(404);
    });
  });

  // --- Main Handler Routing & Edge Cases ---
  describe("Main Handler Routing and Edge Cases", () => {
    it("should return 404 for unknown path", async () => {
      const event = { httpMethod: "GET", path: "/unknown/path" };
      const result = await handler(event, mockContext);
      expect(result.statusCode).toBe(404);
    });

    it("should handle OPTIONS request for CORS preflight", async () => {
      const event = { httpMethod: "OPTIONS", path: "/reports" };
      const result = await handler(event, mockContext);
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body).message).toBe("CORS preflight check successful");
    });

    it("should return 500 if MEDICAL_REPORTS_TABLE env var is not set", async () => {
      const originalTableName = process.env.MEDICAL_REPORTS_TABLE;
      delete process.env.MEDICAL_REPORTS_TABLE;

      await jest.isolateModulesAsync(async () => {
        const { handler: freshHandler } = await import("../../../src/handlers/medical_reports/index");
        const event = {
          httpMethod: "POST",
          path: "/reports",
          body: JSON.stringify({
            patientId: "patient-001",
            doctorId: "doctor-001",
            reportContent: "Test content",
          }),
        };
        const result = await freshHandler(event, mockContext);
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body).message).toBe("Internal server error: Configuration missing.");
      });
      
      process.env.MEDICAL_REPORTS_TABLE = originalTableName; // Restore
    });
  });
});
// Ensure no trailing characters or lines
