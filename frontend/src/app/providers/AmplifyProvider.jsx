// src/app/providers/AmplifyProvider.jsx
import React, { useEffect } from "react";
import { Amplify } from "aws-amplify";
import amplifyConfig from "../../config/amplify-config";

/**
 * Provider component to initialize AWS Amplify
 */
function AmplifyProvider({ children }) {
  useEffect(() => {
    try {
      // Configure Amplify with our config
      Amplify.configure(amplifyConfig);
      
      console.log(
        "Amplify configured successfully with Auth:",
        {
          region: amplifyConfig.Auth.region,
          userPoolId: amplifyConfig.Auth.userPoolId,
          clientId: amplifyConfig.Auth.userPoolWebClientId
        }
      );
    } catch (error) {
      console.error("Error configuring Amplify:", error);
    }
  }, []); // Empty dependency array means this runs once on mount

  return <>{children}</>;
}

export default AmplifyProvider;