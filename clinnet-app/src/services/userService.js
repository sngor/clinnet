undefined
  }
};

// Login (simulated with JSON Server)
export const login = async (credentials) => {
  try {
    // With JSON Server, we need to fetch users and filter manually
    const response = await api.get(`/users?username=${credentials.username}`);
    const user = response.data[0];
    
    if (user && user.password === credentials.password) {
      // In a real app, you would get a token from the server
      // For now, we'll just return the user without the password
      const { password, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, success: true };
    } else {
      throw new Error('Invalid username or password');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};