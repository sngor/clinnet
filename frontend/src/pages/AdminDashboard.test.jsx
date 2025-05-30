import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import AdminDashboard from "./AdminDashboard";
import adminService from "../../services/adminService";
import patientService from "../../services/patientService";
import { getTodaysAppointments } from "../../services/appointmentService";
import { useAuth } from "../app/providers/AuthProvider";

// Mock services
jest.mock("../../services/adminService");
jest.mock("../../services/patientService");
jest.mock("../../services/appointmentService");
jest.mock("../app/providers/AuthProvider");

// Mock useNavigate from react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"), // import and retain default behavior
  useNavigate: () => jest.fn(), // mock useNavigate
}));

describe("AdminDashboard", () => {
  const mockUser = { username: "admin", firstName: "Admin", lastName: "User" };

  beforeEach(() => {
    // Reset mocks before each test
    adminService.listUsers.mockReset();
    patientService.getPatients.mockReset();
    getTodaysAppointments.mockReset();
    useAuth.mockReturnValue({ user: mockUser });
  });

  test("renders without crashing", () => {
    adminService.listUsers.mockResolvedValue([]);
    patientService.getPatients.mockResolvedValue([]);
    getTodaysAppointments.mockResolvedValue([]);
    render(<AdminDashboard />);
    expect(
      screen.getByText(/Here's what's happening in your clinic today/i)
    ).toBeInTheDocument();
  });

  test("fetches data and displays correct card values", async () => {
    const mockUsers = [
      { id: 1, username: "user1", role: "user" },
      { id: 2, username: "doc1", role: "doctor" },
      { id: 3, username: "user2", role: "user" },
      { id: 4, username: "doc2", role: "doctor" },
      { id: 5, username: "admin", role: "admin" },
    ];
    const mockPatientsList = [
      { id: 1, name: "Patient A" },
      { id: 2, name: "Patient B" },
      { id: 3, name: "Patient C" },
    ];
    const mockAppointmentsList = [
      { id: 1, description: "Appointment 1" },
      { id: 2, description: "Appointment 2" },
    ];

    adminService.listUsers.mockResolvedValue(mockUsers);
    patientService.getPatients.mockResolvedValue(mockPatientsList);
    getTodaysAppointments.mockResolvedValue(mockAppointmentsList);

    render(<AdminDashboard />);

    // Wait for data to load and cards to update
    // Check for Users card
    await waitFor(() => {
      const usersCard = screen
        .getByText("Users")
        .closest('div[class*="MuiPaper-root"]'); // Find card by title
      expect(usersCard).toBeInTheDocument();
      expect(screen.getByText(mockUsers.length.toString())).toBeInTheDocument(); // Check value
    });

    // Check for Doctors card
    const doctorsCount = mockUsers.filter(
      (user) => user.role === "doctor"
    ).length;
    const doctorsCard = screen
      .getByText("Doctors")
      .closest('div[class*="MuiPaper-root"]');
    expect(doctorsCard).toBeInTheDocument();
    expect(screen.getByText(doctorsCount.toString())).toBeInTheDocument();

    // Check for Patients card
    const patientsCard = screen
      .getByText("Patients")
      .closest('div[class*="MuiPaper-root"]');
    expect(patientsCard).toBeInTheDocument();
    expect(
      screen.getByText(mockPatientsList.length.toString())
    ).toBeInTheDocument();

    // Check for Appointments card
    const appointmentsCard = screen
      .getByText("Appointments")
      .closest('div[class*="MuiPaper-root"]');
    expect(appointmentsCard).toBeInTheDocument();
    expect(
      screen.getByText(mockAppointmentsList.length.toString())
    ).toBeInTheDocument();

    // Also check that the main loading indicator is gone
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  test("handles API errors gracefully", async () => {
    adminService.listUsers.mockRejectedValue(
      new Error("Failed to fetch users")
    );
    patientService.getPatients.mockResolvedValue([]); // Other calls might succeed or also fail
    getTodaysAppointments.mockResolvedValue([]);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText(
          /Failed to load dashboard data: Failed to fetch users/i
        )
      ).toBeInTheDocument();
    });

    // Ensure card values are 0 or reflect no data
    const usersCard = screen
      .getByText("Users")
      .closest('div[class*="MuiPaper-root"]');
    expect(usersCard).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument(); // Assuming value defaults to 0 on error for users

    // Check a specific card's value (e.g., Doctors, assuming it also defaults to 0)
    // Need to be more specific if '0' appears multiple times for different cards.
    // One way is to get all '0' texts and check count, or query within the card scope.
    const doctorCardValue = within(
      screen.getByText("Doctors").closest('div[class*="MuiPaper-root"]')
    ).getByText("0");
    expect(doctorCardValue).toBeInTheDocument();
  });
});
