// src/app/providers/AmplifyProvider.jsx
import React, { useEffect } from "react";
import { Amplify } from "aws-amplify";

/**
 * Provider component to initialize AWS Amplify
 */
function AmplifyProvider({ children }) {
  useEffect(() => {
    try {
      const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;

      Amplify.configure({
        Auth: {
          // This object needs to be correctly populated
          region: import.meta.env.VITE_COGNITO_REGION,
          userPoolId: import.meta.env.VITE_USER_POOL_ID,
          userPoolWebClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
        },
        API: {
          REST: {
            // This nesting is important for the API category
            clinnetApi: {
              // 'clinnetApi' is the name used in your services/api-amplify.js
              endpoint: import.meta.env.VITE_API_ENDPOINT,
              region: import.meta.env.VITE_COGNITO_REGION, // API region is often the same as Cognito region
            },
          },
        },
        Storage: {
          S3: {
            // This nesting is important for the Storage category
            bucket: import.meta.env.VITE_S3_BUCKET,
            region: import.meta.env.VITE_S3_REGION,
          },
        },
      });

      console.log(
        "Amplify configured successfully with API endpoint:",
        apiEndpoint
      );
    } catch (error) {
      console.error("Error configuring Amplify:", error);
    }
  }, []);

  return <>{children}</>;
}

export default AmplifyProvider;
