/**
 * UnifiedTable Example Component
 * Demonstrates the comprehensive usage of the UnifiedTable component
 */

import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Avatar,
  Button,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import UnifiedTable from "../UnifiedTable";

// Sample data
const generateSampleData = (count = 50) => {
  const statuses = ["active", "inactive", "pending", "suspended"];
  const roles = ["Admin", "Doctor", "Nurse", "Patient", "Staff"];
  const departments = [
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Emergency",
    "Surgery",
  ];

  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `User ${index + 1}`,
    email: `user${index + 1}@example.com`,
    role: roles[Math.floor(Math.random() * roles.length)],
    department: departments[Math.floor(Math.random() * departments.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    lastLogin: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    createdAt: new Date(
      Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
    ).toISOString(),
    avatar: `https://i.pravatar.cc/40?img=${index + 1}`,
  }));
};

const UnifiedTableExample = () => {
  const [data] = useState(() => generateSampleData(50));
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);

  // Column definitions with custom renderers
  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "User",
        sortable: true,
        minWidth: 200,
        render: (value, row) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar src={row.avatar} alt={value} sx={{ width: 32, height: 32 }}>
              {value.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.email}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        key: "role",
        header: "Role",
        sortable: true,
        align: "center",
        width: 120,
        render: (value) => (
          <Chip
            label={value}
            size="small"
            color={value === "Admin" ? "primary" : "default"}
            variant={value === "Admin" ? "filled" : "outlined"}
          />
        ),
      },
      {
        key: "department",
        header: "Department",
        sortable: true,
        width: 150,
        responsive: "hide", // Hide on mobile
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        align: "center",
        width: 120,
        render: (value) => {
          const colors = {
            active: "success",
            inactive: "default",
            pending: "warning",
            suspended: "error",
          };
          return (
            <Chip
              label={value.charAt(0).toUpperCase() + value.slice(1)}
              size="small"
              color={colors[value] || "default"}
              variant="filled"
            />
          );
        },
      },
      {
        key: "lastLogin",
        header: "Last Login",
        sortable: true,
        width: 150,
        responsive: "hide", // Hide on mobile
        render: (value) => {
          const date = new Date(value);
          return (
            <Typography variant="body2">{date.toLocaleDateString()}</Typography>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        sortable: false,
        align: "right",
        width: 120,
        render: (_, row) => (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                console.log("View", row);
              }}
              aria-label={`View ${row.name}`}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Edit", row);
              }}
              aria-label={`Edit ${row.name}`}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Delete", row);
              }}
              aria-label={`Delete ${row.name}`}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    []
  );

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle row click
  const handleRowClick = (row) => {
    console.log("Row clicked:", row);
  };

  // Handle selection change
  const handleSelectionChange = (selectedData, selectedIds) => {
    setSelectedRows(selectedData);
    console.log("Selection changed:", selectedData, selectedIds);
  };

  // Handle sort
  const handleSort = (sortConfig) => {
    console.log("Sort changed:", sortConfig);
  };

  // Simulate loading
  const handleLoadingToggle = () => {
    setLoading(!loading);
    if (!loading) {
      setTimeout(() => setLoading(false), 2000);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        UnifiedTable Examples
      </Typography>

      <Typography variant="body1" paragraph>
        The UnifiedTable component provides a comprehensive table system with
        sorting, selection, pagination, responsive behavior, and accessibility
        features.
      </Typography>

      {/* Controls */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <Button
          variant="outlined"
          onClick={handleLoadingToggle}
          disabled={loading}
        >
          {loading ? "Loading..." : "Toggle Loading"}
        </Button>
        {selectedRows.length > 0 && (
          <Typography variant="body2" color="primary">
            {selectedRows.length} row(s) selected
          </Typography>
        )}
      </Box>

      {/* Basic Table Example */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Basic Table with All Features
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Includes sorting, selection, pagination, responsive behavior, and
          custom renderers. Try resizing your browser to see the mobile card
          layout.
        </Typography>

        <UnifiedTable
          data={data}
          columns={columns}
          loading={loading}
          sortable={true}
          selectable={true}
          pagination={true}
          responsive={true}
          mobileBreakpoint={768}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onRowClick={handleRowClick}
          onSelectionChange={handleSelectionChange}
          onSort={handleSort}
          initialSort={{ key: "name", direction: "asc" }}
          emptyMessage="No users found"
          emptyIcon="👥"
          aria-label="Users table"
        />
      </Box>

      {/* Simple Table Example */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Simple Table (No Selection, No Pagination)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          A minimal table configuration with just sorting enabled.
        </Typography>

        <UnifiedTable
          data={data.slice(0, 5)}
          columns={columns.slice(0, 4)} // Exclude actions column
          sortable={true}
          selectable={false}
          pagination={false}
          responsive={true}
          emptyMessage="No data available"
          aria-label="Simple users table"
        />
      </Box>

      {/* Empty State Example */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Empty State Example
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Shows how the table handles empty data with custom messaging.
        </Typography>

        <UnifiedTable
          data={[]}
          columns={columns}
          sortable={true}
          selectable={true}
          pagination={true}
          emptyMessage="No users have been added yet"
          emptyIcon="🚫"
          aria-label="Empty users table"
        />
      </Box>

      {/* Error State Example */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Error State Example
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Shows how the table handles error states.
        </Typography>

        <UnifiedTable
          data={data}
          columns={columns}
          error="Failed to load user data. Please try again."
          sortable={true}
          selectable={true}
          pagination={true}
          aria-label="Error users table"
        />
      </Box>

      {/* Mobile-Only Features */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Mobile Card Layout
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          On mobile devices (or when the browser width is less than 768px), the
          table automatically switches to a card-based layout for better
          usability. Some columns can be hidden on mobile using the `responsive:
          "hide"` property.
        </Typography>

        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            p: 2,
            maxWidth: 400,
            mx: "auto",
          }}
        >
          <Typography variant="subtitle2" gutterBottom align="center">
            Mobile Preview (Fixed Width)
          </Typography>
          <UnifiedTable
            data={data.slice(0, 3)}
            columns={columns}
            sortable={true}
            selectable={true}
            pagination={false}
            responsive={true}
            mobileBreakpoint={9999} // Force mobile view
            emptyMessage="No users found"
            aria-label="Mobile preview table"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default UnifiedTableExample;
