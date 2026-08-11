import { createContext, useContext, useState, useMemo, useCallback, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

export type UserRole = "driver" | "student" | "teacher" | "parent" | "admin" | "superadmin" | "account" | "transport";

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  schoolId?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  loginWithGoogle: (email: string, name?: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  activeStudentId: string | null;
  setActiveStudentId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "@learnxchain_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    try {
      const response = await api.post("/api/auth/mobile-sign-in", {
        email,
        password,
      });

      if (!response.accessToken || !response.user) {
        throw new Error("Invalid response from server");
      }

      const authUser: AuthUser = {
        id: response.user.id,
        email: response.user.email,
        role: response.user.role as UserRole,
        name: response.user.name,
        schoolId: response.user.schoolId,
      };

      await api.setToken(response.accessToken);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      setUser(authUser);
      return authUser;
    } catch (error: any) {
      throw error;
    }
  }, []);

  const loginWithGoogle = useCallback(async (email: string, name?: string): Promise<AuthUser> => {
    try {
      const response = await api.post("/api/auth/mobile-google-sign-in", {
        email,
        name,
      });

      if (!response.accessToken || !response.user) {
        throw new Error("Invalid response from server");
      }

      const authUser: AuthUser = {
        id: response.user.id,
        email: response.user.email,
        role: response.user.role as UserRole,
        name: response.user.name,
        schoolId: response.user.schoolId,
      };

      await api.setToken(response.accessToken);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      setUser(authUser);
      return authUser;
    } catch (error: any) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await api.removeToken();
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, loginWithGoogle, logout, loadUser, activeStudentId, setActiveStudentId }),
    [user, isLoading, login, loginWithGoogle, logout, loadUser, activeStudentId]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
