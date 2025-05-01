// src/pages/NotFoundPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Button, Container } from "@mui/material";

function NotFoundPage() {
  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{ textAlign: "center", mt: 8 }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh", // Adjust height as needed
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          404
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Oops! Page Not Found.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Sorry, the page you are looking for does not exist. It might have been
          moved or deleted.
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/login" // Or link to '/' or a relevant dashboard if the user might be logged in
          sx={{ mt: 2 }}
        >
          Go Back to Login
        </Button>
      </Box>
    </Container>
  );
}

export default NotFoundPage; // Ensure default export
