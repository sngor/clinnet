// src/components/patients/PersonalInfoTab.jsx
import React, { useState } from "react";
import {
  Grid,
  Typography,
  TextField,
  Box,
  Avatar,
  Button,
} from "@mui/material";

function PersonalInfoTab({
  patient,
  isEditing,
  editedPatient,
  handleInputChange,
  imageUrlToDisplay, // New prop for the image URL
  onEditClick, // New prop for edit button click handler
}) {
  const [selectedImage, setSelectedImage] = useState(null);

  // Safety check for null/undefined patient or editedPatient
  if (!patient) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1">
          Patient information is not available.
        </Typography>
      </Box>
    );
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        // Create a synthetic event-like object to pass to the original handleInputChange
        const syntheticEvent = {
          target: {
            name: "profileImage", // Ensure this matches the field name in editedPatient
            value: reader.result,
          },
        };
        handleInputChange(syntheticEvent);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      const syntheticEvent = {
        target: {
          name: "profileImage", // Ensure this matches the field name in editedPatient
          value: "",
        },
      };
      handleInputChange(syntheticEvent);
    }
  };

  return (
    <Box>
      {/* Header with Edit button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Personal Information</Typography>
        {!isEditing && typeof onEditClick === "function" && (
          <Button
            variant="outlined"
            size="small"
            onClick={onEditClick}
            sx={{ ml: 2 }}
          >
            Edit
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Profile Image Section */}
        <Grid
          item
          xs={12}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Avatar
            src={selectedImage || imageUrlToDisplay || ""} // Use selectedImage if available
            alt="Profile Image"
            sx={{
              width: 120,
              height: 120,
              mb: 2,
              border: "2px solid lightgray",
            }}
          />
          {isEditing && (
            <TextField
              type="file"
              name="profileImageFile"
              onChange={handleImageChange} // Use the new handler for image changes
              accept="image/*"
              size="small"
              fullWidth
              sx={{ maxWidth: 300 }}
            />
          )}
          {!isEditing && !imageUrlToDisplay && (
            <Typography variant="body2" color="text.secondary">
              No profile image uploaded.
            </Typography>
          )}
        </Grid>

        <Grid sx={{ width: { xs: "100%", md: "50%" }, p: 1.5 }}>
          <Grid container spacing={2}>
            <Grid sx={{ width: "100%" }}>
              <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                Contact Information
              </Typography>
            </Grid>

            <Grid sx={{ width: { xs: "100%", sm: "50%" }, p: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                First Name
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  name="firstName"
                  value={editedPatient.firstName || ""}
                  onChange={handleInputChange}
                  size="small"
                  margin="dense"
                />
              ) : (
                <Typography variant="body1">
                  {patient.firstName || "N/A"}
                </Typography>
              )}
            </Grid>

            <Grid sx={{ width: { xs: "100%", sm: "50%" }, p: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Last Name
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  name="lastName"
                  value={editedPatient.lastName || ""}
                  onChange={handleInputChange}
                  size="small"
                  margin="dense"
                />
              ) : (
                <Typography variant="body1">
                  {patient.lastName || "N/A"}
                </Typography>
              )}
            </Grid>

            <Grid sx={{ width: "100%", p: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Address
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  name="address"
                  value={editedPatient.address || ""}
                  onChange={handleInputChange}
                  size="small"
                  margin="dense"
                  multiline
                  rows={2}
                />
              ) : (
                <Typography variant="body1">
                  {patient.address || "N/A"}
                </Typography>
              )}
            </Grid>

            <Grid sx={{ width: { xs: "100%", sm: "50%" }, p: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                City
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  name="city"
                  value={editedPatient.city || ""}
                  onChange={handleInputChange}
                  size="small"
                  margin="dense"
                />
              ) : (
                <Typography variant="body1">{patient.city || "N/A"}</Typography>
              )}
            </Grid>

            <Grid sx={{ width: { xs: "100%", sm: "50%" }, p: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                State
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  name="state"
                  value={editedPatient.state || ""}
                  onChange={handleInputChange}
                  size="small"
                  margin="dense"
                />
              ) : (
                <Typography variant="body1">
                  {patient.state || "N/A"}
                </Typography>
              )}
            </Grid>

            <Grid sx={{ width: { xs: "100%", sm: "50%" }, p: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Zip Code
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  name="zipCode"
                  value={editedPatient.zipCode || ""}
                  onChange={handleInputChange}
                  size="small"
                  margin="dense"
                />
              ) : (
                <Typography variant="body1">
                  {patient.zipCode || "N/A"}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Grid>

        <Grid sx={{ width: { xs: "100%", md: "50%" }, p: 1.5 }}>
          <Grid container spacing={2}>
            <Grid sx={{ width: "100%" }}>
              <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                Emergency Contact
              </Typography>
            </Grid>

            <Grid sx={{ width: { xs: "100%", sm: "50%" }, p: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Emergency Contact Name
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  name="emergencyContactName"
                  value={editedPatient.emergencyContactName || ""}
                  onChange={handleInputChange}
                  size="small"
                  margin="dense"
                />
              ) : (
                <Typography variant="body1">
                  {patient.emergencyContactName || "N/A"}
                </Typography>
              )}
            </Grid>

            <Grid sx={{ width: { xs: "100%", sm: "50%" }, p: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Emergency Contact Phone
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  name="emergencyContactPhone"
                  value={editedPatient.emergencyContactPhone || ""}
                  onChange={handleInputChange}
                  size="small"
                  margin="dense"
                />
              ) : (
                <Typography variant="body1">
                  {patient.emergencyContactPhone || "N/A"}
                </Typography>
              )}
            </Grid>

            <Grid sx={{ width: "100%", p: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Relationship
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  name="emergencyContactRelationship"
                  value={editedPatient.emergencyContactRelationship || ""}
                  onChange={handleInputChange}
                  size="small"
                  margin="dense"
                />
              ) : (
                <Typography variant="body1">
                  {patient.emergencyContactRelationship || "N/A"}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PersonalInfoTab;
