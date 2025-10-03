// Standardized table styles for consistent appearance across all data tables
export const standardTableStyles = {
  // DataGrid container
  container: {
    height: "calc(100vh - 300px)",
    minHeight: "400px",
    width: "100%",
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 1,
    backgroundColor: "background.paper",
  },

  // DataGrid root styles
  dataGrid: {
    border: "none",
    "& .MuiDataGrid-main": {
      borderRadius: 0,
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: (theme) => theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[50],
      borderBottom: "2px solid",
      borderColor: "divider",
      fontSize: "0.875rem",
      fontWeight: 600,
      color: "text.primary",
    },
    "& .MuiDataGrid-columnHeader": {
      "&:focus, &:focus-within": {
        outline: "none",
      },
    },
    "& .MuiDataGrid-cell": {
      borderBottom: "1px solid",
      borderColor: "divider",
      fontSize: "0.875rem",
      color: "text.primary",
      "&:focus, &:focus-within": {
        outline: "none",
      },
    },
    "& .MuiDataGrid-row": {
      "&:hover": {
        backgroundColor: "action.hover",
      },
      "&.Mui-selected": {
        backgroundColor: (theme) => theme.palette.mode === "dark"
          ? `${theme.palette.primary.main}20`
          : `${theme.palette.primary.main}10`,
        "&:hover": {
          backgroundColor: (theme) => theme.palette.mode === "dark"
            ? `${theme.palette.primary.main}30`
            : `${theme.palette.primary.main}15`,
        },
      },
    },
    "& .MuiDataGrid-footerContainer": {
      borderTop: "2px solid",
      borderColor: "divider",
      backgroundColor: (theme) => theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[50],
    },
    "& .MuiDataGrid-toolbarContainer": {
      padding: 2,
      borderBottom: "1px solid",
      borderColor: "divider",
      backgroundColor: "background.paper",
    },
  },

  // Search and filter controls
  controls: {
    display: "flex",
    gap: 2,
    alignItems: "center",
    mb: 2,
    flexWrap: "wrap",
  },

  // Search field
  searchField: {
    minWidth: "300px",
    "& .MuiOutlinedInput-root": {
      backgroundColor: "background.paper",
    },
  },

  // Filter select
  filterSelect: {
    minWidth: "150px",
    "& .MuiOutlinedInput-root": {
      backgroundColor: "background.paper",
    },
  },

  // Action buttons in table
  actionButton: {
    minWidth: "auto",
    p: 0.5,
    "&:hover": {
      backgroundColor: "action.hover",
    },
  },

  // Status chips
  statusChip: {
    fontSize: "0.75rem",
    fontWeight: 500,
    borderRadius: 1,
  },

  // Empty state
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    py: 8,
    color: "text.secondary",
  },

  // Loading overlay
  loadingOverlay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
};

// Standard DataGrid configuration
export const standardDataGridConfig = {
  density: "standard",
  disableSelectionOnClick: true,
  pageSizeOptions: [10, 25, 50, 100],
  initialState: {
    pagination: {
      paginationModel: { pageSize: 25 }
    },
  },
};