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
          region: import.meta.env.VITE_COGNITO_REGION,
          userPoolId: import.meta.env.VITE_USER_POOL_ID,
          userPoolWebClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
        },
        API: {
          REST: {
            clinnetApi: {
              endpoint: apiEndpoint,
              region: import.meta.env.VITE_COGNITO_REGION,
            },
          },
        },
        Storage: {
          S3: {
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
