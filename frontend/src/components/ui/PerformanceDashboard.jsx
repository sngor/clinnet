/**
 * Performance Dashboard Component
 * Real-time monitoring dashboard for design system performance metrics
 */

import React, { useState, useEffect, useMemo, memo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  Button,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import {
  PerformanceDashboard as PerfDashboard,
  BundleSizeAnalyzer,
  MemoryMonitor,
} from "../../design-system/utils/performance.js";
import { designSystem } from "../../design-system/tokens/index.js";

// Memoized metric card component
const MetricCard = memo(
  ({ title, value, unit, icon: Icon, color = "primary", trend }) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Icon sx={{ color: `${color}.main`, mr: 1 }} />
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {value}
          <Typography variant="body2" component="span" sx={{ ml: 1 }}>
            {unit}
          </Typography>
        </Typography>
        {trend && (
          <Typography
            variant="body2"
            color={trend > 0 ? "error.main" : "success.main"}
          >
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}% from last
            check
          </Typography>
        )}
      </CardContent>
    </Card>
  )
);

// Component performance table
const ComponentPerformanceTable = memo(({ metrics }) => (
  <TableContainer component={Paper}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Component</TableCell>
          <TableCell align="right">Renders</TableCell>
          <TableCell align="right">Avg Time (ms)</TableCell>
          <TableCell align="right">Last Render (ms)</TableCell>
          <TableCell align="center">Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.entries(metrics).map(([componentName, data]) => (
          <TableRow key={componentName}>
            <TableCell component="th" scope="row">
              {componentName}
            </TableCell>
            <TableCell align="right">{data.renderCount}</TableCell>
            <TableCell align="right">
              {data.averageRenderTime.toFixed(2)}
            </TableCell>
            <TableCell align="right">
              {data.lastRenderTime.toFixed(2)}
            </TableCell>
            <TableCell align="center">
              <Chip
                size="small"
                label={
                  data.averageRenderTime > 10
                    ? "Slow"
                    : data.averageRenderTime > 5
                    ? "Moderate"
                    : "Fast"
                }
                color={
                  data.averageRenderTime > 10
                    ? "error"
                    : data.averageRenderTime > 5
                    ? "warning"
                    : "success"
                }
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
));

// Bundle size analysis component
const BundleSizeAnalysis = memo(({ analysis }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Bundle Size Analysis
    </Typography>
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={4}>
        <MetricCard
          title="Total Size"
          value={analysis.totalSize}
          unit="KB"
          icon={StorageIcon}
          color="info"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <MetricCard
          title="Components"
          value={analysis.componentCount}
          unit="count"
          icon={StorageIcon}
          color="secondary"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <MetricCard
          title="Avg Size"
          value={analysis.averageComponentSize.toFixed(1)}
          unit="KB"
          icon={StorageIcon}
          color="warning"
        />
      </Grid>
    </Grid>

    <Typography variant="subtitle1" gutterBottom>
      Largest Components
    </Typography>
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Component</TableCell>
            <TableCell align="right">Size (KB)</TableCell>
            <TableCell align="right">% of Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {analysis.topComponents.map(([name, size]) => (
            <TableRow key={name}>
              <TableCell>{name}</TableCell>
              <TableCell align="right">{size}</TableCell>
              <TableCell align="right">
                {((size / analysis.totalSize) * 100).toFixed(1)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
));

// Memory usage component
const MemoryUsage = memo(({ memoryReport }) => {
  if (memoryReport.error) {
    return <Alert severity="info">{memoryReport.error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Memory Usage
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <MetricCard
            title="Current Usage"
            value={(
              memoryReport.currentMemory.usedJSHeapSize /
              1024 /
              1024
            ).toFixed(1)}
            unit="MB"
            icon={MemoryIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <MetricCard
            title="Heap Limit"
            value={(
              memoryReport.currentMemory.jsHeapSizeLimit /
              1024 /
              1024
            ).toFixed(1)}
            unit="MB"
            icon={MemoryIcon}
            color="secondary"
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle1" gutterBottom>
        Theme Switch Impact
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <MetricCard
            title="Switches"
            value={memoryReport.themeSwithces.count}
            unit="count"
            icon={MemoryIcon}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <MetricCard
            title="Avg Impact"
            value={(memoryReport.themeSwithces.averageImpact / 1024).toFixed(1)}
            unit="KB"
            icon={MemoryIcon}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <MetricCard
            title="Max Impact"
            value={(memoryReport.themeSwithces.largestImpact / 1024).toFixed(1)}
            unit="KB"
            icon={MemoryIcon}
            color="error"
          />
        </Grid>
      </Grid>
    </Box>
  );
});

// Recommendations component
const Recommendations = memo(({ recommendations }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Performance Recommendations
    </Typography>
    <List>
      {recommendations.map((rec, index) => (
        <React.Fragment key={index}>
          <ListItem>
            <ListItemIcon>
              {rec.severity === "error" ? (
                <WarningIcon color="error" />
              ) : rec.severity === "warning" ? (
                <WarningIcon color="warning" />
              ) : (
                <InfoIcon color="info" />
              )}
            </ListItemIcon>
            <ListItemText primary={rec.message} secondary={rec.suggestion} />
          </ListItem>
          {index < recommendations.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
    {recommendations.length === 0 && (
      <Alert severity="success" icon={<CheckCircleIcon />}>
        No performance issues detected. Your design system is running optimally!
      </Alert>
    )}
  </Box>
));

// Main Performance Dashboard Component
const PerformanceDashboard = memo(() => {
  const [performanceData, setPerformanceData] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Load performance data
  const loadPerformanceData = useMemo(
    () => () => {
      const data = PerfDashboard.getFullReport();
      setPerformanceData(data);
    },
    []
  );

  // Auto-refresh effect
  useEffect(() => {
    loadPerformanceData();

    if (autoRefresh) {
      const interval = setInterval(loadPerformanceData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, loadPerformanceData]);

  // Handle export
  const handleExport = () => {
    PerfDashboard.exportMetrics();
  };

  // Handle clear metrics
  const handleClear = () => {
    PerfDashboard.clearMetrics();
    loadPerformanceData();
  };

  if (!performanceData) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading performance data...
        </Typography>
      </Box>
    );
  }

  const hasComponentMetrics =
    Object.keys(performanceData.componentMetrics).length > 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Performance Dashboard
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            }
            label="Auto Refresh"
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadPerformanceData}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<ClearIcon />}
            onClick={handleClear}
          >
            Clear
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Components Tracked"
            value={Object.keys(performanceData.componentMetrics).length}
            unit="count"
            icon={SpeedIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Bundle Size"
            value={performanceData.bundleMetrics.analysis.totalSize}
            unit="KB"
            icon={StorageIcon}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Memory Usage"
            value={
              performanceData.memoryMetrics.currentMemory
                ? (
                    performanceData.memoryMetrics.currentMemory.usedJSHeapSize /
                    1024 /
                    1024
                  ).toFixed(1)
                : "N/A"
            }
            unit="MB"
            icon={MemoryIcon}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Issues Found"
            value={performanceData.recommendations.length}
            unit="count"
            icon={WarningIcon}
            color={
              performanceData.recommendations.length > 0 ? "warning" : "success"
            }
          />
        </Grid>
      </Grid>

      {/* Detailed Sections */}
      <Box sx={{ mb: 3 }}>
        <Accordion defaultExpanded={hasComponentMetrics}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Component Performance</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {hasComponentMetrics ? (
              <ComponentPerformanceTable
                metrics={performanceData.componentMetrics}
              />
            ) : (
              <Alert severity="info">
                No component performance data available. Components will appear
                here as they render.
              </Alert>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Bundle Size Analysis</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <BundleSizeAnalysis
              analysis={performanceData.bundleMetrics.analysis}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Memory Usage</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MemoryUsage memoryReport={performanceData.memoryMetrics} />
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Recommendations</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Recommendations
              recommendations={performanceData.recommendations}
            />
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 4, p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Last updated: {new Date(performanceData.timestamp).toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Performance monitoring is{" "}
          {performanceData.config.enabled ? "enabled" : "disabled"}
          {performanceData.config.enabled &&
            ` (sample rate: ${(performanceData.config.sampleRate * 100).toFixed(
              0
            )}%)`}
        </Typography>
      </Box>
    </Box>
  );
});

PerformanceDashboard.displayName = "PerformanceDashboard";

export default PerformanceDashboard;
