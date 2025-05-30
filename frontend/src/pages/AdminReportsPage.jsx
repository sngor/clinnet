// src/pages/AdminReportsPage.jsx
import React, { useState, useEffect } from "react";
import adminService from "../services/adminService";
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

  useEffect(() => {
    setLoading(true);
    adminService
      .getReportData(reportType, timeRange)
      .then((data) => {
        // Assuming API returns data in the correct structure for now
        // If API structure is { appointments: [], revenue: [], patients: [] }
        // then this should work. Otherwise, transformation is needed.
        setReportData(data);
      })
      .catch((error) => {
        console.error("Error fetching report data:", error);
        // Optionally set an error state here to show a message in the UI
        // For now, let's clear data or set to a default error state
        setReportData({ appointments: [], revenue: [], patients: [] });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [reportType, timeRange]); // Re-fetch when reportType or timeRange changes

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExportReport = () => {
    if (!reportData || loading) {
      alert("Report data is not available or still loading.");
      return;
    }

    let csvContent = "";
    let fileName = `${reportType}_report_${timeRange}.csv`;
    let dataToExport = [];
    let headers = [];

    if (reportType === "appointments" && reportData.appointments) {
      headers = ["Name", "Completed", "Cancelled", "Total"];
      dataToExport = reportData.appointments;
      csvContent += headers.join(",") + "\n";
      dataToExport.forEach((row) => {
        // Ensure row properties exist to avoid 'undefined' in CSV
        const name = row.name || "";
        const completed = row.completed || 0;
        const cancelled = row.cancelled || 0;
        const total = row.total || 0;
        csvContent += `${name},${completed},${cancelled},${total}\n`;
      });
    } else if (reportType === "revenue" && reportData.revenue) {
      headers = ["Name", "Revenue"];
      dataToExport = reportData.revenue;
      csvContent += headers.join(",") + "\n";
      dataToExport.forEach((row) => {
        const name = row.name || "";
        const revenue = row.revenue || 0;
        csvContent += `${name},${revenue}\n`;
      });
    } else if (reportType === "patients" && reportData.patients) {
      headers = ["Category", "Value"];
      dataToExport = reportData.patients;
      csvContent += headers.join(",") + "\n";
      dataToExport.forEach((row) => {
        const name = row.name || "";
        const value = row.value || 0;
        csvContent += `${name},${value}\n`;
      });
    } else {
      alert(
        "No data available for the selected report type or the report data structure is unexpected."
      );
      return;
    }

    if (dataToExport.length === 0 && headers.length === 0) {
      // This case is already handled by the specific report type checks not finding data.
      // If headers were set but dataToExport is empty, it means the specific reportData array was empty.
      alert("No data to export for the selected report type.");
      return;
    }

    // If headers are present but no data, still allow exporting the headers.
    // Or, if preferred, check dataToExport.length === 0 here again and alert.
    if (dataToExport.length === 0) {
      console.log("No data rows to export, only headers will be present.");
    }

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "filename.csv".

    document.body.removeChild(link); // Clean up
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
            onClick={handleExportReport} // Updated onClick handler
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
