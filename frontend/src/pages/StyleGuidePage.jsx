// src/pages/StyleGuidePage.jsx
import React from "react";
import {
  Box,
  Typography,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import {
  PageContainer,
  SectionContainer,
  CardContainer,
  FlexBox,
  PageTitle,
  SectionTitle,
  SubsectionTitle,
  BodyText,
  SecondaryText,
  LabelText,
  Caption,
  PrimaryButton,
  SecondaryButton,
  TextButton,
  DangerButton,
  AppIconButton,
} from "../components/ui";

function StyleGuidePage() {
  const theme = useTheme();

  return (
    <PageContainer>
      <PageTitle>Style Guide</PageTitle>
      <BodyText>
        This page demonstrates the consistent UI components and styling used
        throughout the application. Use these components to maintain visual
        consistency across all pages.
      </BodyText>

      <SectionContainer>
        <SectionTitle>Typography</SectionTitle>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 4 }}>
              <PageTitle>Page Title (h4)</PageTitle>
              <SectionTitle>Section Title (h5)</SectionTitle>
              <SubsectionTitle>Subsection Title (h6)</SubsectionTitle>
              <BodyText>
                Body Text (body1) - This is the standard paragraph text used
                throughout the application. It should be used for most content
                on the page.
              </BodyText>
              <SecondaryText>
                Secondary Text (body2) - Used for less important information,
                descriptions, or supporting text.
              </SecondaryText>
              <Box sx={{ mb: 2 }}>
                <LabelText>Label Text (subtitle2)</LabelText>
                <BodyText sx={{ mt: 0 }}>
                  Used for form labels or small headings.
                </BodyText>
              </Box>
              <Caption>
                Caption Text (caption) - Used for timestamps, footnotes, or
                other small text.
              </Caption>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Element</TableCell>
                    <TableCell>Font Size</TableCell>
                    <TableCell>Font Weight</TableCell>
                    <TableCell>Line Height</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Page Title</TableCell>
                    <TableCell>1.5rem - 2rem</TableCell>
                    <TableCell>500</TableCell>
                    <TableCell>1.4</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Section Title</TableCell>
                    <TableCell>1.25rem - 1.5rem</TableCell>
                    <TableCell>500</TableCell>
                    <TableCell>1.4</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Subsection Title</TableCell>
                    <TableCell>1.1rem - 1.25rem</TableCell>
                    <TableCell>500</TableCell>
                    <TableCell>1.4</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Body Text</TableCell>
                    <TableCell>1rem</TableCell>
                    <TableCell>400</TableCell>
                    <TableCell>1.6</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Secondary Text</TableCell>
                    <TableCell>0.875rem</TableCell>
                    <TableCell>400</TableCell>
                    <TableCell>1.6</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </SectionContainer>

      <SectionContainer>
        <SectionTitle>Buttons</SectionTitle>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SubsectionTitle>Button Variants</SubsectionTitle>
            <FlexBox
              direction="column"
              align="flex-start"
              spacing={2}
              sx={{ mb: 3 }}
            >
              <PrimaryButton>Primary Button</PrimaryButton>
              <SecondaryButton>Secondary Button</SecondaryButton>
              <TextButton>Text Button</TextButton>
              <DangerButton>Danger Button</DangerButton>
            </FlexBox>

            <SubsectionTitle>Button Sizes</SubsectionTitle>
            <FlexBox spacing={2} sx={{ mb: 3 }}>
              <PrimaryButton size="small">Small</PrimaryButton>
              <PrimaryButton size="medium">Medium</PrimaryButton>
              <PrimaryButton size="large">Large</PrimaryButton>
            </FlexBox>

            <SubsectionTitle>Buttons with Icons</SubsectionTitle>
            <FlexBox spacing={2} sx={{ mb: 3 }}>
              <PrimaryButton startIcon={<AddIcon />}>Add New</PrimaryButton>
              <SecondaryButton startIcon={<EditIcon />}>Edit</SecondaryButton>
              <DangerButton startIcon={<DeleteIcon />}>Delete</DangerButton>
            </FlexBox>

            <SubsectionTitle>Icon Buttons</SubsectionTitle>
            <FlexBox spacing={2}>
              <AppIconButton color="primary">
                <AddIcon />
              </AppIconButton>
              <AppIconButton color="secondary">
                <EditIcon />
              </AppIconButton>
              <AppIconButton color="error">
                <DeleteIcon />
              </AppIconButton>
            </FlexBox>
          </Grid>

          <Grid item xs={12} md={6}>
            <SubsectionTitle>Button Usage Guidelines</SubsectionTitle>
            <BodyText>
              <strong>Primary Button:</strong> Use for the main action on a page
              or in a section. There should typically be only one primary button
              per section.
            </BodyText>
            <BodyText>
              <strong>Secondary Button:</strong> Use for secondary actions that
              are less important than the primary action but still need
              emphasis.
            </BodyText>
            <BodyText>
              <strong>Text Button:</strong> Use for tertiary actions, links, or
              in places where space is limited.
            </BodyText>
            <BodyText>
              <strong>Danger Button:</strong> Use for destructive actions like
              delete or remove.
            </BodyText>
            <SecondaryText>
              Always use the appropriate button variant based on the action's
              importance. Maintain consistent button sizing and spacing
              throughout the application.
            </SecondaryText>
          </Grid>
        </Grid>
      </SectionContainer>

      <SectionContainer>
        <SectionTitle>Layout Containers</SectionTitle>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <CardContainer>
              <SubsectionTitle>Card Container</SubsectionTitle>
              <SecondaryText>
                Used for content cards, list items, or any content that should
                be visually grouped. Has hover effects and consistent padding.
              </SecondaryText>
            </CardContainer>
          </Grid>
          <Grid item xs={12} md={8}>
            <CardContainer>
              <SubsectionTitle>
                Section Container with Elevation
              </SubsectionTitle>
              <SecondaryText>
                Used for major sections of a page. Can have elevation or border.
                Provides consistent padding and margin.
              </SecondaryText>
              <FlexBox justify="space-between" sx={{ mt: 2 }}>
                <TextButton>Cancel</TextButton>
                <PrimaryButton>Save</PrimaryButton>
              </FlexBox>
            </CardContainer>
          </Grid>
        </Grid>
      </SectionContainer>

      <SectionContainer>
        <SectionTitle>Color Palette</SectionTitle>
        <Grid container spacing={2}>
          {Object.entries(theme.palette).map(([key, value]) => {
            if (typeof value === "object" && value.main && key !== "common") {
              return (
                <Grid item xs={6} sm={4} md={3} key={key}>
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        bgcolor: `${key}.main`,
                        height: 80,
                        borderRadius: 1,
                        mb: 1,
                        boxShadow: 1,
                      }}
                    />
                    <LabelText sx={{ textTransform: "capitalize" }}>
                      {key}
                    </LabelText>
                    <Caption>{value.main}</Caption>
                  </Box>
                </Grid>
              );
            }
            return null;
          })}
        </Grid>
      </SectionContainer>

      <SectionContainer>
        <SectionTitle>Spacing</SectionTitle>
        <BodyText>
          The application uses a consistent spacing system based on a unit of
          8px. Spacing values are multipliers of this base unit.
        </BodyText>
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 6, 8].map((spacing) => (
            <Grid item xs={6} sm={4} md={2} key={spacing}>
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    height: theme.spacing(spacing),
                    bgcolor: "primary.light",
                    borderRadius: 1,
                    mb: 1,
                  }}
                />
                <Caption>
                  {spacing} ({theme.spacing(spacing)}px)
                </Caption>
              </Box>
            </Grid>
          ))}
        </Grid>
      </SectionContainer>
    </PageContainer>
  );
}

export default StyleGuidePage;
