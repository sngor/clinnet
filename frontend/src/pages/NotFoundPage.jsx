// src/pages/NotFoundPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { StandardPageLayout } from "../components/ui";

function NotFoundPage() {
  return (
    <StandardPageLayout
      title="404 - Page Not Found"
      subtitle="The page you are looking for does not exist or has been moved"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          py: 8,
        }}
      >
        <Typography
          variant="h1"
          component="div"
          gutterBottom
          sx={{ fontWeight: "bold", color: "primary.main", fontSize: "6rem" }}
        >
          404
        </Typography>
        <Button variant="contained" component={Link} to="/login" sx={{ mt: 4 }}>
          Back to Login
        </Button>
      </Box>
    </StandardPageLayout>
  );
}

export default NotFoundPage; // Ensure default export
