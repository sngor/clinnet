// src/components/ui/EmptyState.jsx
// Consistent empty state for Clinnet-EMR UI system
//
// Accessibility & Best Practices:
// - Centered message and optional icon
// - Optional action button is keyboard accessible
//
// Usage Example:
// import { EmptyState } from '../components/ui';
// <EmptyState icon={<InboxIcon />} title="No Data" description="Nothing to show." actionText="Add" onAction={handleAdd} />

import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";

const StyledBox = styled(Paper)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(8),
  textAlign: "center",
  borderRadius: theme.shape.borderRadius * 1.25,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[2],
}));

/**
 * A consistent empty state component for displaying when there is no data
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.title - Title text
 * @param {string|React.ReactNode} [props.description] - Optional description text or node
 * @param {string} [props.actionText] - Optional action button text
 * @param {Function} [props.onAction] - Callback for the action button
 * @param {React.ReactNode} [props.action] - Optional custom action node (overrides actionText/onAction)
 * @param {string} [props.buttonVariant='contained'] - Variant for the action button
 * @param {Object} [props.sx] - Additional styles to apply
 */
function EmptyState({
  icon = <SearchIcon sx={{ fontSize: 48, color: "primary.main" }} />,
  title = "No Data Found",
  description = "No records match your search criteria.",
  actionText,
  onAction,
  action,
  buttonVariant = "contained",
  sx = {},
}) {
  return (
    <StyledBox sx={sx}>
      {icon && (
        <Box
          sx={{
            mb: 4,
            color: "primary.main",
            backgroundColor: "primary.50",
            borderRadius: "50%",
            padding: 3,
            width: 100,
            height: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: 2,
            "& svg": {
              fontSize: "3.5rem",
              opacity: 0.9,
            },
          }}
        >
          {icon}
        </Box>
      )}

      <Typography
        variant="h5"
        color="text.primary"
        sx={{
          mb: description ? 1.5 : 3,
          fontWeight: 600,
          color: "primary.main",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </Typography>

      {description &&
        (typeof description === "string" ? (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 4,
              maxWidth: 450,
              lineHeight: 1.6,
              fontSize: "1rem",
              opacity: 0.8,
            }}
          >
            {description}
          </Typography>
        ) : (
          <Box sx={{ mb: 4, maxWidth: 450 }}>{description}</Box>
        ))}

      {action
        ? action
        : actionText &&
          onAction && (
            <Button
              variant={buttonVariant}
              onClick={onAction}
              sx={{
                px: 4,
                py: 1.2,
                borderRadius: 50,
                fontWeight: 600,
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                "&:hover": {
                  transform: "translateY(-3px)",
                },
              }}
            >
              {actionText}
            </Button>
          )}
    </StyledBox>
  );
}

export default EmptyState;
