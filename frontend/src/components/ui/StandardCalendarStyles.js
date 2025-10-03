// Standardized calendar styles for consistent appearance across all calendar components
export const standardCalendarStyles = {
    // Main container
    container: {
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        overflow: "hidden",
    },

    // Header styles
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: (theme) => theme.palette.mode === "dark"
            ? theme.palette.grey[800]
            : theme.palette.grey[50],
    },

    // Title styles
    title: {
        fontWeight: 600,
        color: "primary.main",
        fontSize: "1.25rem",
    },

    // Navigation button group
    navigationGroup: {
        "& .MuiButton-root": {
            minWidth: "auto",
            px: 2,
        },
    },

    // View toggle buttons
    viewToggle: {
        "& .MuiToggleButton-root": {
            px: 2,
            py: 0.5,
            fontSize: "0.875rem",
        },
    },

    // Calendar grid container
    calendarGrid: {
        height: "calc(100vh - 300px)",
        minHeight: "600px",
        overflow: "auto",
    },

    // Day header
    dayHeader: {
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: (theme) => theme.palette.mode === "dark"
            ? theme.palette.grey[800]
            : theme.palette.grey[50],
        fontWeight: 600,
        fontSize: "0.875rem",
        color: "text.primary",
    },

    // Day cell
    dayCell: {
        borderRight: "1px solid",
        borderColor: "divider",
        borderBottom: "1px solid",
        backgroundColor: "background.paper",
        position: "relative",
        minHeight: "60px",
        "&:hover": {
            backgroundColor: "action.hover",
        },
    },

    // Today highlight
    todayCell: {
        backgroundColor: (theme) => theme.palette.mode === "dark"
            ? `${theme.palette.primary.main}20`
            : `${theme.palette.primary.main}10`,
    },

    // Time slot
    timeSlot: {
        height: "60px",
        borderBottom: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.75rem",
        color: "text.secondary",
    },

    // Appointment block
    appointmentBlock: {
        borderRadius: 1,
        p: 0.5,
        mb: 0.5,
        fontSize: "0.75rem",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: 2,
        },
    },

    // Status colors for appointments
    statusColors: {
        confirmed: {
            backgroundColor: "success.main",
            color: "success.contrastText",
        },
        pending: {
            backgroundColor: "warning.main",
            color: "warning.contrastText",
        },
        cancelled: {
            backgroundColor: "error.main",
            color: "error.contrastText",
        },
        completed: {
            backgroundColor: "info.main",
            color: "info.contrastText",
        },
        default: {
            backgroundColor: "primary.main",
            color: "primary.contrastText",
        },
    },

    // Filter controls
    filterControls: {
        display: "flex",
        gap: 2,
        alignItems: "center",
        p: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
    },

    // Action buttons
    actionButton: {
        minWidth: "auto",
        px: 2,
        py: 1,
        fontSize: "0.875rem",
        fontWeight: 500,
    },
};