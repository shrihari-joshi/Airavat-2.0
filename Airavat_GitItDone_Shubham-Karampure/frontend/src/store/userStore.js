import { create } from 'zustand';
import Cookies from 'js-cookie';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      token: Cookies.get('auth-token') || null,
      isLoading: false,
      error: null,

      // Set loading state
      setLoading: (isLoading) => set({ isLoading }),

      // Set error message
      setError: (error) => set({ error }),

      // Login action
      login: (userData, token) => {
        Cookies.set('auth-token', token, { expires: 7 });
        set({
          user: userData,
          token: token,
          error: null,
        });
      },

      // Logout action
      logout: () => {
        Cookies.remove('auth-token');
        set({
          user: null,
          token: null,
          error: null,
        });
      },

      // Update user profile
      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData },
      })),
    }),
    {
      name: 'user-store',
      getStorage: () => localStorage,
    }
  )
);

export default useUserStore;
