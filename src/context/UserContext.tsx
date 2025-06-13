import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as api from "../services/api";

type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
} | null;

type UserContextType = {
  user: User;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user on app startup
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedToken = await AsyncStorage.getItem("token");
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          api.setToken(storedToken);
        }
      } catch (error) {
        console.error("Failed to load user from storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login({ email, password });
      
      if (response.token && response.user) {
        api.setToken(response.token);
        setUser(response.user);
        await AsyncStorage.setItem("user", JSON.stringify(response.user));
        await AsyncStorage.setItem("token", response.token);
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.register({ name, email, password });
      
      if (response.token && response.user) {
        api.setToken(response.token);
        setUser(response.user);
        await AsyncStorage.setItem("user", JSON.stringify(response.user));
        await AsyncStorage.setItem("token", response.token);
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      // Here you would call your API to update the user
      // For now, we'll just update locally
      setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
      if (user) {
        const updatedUser = { ...user, ...userData };
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, register, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}