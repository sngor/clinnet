// src/app/providers/AmplifyProvider.jsx
import React, { useEffect } from "react";
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from 'aws-amplify/auth';
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
        "Amplify v6 configured successfully with Auth:",
        {
          userPoolId: amplifyConfig.Auth.Cognito.userPoolId,
          userPoolClientId: amplifyConfig.Auth.Cognito.userPoolClientId,
          region: amplifyConfig.Auth.Cognito.region
        }
      );
      
      // Verify auth session is working
      const checkSession = async () => {
        try {
          const session = await fetchAuthSession();
          if (session && session.tokens && session.tokens.idToken) {
            console.log("Auth session verified successfully");
          } else {
            console.warn("Auth session exists but no valid tokens found");
          }
        } catch (err) {
          console.log("No active auth session found:", err.message);
        }
      };
      
      checkSession();
    } catch (error) {
      console.error("Error configuring Amplify:", error);
    }
  }, []); // Empty dependency array means this runs once on mount

  return <>{children}</>;
}

export default AmplifyProvider;