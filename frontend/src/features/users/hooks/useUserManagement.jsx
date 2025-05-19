// src/features/users/hooks/useUserManagement.jsx
import { useState, useCallback, useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch users from Cognito
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current session for the authentication token
      const session = await fetchAuthSession();
      const idToken = session.tokens.idToken.toString();

      // Call your backend API to get users
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/users`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data = await response.json();

      // Process users to include profileImage URLs if available
      const processedUsers = data.users.map((user) => {
        // Extract profile image URL from attributes if available
        const profileImageAttr = user.Attributes?.find(
          (attr) => attr.Name === "custom:profile_image"
        );
        let profileImage = null;

        if (profileImageAttr && profileImageAttr.Value) {
          // Generate a presigned URL for the image or use the stored URL
          profileImage = `${
            import.meta.env.VITE_API_ENDPOINT
          }/users/profile-image/${profileImageAttr.Value}`;
        }

        return {
          username: user.Username,
          uniqueId: user.Username, // Use Username as a unique identifier
          email:
            user.Attributes?.find((attr) => attr.Name === "email")?.Value || "",
          firstName:
            user.Attributes?.find((attr) => attr.Name === "given_name")
              ?.Value || "",
          lastName:
            user.Attributes?.find((attr) => attr.Name === "family_name")
              ?.Value || "",
          phone:
            user.Attributes?.find((attr) => attr.Name === "phone_number")
              ?.Value || "",
          role:
            user.Attributes?.find((attr) => attr.Name === "custom:role")
              ?.Value || "user",
          enabled: user.Enabled,
          profileImage: profileImage,
        };
      });

      setUsers(processedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(`Failed to fetch users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh users - just call fetchUsers again
  const refreshUsers = fetchUsers;

  // CRUD operations (createUser, updateUser, deleteUser, enableUser, disableUser)...
  // Implement these functions as needed, similar to fetchUsers

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    enableUser,
    disableUser,
    refreshUsers,
  };
};

export default useUserManagement;
