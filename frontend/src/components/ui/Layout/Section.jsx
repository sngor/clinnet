import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const StyledSectionHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
}));

const StyledSectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.h5.fontSize,
  fontWeight: theme.typography.fontWeightSemiBold,
  color: theme.palette.text.primary,
  margin: 0,
}));

const StyledSectionSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.body1.fontSize,
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  maxWidth: "600px",
}));

const StyledSectionContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

/**
 * Consistent section component for organizing page content
 */
const Section = ({
  title,
  subtitle,
  actions,
  children,
  divider = false,
  spacing = "normal", // 'compact', 'normal', 'relaxed'
  ...props
}) => {
  const spacingMap = {
    compact: 2,
    normal: 3,
    relaxed: 4,
  };

  return (
    <StyledSection {...props}>
      {(title || subtitle || actions) && (
        <StyledSectionHeader>
          <Box>
            {title && (
              <StyledSectionTitle variant="h5" component="h2">
                {title}
              </StyledSectionTitle>
            )}
            {subtitle && (
              <StyledSectionSubtitle>{subtitle}</StyledSectionSubtitle>
            )}
          </Box>

          {actions && (
            <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>{actions}</Box>
          )}
        </StyledSectionHeader>
      )}

      {divider && <Divider sx={{ mb: 3 }} />}

      <StyledSectionContent sx={{ gap: spacingMap[spacing] }}>
        {children}
      </StyledSectionContent>
    </StyledSection>
  );
};

export default Section;
