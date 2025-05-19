// src/components/admin/UserForm.jsx
import { useState, useEffect } from "react";
import { TextField, Button, CircularProgress } from "@mui/material";

// Helper function to extract username from email
const extractUsernameFromEmail = (email) => {
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return email || "";
  }
  return email.split("@")[0];
};

function UserForm({ user, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    enabled: true,
    password: "",
  });

  // Effect to set form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id || user.sub || user.uniqueId || "",
        // Use displayUsername or extract from email
        username:
          user.displayUsername ||
          extractUsernameFromEmail(user.email) ||
          user.username ||
          "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "user",
        enabled: user.enabled !== undefined ? user.enabled : true,
        password: "",
      });
    }
  }, [user]);

  // Effect to update username when email changes (for new users)
  useEffect(() => {
    if (!user && formData.email && !formData.username) {
      setFormData((prev) => ({
        ...prev,
        username: extractUsernameFromEmail(formData.email),
      }));
    }
  }, [formData.email, user]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // If email changes, also update username for new users
    if (name === "email" && !user) {
      const extractedUsername = extractUsernameFromEmail(value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        username: extractedUsername,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ...existing form fields... */}

      {/* Display username field (readonly if editing) */}
      <TextField
        label="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        fullWidth
        margin="normal"
        disabled={!!user} // Readonly if editing existing user
        helperText={
          user
            ? "Username cannot be changed"
            : "Username will be derived from email"
        }
      />

      {/* ...existing form fields... */}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={isSubmitting}
      >
        {isSubmitting ? <CircularProgress size={24} /> : "Submit"}
      </Button>
      <Button type="button" onClick={onCancel} color="secondary">
        Cancel
      </Button>
    </form>
  );
}

export default UserForm;
