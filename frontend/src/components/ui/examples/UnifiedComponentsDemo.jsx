import React, { useState } from "react";
import {
  UnifiedCard,
  UnifiedButton,
  UnifiedFormField,
  UnifiedPageContainer,
  UnifiedPageHeader,
  UnifiedSection,
  UnifiedGrid,
  UnifiedFlex,
  StatusChip,
} from "../index";
import { Box, Typography } from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

/**
 * Demo page showcasing the unified component system
 * This serves as both documentation and testing for the components
 */
const UnifiedComponentsDemo = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status: "",
    notifications: false,
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event) => {
    const { name, value, checked, type } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <UnifiedPageContainer>
      <UnifiedPageHeader
        title="UI Component Demo"
        subtitle="Showcasing the unified component system"
        action={
          <UnifiedButton startIcon={<AddIcon />} variant="contained">
            Add New Item
          </UnifiedButton>
        }
      />

      {/* Cards Section */}
      <UnifiedSection title="Card Variants">
        <UnifiedGrid columns={{ xs: 1, sm: 2, lg: 4 }}>
          <UnifiedCard variant="default" title="Default Card">
            <Typography variant="body2">
              This is a default card with standard styling and border.
            </Typography>
          </UnifiedCard>

          <UnifiedCard variant="elevated" title="Elevated Card">
            <Typography variant="body2">
              This card has enhanced shadow for emphasis.
            </Typography>
          </UnifiedCard>

          <UnifiedCard variant="flat" title="Flat Card">
            <Typography variant="body2">
              This card has minimal styling with no shadow.
            </Typography>
          </UnifiedCard>

          <UnifiedCard variant="outlined" title="Outlined Card">
            <Typography variant="body2">
              This card has a prominent border for definition.
            </Typography>
          </UnifiedCard>
        </UnifiedGrid>
      </UnifiedSection>

      {/* Interactive Cards */}
      <UnifiedSection title="Interactive Cards">
        <UnifiedGrid columns={{ xs: 1, sm: 3 }}>
          <UnifiedCard
            interactive
            title="Clickable Card"
            subtitle="Hover to see the effect"
            onClick={() => alert("Card clicked!")}
          >
            <Typography variant="body2">
              This card responds to hover and click interactions.
            </Typography>
          </UnifiedCard>

          <UnifiedCard
            title="Card with Actions"
            actions={
              <UnifiedFlex spacing={1}>
                <UnifiedButton size="small" variant="outlined">
                  Edit
                </UnifiedButton>
                <UnifiedButton size="small" variant="contained">
                  View
                </UnifiedButton>
              </UnifiedFlex>
            }
          >
            <Typography variant="body2">
              This card includes action buttons in the footer.
            </Typography>
          </UnifiedCard>

          <UnifiedCard
            title="Status Card"
            headerAction={<StatusChip status="Active" />}
          >
            <Typography variant="body2">
              This card shows status information in the header.
            </Typography>
          </UnifiedCard>
        </UnifiedGrid>
      </UnifiedSection>

      {/* Buttons Section */}
      <UnifiedSection title="Button Variants">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Primary Buttons */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Primary Buttons
            </Typography>
            <UnifiedFlex spacing={2} wrap="wrap">
              <UnifiedButton variant="contained" size="small">
                Small
              </UnifiedButton>
              <UnifiedButton variant="contained" size="medium">
                Medium
              </UnifiedButton>
              <UnifiedButton variant="contained" size="large">
                Large
              </UnifiedButton>
              <UnifiedButton
                variant="contained"
                startIcon={<SaveIcon />}
                loading={loading}
                onClick={handleSubmit}
              >
                {loading ? "Saving..." : "Save"}
              </UnifiedButton>
            </UnifiedFlex>
          </Box>

          {/* Secondary Buttons */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Secondary Buttons
            </Typography>
            <UnifiedFlex spacing={2} wrap="wrap">
              <UnifiedButton variant="outlined">Outlined</UnifiedButton>
              <UnifiedButton variant="text">Text Button</UnifiedButton>
              <UnifiedButton variant="outlined" startIcon={<EditIcon />}>
                Edit
              </UnifiedButton>
              <UnifiedButton
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
              >
                Delete
              </UnifiedButton>
            </UnifiedFlex>
          </Box>
        </Box>
      </UnifiedSection>

      {/* Forms Section */}
      <UnifiedSection title="Form Components">
        <UnifiedCard title="Sample Form" size="large">
          <Box sx={{ maxWidth: 600 }}>
            <UnifiedFormField
              type="text"
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              description="Enter your first and last name"
              required
            />

            <UnifiedFormField
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="user@example.com"
              required
            />

            <UnifiedFormField
              type="select"
              name="status"
              label="Status"
              value={formData.status}
              onChange={handleInputChange}
              options={[
                { value: "", label: "Select status..." },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "pending", label: "Pending" },
              ]}
            />

            <UnifiedFormField
              type="checkbox"
              name="notifications"
              label="Enable email notifications"
              value={formData.notifications}
              onChange={handleInputChange}
            />

            <UnifiedFlex spacing={2} sx={{ mt: 3 }}>
              <UnifiedButton
                variant="contained"
                onClick={handleSubmit}
                loading={loading}
              >
                Submit Form
              </UnifiedButton>
              <UnifiedButton variant="outlined">Cancel</UnifiedButton>
            </UnifiedFlex>
          </Box>
        </UnifiedCard>
      </UnifiedSection>

      {/* Layout Section */}
      <UnifiedSection title="Layout Components">
        <UnifiedCard title="Grid Layout Example">
          <Typography variant="body2" sx={{ mb: 3 }}>
            Responsive grid that adapts to screen size:
          </Typography>
          <UnifiedGrid columns={{ xs: 1, sm: 2, md: 4 }} spacing={2}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Box
                key={item}
                sx={{
                  p: 2,
                  bgcolor: "primary.50",
                  borderRadius: 1,
                  textAlign: "center",
                  border: "1px solid",
                  borderColor: "primary.200",
                }}
              >
                Item {item}
              </Box>
            ))}
          </UnifiedGrid>
        </UnifiedCard>

        <UnifiedCard title="Flex Layout Example" sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Flexible layouts with consistent spacing:
          </Typography>
          <UnifiedFlex direction="column" spacing={2}>
            <UnifiedFlex justify="space-between" align="center">
              <Typography variant="subtitle1">Header Content</Typography>
              <StatusChip status="Active" />
            </UnifiedFlex>
            <UnifiedFlex spacing={1} wrap="wrap">
              <UnifiedButton size="small">Action 1</UnifiedButton>
              <UnifiedButton size="small">Action 2</UnifiedButton>
              <UnifiedButton size="small">Action 3</UnifiedButton>
            </UnifiedFlex>
          </UnifiedFlex>
        </UnifiedCard>
      </UnifiedSection>
    </UnifiedPageContainer>
  );
};

export default UnifiedComponentsDemo;
