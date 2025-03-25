import { type Socket } from "socket.io-client";

declare global {
  // namespace NodeJS {
  //     interface ProcessEnv {
  //     REACT_APP_API_URL: string;
  //     }
  // }

  export interface URLItem {
    id: string;
    longUrl: string;
    shortUrl?: string;
    status:
      | "pending"
      | "processing"
      | "completed"
      | "failed"
      | "active"
      | "archived";
    clicks?: number;
    createdAt?: string;
    error?: string;
  }

  interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
  }

  interface User {
    id: string;
    name: string;
    email: string;
  }

  interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    signup: (userData: {
      name: string;
      email: string;
      password: string;
    }) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: { name: string; email: string }) => Promise<void>;
    updatePassword: (data: {
      currentPassword: string;
      newPassword: string;
    }) => Promise<void>;
  }

  // Theme types
  type ThemeModeType = "dark" | "light" | "system";

  interface ThemeState {
    theme: ThemeModeType;
    systemTheme: "dark" | "light";
    resolvedTheme: "dark" | "light";
    setTheme: (theme: ThemeModeType) => void;
  }
}
export {};
