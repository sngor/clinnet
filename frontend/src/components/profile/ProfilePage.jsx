// src/components/profile/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { Avatar, Button, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services";
import { showAlert } from "../../utils";

function ProfilePage() {
  const { user, updateProfileImage } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (imageData) => {
    try {
      setUploading(true);
      const result = await userService.uploadProfileImage(imageData);
      // Update the user context with the new profile image
      updateProfileImage(result.imageUrl);
      showAlert("success", "Profile image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading profile image:", error);
      showAlert("error", "Failed to upload profile image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Avatar
        sx={{ width: 100, height: 100, mb: 2 }}
        src={user?.profileImage || ""}
        alt={user?.firstName}
      >
        {!user?.profileImage &&
          (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "")}
      </Avatar>
      {/* ...existing code for profile details... */}
      <input
        accept="image/*"
        style={{ display: "none" }}
        id="profile-image-upload"
        type="file"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            handleImageUpload(file);
          }
        }}
      />
      <label htmlFor="profile-image-upload">
        <Button variant="contained" component="span" disabled={uploading}>
          {uploading ? <CircularProgress size={24} /> : "Upload Profile Image"}
        </Button>
      </label>
    </div>
  );
}

export default ProfilePage;
