// src/store/authStore.js (Conceptual Example)
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null, // { username: string, role: string } | null
  isAuthenticated: false,
  login: (userData) => {
    // Simulate login logic (replace with API call later)
    let role = 'guest';
    if (userData.username === 'admin') role = 'admin';
    else if (userData.username === 'doctor') role = 'doctor';
    else if (userData.username === 'frontdesk') role = 'frontdesk';
    set({ user: { username: userData.username, role: role }, isAuthenticated: true });
    // Navigation would happen in the component calling login
  },
  logout: () => {
    // Simulate logout (replace with API call later)
    set({ user: null, isAuthenticated: false });
     // Navigation would happen in the component calling logout
  },
}));

export default useAuthStore;

// Usage in a component or custom hook:
// import useAuthStore from '../store/authStore';
// const { user, isAuthenticated, login, logout } = useAuthStore();