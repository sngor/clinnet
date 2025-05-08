// src/app/providers/AmplifyProvider.jsx
import React, { useEffect } from "react";
import { Amplify } from "aws-amplify";
// Make sure this import is correct:
import amplifyConfig from "../../config/amplify-config"; // Import amplifyConfig from its definition file

/**
 * Provider component to initialize AWS Amplify
 */
function AmplifyProvider({ children }) {
  useEffect(() => {
    try {
      // Use the imported amplifyConfig object
      Amplify.configure(amplifyConfig);

      console.log(
        "Amplify configured successfully with API endpoint:",
        amplifyConfig.API.REST.clinnetApi.endpoint // Example of accessing config
      );
    } catch (error) {
      console.error("Error configuring Amplify:", error);
    }
  }, []); // Empty dependency array means this runs once on mount

  return <>{children}</>;
}

export default AmplifyProvider;
