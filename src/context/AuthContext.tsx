"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import {
  getToken,
  removeToken,
  isAuthenticated as checkAuth,
} from "@/app/services/authToken";
import {
  getMe,
  login as loginAPI,
  registerUser as registerAPI,
} from "@/app/services/auth/authApi";
import type { UserData } from "@/types/shared";
import { prunePendingCourses } from "@/app/services/pendingCourse";

interface AuthContextType {
  isAuthenticated: boolean;
  userData: UserData | null;
  userName: string;
  userEmail: string;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const refreshingRef = useRef(false);
  const loadingRef = useRef(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshTimeRef = useRef(0);

  const loadUserData = useCallback(async (): Promise<void> => {
    if (loadingRef.current && !checkAuth()) {
      return;
    }

    loadingRef.current = true;

    if (!mountedRef.current || typeof window === "undefined") {
      if (mountedRef.current) {
        setIsLoading(false);
      }
      loadingRef.current = false;
      return;
    }

    if (!checkAuth()) {
      if (mountedRef.current) {
        setIsAuthenticated(false);
        setUserData(null);
        setUserName("");
        setUserEmail("");
        setIsLoading(false);
      }
      loadingRef.current = false;
      return;
    }

    const token = getToken();
    if (!token) {
      if (mountedRef.current) {
        setIsAuthenticated(false);
        setUserData(null);
        setUserName("");
        setUserEmail("");
        setIsLoading(false);
      }
      loadingRef.current = false;
      return;
    }

    try {
      const data = await getMe();

      if (!mountedRef.current) {
        loadingRef.current = false;
        return;
      }

      if (!data || !data.email) {
        if (mountedRef.current) {
          setIsAuthenticated(false);
          setUserData(null);
          setUserName("");
          setUserEmail("");
          setIsLoading(false);
        }
        loadingRef.current = false;
        return;
      }

      const name = data.email.split("@")[0] || "Пользователь";
      const capitalizedName =
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

      if (mountedRef.current) {
        setIsAuthenticated(true);
        setUserData({
          email: data.email,
          selectedCourses: [...(data.selectedCourses || [])],
        });
        setUserName(capitalizedName);
        setUserEmail(data.email);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("[AUTH CONTEXT] Ошибка в loadUserData:", error);
      if (mountedRef.current) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Обработка сетевых ошибок и ошибок авторизации
        if (
          errorMessage.includes("401") ||
          errorMessage.includes("Unauthorized") ||
          errorMessage.includes("токен") ||
          errorMessage.includes("не найден") ||
          errorMessage.includes("невалиден") ||
          errorMessage.includes("истек")
        ) {
          removeToken();
        }

        // Для сетевых ошибок не удаляем токен, просто показываем неавторизованное состояние
        // Пользователь может быть авторизован, но нет подключения к серверу
        setIsAuthenticated(false);
        setUserData(null);
        setUserName("");
        setUserEmail("");
        setIsLoading(false);
      }
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    mountedRef.current = true;

    // Загружаем данные сразу без задержки для ускорения загрузки страницы
    if (isMounted && mountedRef.current) {
      loadUserData();
    }

    return () => {
      isMounted = false;
      mountedRef.current = false;
    };
  }, [loadUserData]);

  const login = async (email: string, password: string): Promise<void> => {
    if (!mountedRef.current) return;
    setIsLoading(true);

    try {
      await loginAPI(email, password);

      loadingRef.current = false;
      await loadUserData();
    } catch (error) {
      console.error("[AUTH CONTEXT] Ошибка в login:", error);
      if (mountedRef.current) {
        setIsLoading(false);
      }
      throw error;
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    if (!mountedRef.current) return;
    setIsLoading(true);

    try {
      await registerAPI(email, password);

      // После успешной регистрации автоматически выполняем вход
      await loginAPI(email, password);

      loadingRef.current = false;
      await loadUserData();
    } catch (error) {
      console.error("[AUTH CONTEXT] Ошибка в register:", error);
      if (mountedRef.current) {
        setIsLoading(false);
      }
      throw error;
    }
  };

  const logout = () => {
    if (mountedRef.current) {
      removeToken();
      setIsAuthenticated(false);
      setUserData(null);
      setUserName("");
      setUserEmail("");
    }
  };

  const refreshUserData = useCallback(async (): Promise<void> => {
    if (!mountedRef.current) return;
    if (refreshingRef.current) return;
    if (loadingRef.current) return;

    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
    if (timeSinceLastRefresh < 500) {
      return;
    }

    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    refreshingRef.current = true;
    lastRefreshTimeRef.current = now;

    try {
      const token = getToken();
      if (!token) {
        refreshingRef.current = false;
        return;
      }

      try {
        const freshData = await getMe();
        if (!mountedRef.current) {
          refreshingRef.current = false;
          return;
        }

        if (freshData && freshData.email) {
          const name = freshData.email.split("@")[0] || "Пользователь";
          const capitalizedName =
            name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

          if (mountedRef.current) {
            const newSelectedCourses = [...(freshData.selectedCourses || [])];
            prunePendingCourses(newSelectedCourses);
            setUserData({
              email: freshData.email,
              selectedCourses: newSelectedCourses,
            });
            setUserName(capitalizedName);
            setUserEmail(freshData.email);
          }
        }
      } catch (error) {}
    } finally {
      refreshingRef.current = false;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userData,
        userName,
        userEmail,
        isLoading,
        login,
        register,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
