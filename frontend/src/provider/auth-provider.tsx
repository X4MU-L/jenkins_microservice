"use client";

import { type ReactNode, useContext, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { AuthContext } from "@/context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        // In a real app, you would fetch the user from your API
        const storedUser = localStorage.getItem("user");
        console.log("storedUser", storedUser);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Authentication error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      // In a real app, you would call your API
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user data
      const userData = {
        id: "user-1",
        name: "John Doe",
        email: credentials.email,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      // In a real app, you would call your API
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user creation
      const newUser = {
        id: "user-" + Math.floor(Math.random() * 1000),
        name: userData.name,
        email: userData.email,
      };

      // In a real app, we would not automatically log in the user after signup
      // but for this demo, we'll do it
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would call your API
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: { name: string; email: string }) => {
    setIsLoading(true);
    try {
      // In a real app, you would call your API
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (user) {
        const updatedUser = {
          ...user,
          name: data.name,
          email: data.email,
        };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    setIsLoading(true);
    try {
      // In a real app, you would call your API
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Password updated successfully
      // No need to update state since the user object doesn't contain the password
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
