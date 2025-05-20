// src/pages/AdminReportsPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PageContainer from "../components/ui/PageContainer";
import PageHeading from "../components/ui/PageHeading";
import ContentCard from "../components/ui/ContentCard";
import EmptyState from "../components/ui/EmptyState";
import LoadingIndicator from "../components/ui/LoadingIndicator";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("appointments");
  const [timeRange, setTimeRange] = useState("month");
  const [tabValue, setTabValue] = useState(0);
  const [reportData, setReportData] = useState({
    appointments: [],
    revenue: [],
    patients: [],
  });

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      const mockAppointmentsData = [
        { name: "Jan", completed: 65, cancelled: 12, total: 77 },
        { name: "Feb", completed: 59, cancelled: 15, total: 74 },
        { name: "Mar", completed: 80, cancelled: 8, total: 88 },
        { name: "Apr", completed: 81, cancelled: 10, total: 91 },
        { name: "May", completed: 56, cancelled: 14, total: 70 },
        { name: "Jun", completed: 55, cancelled: 9, total: 64 },
        { name: "Jul", completed: 40, cancelled: 5, total: 45 },
      ];

      const mockRevenueData = [
        { name: "Jan", revenue: 4500 },
        { name: "Feb", revenue: 5200 },
        { name: "Mar", revenue: 6800 },
        { name: "Apr", revenue: 7100 },
        { name: "May", revenue: 5400 },
        { name: "Jun", revenue: 4900 },
        { name: "Jul", revenue: 3800 },
      ];

      const mockPatientsData = [
        { name: "New", value: 45 },
        { name: "Returning", value: 120 },
        { name: "Referred", value: 25 },
      ];

      setReportData({
        appointments: mockAppointmentsData,
        revenue: mockRevenueData,
        patients: mockPatientsData,
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Render the appropriate chart based on report type and tab value
  const renderChart = () => {
    if (reportType === "appointments") {
      return tabValue === 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={reportData.appointments}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" name="Completed" fill="#4caf50" />
            <Bar dataKey="cancelled" name="Cancelled" fill="#f44336" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={reportData.appointments}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              name="Total Appointments"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else if (reportType === "revenue") {
      return tabValue === 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={reportData.revenue}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
            <Legend />
            <Bar dataKey="revenue" name="Revenue" fill="#2196f3" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={reportData.revenue}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#2196f3"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else if (reportType === "patients") {
      return tabValue === 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={reportData.patients}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {reportData.patients.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, "Patients"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={reportData.patients}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="Patients" fill="#9c27b0" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <PageContainer>
      <PageHeading
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AssessmentIcon sx={{ color: "primary.main", fontSize: 32 }} />{" "}
            Reports & Analytics
          </Box>
        }
        subtitle="View and generate reports for your clinic"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            sx={{ boxShadow: 2, borderRadius: 2, fontWeight: 600 }}
            onClick={() =>
              alert("Download report functionality would be implemented here")
            }
          >
            Export Report
          </Button>
        }
      />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ContentCard
            sx={{
              p: { xs: 2, sm: 4 },
              background: "linear-gradient(135deg, #f5f7fa 0%, #e3eafc 100%)",
              boxShadow: 1,
            }}
          >
            <Box
              sx={{
                mb: 4,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <FormControl fullWidth size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="report-type-label">Report Type</InputLabel>
                <Select
                  labelId="report-type-label"
                  id="report-type"
                  value={reportType}
                  label="Report Type"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="appointments">Appointments</MenuItem>
                  <MenuItem value="revenue">Revenue</MenuItem>
                  <MenuItem value="patients">Patient Demographics</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="time-range-label">Time Range</InputLabel>
                <Select
                  labelId="time-range-label"
                  id="time-range"
                  value={timeRange}
                  label="Time Range"
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <MenuItem value="week">Last Week</MenuItem>
                  <MenuItem value="month">Last Month</MenuItem>
                  <MenuItem value="quarter">Last Quarter</MenuItem>
                  <MenuItem value="year">Last Year</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="chart type tabs"
              >
                <Tab
                  label={reportType === "patients" ? "Pie Chart" : "Bar Chart"}
                />
                <Tab
                  label={reportType === "patients" ? "Bar Chart" : "Line Chart"}
                />
              </Tabs>
            </Box>
            {loading ? (
              <LoadingIndicator message="Loading report data..." />
            ) : (
              <Box
                sx={{ height: 400, width: "100%", animation: "fadein 0.7s" }}
              >
                {renderChart()}
              </Box>
            )}
          </ContentCard>
        </Grid>
        <Grid item xs={12}>
          <ContentCard title="Report Summary" sx={{ p: { xs: 2, sm: 4 } }}>
            {loading ? (
              <LoadingIndicator message="Loading summary..." />
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      textAlign: "center",
                      borderRadius: 2,
                      boxShadow: 1,
                      bgcolor: "#f5f7fa",
                      transition: "box-shadow 0.2s",
                      "&:hover": { boxShadow: 4 },
                    }}
                  >
                    <EventAvailableIcon
                      sx={{ color: "primary.main", fontSize: 36, mb: 1 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      Total Appointments
                    </Typography>
                    <Typography
                      variant="h3"
                      color="primary"
                      sx={{ my: 1, fontWeight: 700 }}
                    >
                      {reportType === "appointments"
                        ? reportData.appointments.reduce(
                            (sum, item) => sum + item.total,
                            0
                          )
                        : "509"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {timeRange === "month"
                        ? "Last 30 days"
                        : timeRange === "week"
                        ? "Last 7 days"
                        : timeRange === "quarter"
                        ? "Last 90 days"
                        : "Last 365 days"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      textAlign: "center",
                      borderRadius: 2,
                      boxShadow: 1,
                      bgcolor: "#f5f7fa",
                      transition: "box-shadow 0.2s",
                      "&:hover": { boxShadow: 4 },
                    }}
                  >
                    <TrendingUpIcon
                      sx={{ color: "success.main", fontSize: 36, mb: 1 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      Total Revenue
                    </Typography>
                    <Typography
                      variant="h3"
                      color="success.main"
                      sx={{ my: 1, fontWeight: 700 }}
                    >
                      $
                      {reportType === "revenue"
                        ? reportData.revenue
                            .reduce((sum, item) => sum + item.revenue, 0)
                            .toLocaleString()
                        : "37,700"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {timeRange === "month"
                        ? "Last 30 days"
                        : timeRange === "week"
                        ? "Last 7 days"
                        : timeRange === "quarter"
                        ? "Last 90 days"
                        : "Last 365 days"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      textAlign: "center",
                      borderRadius: 2,
                      boxShadow: 1,
                      bgcolor: "#f5f7fa",
                      transition: "box-shadow 0.2s",
                      "&:hover": { boxShadow: 4 },
                    }}
                  >
                    <PeopleAltIcon
                      sx={{ color: "secondary.main", fontSize: 36, mb: 1 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      Total Patients
                    </Typography>
                    <Typography
                      variant="h3"
                      color="secondary.main"
                      sx={{ my: 1, fontWeight: 700 }}
                    >
                      {reportType === "patients"
                        ? reportData.patients.reduce(
                            (sum, item) => sum + item.value,
                            0
                          )
                        : "190"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {timeRange === "month"
                        ? "Last 30 days"
                        : timeRange === "week"
                        ? "Last 7 days"
                        : timeRange === "quarter"
                        ? "Last 90 days"
                        : "Last 365 days"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
          </ContentCard>
        </Grid>
      </Grid>
      <style>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </PageContainer>
  );
}

export default AdminReportsPage;
