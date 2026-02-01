import { create } from 'zustand';
import { type UserInfo, logout as logoutApi } from '@/apis/auth';
import { getUserInfoFromToken } from '@/utils/jwt';

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isTokenValidating: boolean;
  login: (user: UserInfo, token: string) => void;
  logout: () => Promise<void>;
  updateUser: (user: Partial<UserInfo>) => void;
  validateToken: () => Promise<boolean>;
  setTokenValidating: (validating: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isTokenValidating: false,

  login: (user: UserInfo, token: string) => {
    set({ user, token, isAuthenticated: true });
    localStorage.setItem('token', token);
  },

  logout: async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.warn('Logout API failed:', error);
    } finally {
      set({ user: null, token: null, isAuthenticated: false });
      localStorage.removeItem('token');
    }
  },

  updateUser: (userData: Partial<UserInfo>) => {
    set((state) => ({ 
      user: state.user ? { ...state.user, ...userData } : null 
    }));
  },

  setTokenValidating: (validating: boolean) => {
    set({ isTokenValidating: validating });
  },

  validateToken: async () => {
    const { setTokenValidating, login, logout, isTokenValidating } = get();

    if (isTokenValidating) {
      return false;
    }

    try {
      setTokenValidating(true);
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }
      const userInfo = getUserInfoFromToken(token);
      if (userInfo) {
        login(userInfo, token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
      return false;
    } finally {
      setTokenValidating(false);
    }
  },
}));

