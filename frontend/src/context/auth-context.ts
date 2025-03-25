import { createContext } from "react";

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  updatePassword: async () => {},
});
