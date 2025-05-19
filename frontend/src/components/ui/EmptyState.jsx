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
import { Box, Typography, Button } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  textAlign: "center",
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
  icon,
  title,
  description,
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
            mb: 3,
            color: "text.secondary",
            "& svg": {
              fontSize: "4rem",
              opacity: 0.7,
            },
          }}
        >
          {icon}
        </Box>
      )}

      <Typography
        variant="h5"
        color="text.primary"
        sx={{ mb: description ? 1 : 3, fontWeight: 500 }}
      >
        {title}
      </Typography>

      {description &&
        (typeof description === "string" ? (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 400 }}
          >
            {description}
          </Typography>
        ) : (
          <Box sx={{ mb: 3, maxWidth: 400 }}>{description}</Box>
        ))}

      {action
        ? action
        : actionText &&
          onAction && (
            <Button variant={buttonVariant} onClick={onAction}>
              {actionText}
            </Button>
          )}
    </StyledBox>
  );
}

export default EmptyState;
