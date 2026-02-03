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
import { getMe, login as loginAPI, registerUser as registerAPI } from "@/app/services/auth/authApi";
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
    console.log('[AUTH CONTEXT] Запуск loadUserData');
    if (loadingRef.current) {
      console.log('[AUTH CONTEXT] loadUserData уже выполняется, пропускаем');
      return;
    }
    loadingRef.current = true;
    
    if (!mountedRef.current || typeof window === "undefined") {
      if (mountedRef.current) {
        setIsLoading(false);
      }
      return;
    }
    
    if (!checkAuth()) {
      console.log('[AUTH CONTEXT] Пользователь не авторизован (checkAuth = false)');
      if (mountedRef.current) {
        setIsAuthenticated(false);
        setUserData(null);
        setUserName("");
        setUserEmail("");
        setIsLoading(false);
      }
      return;
    }

    const token = getToken();
    if (!token) {
      console.log('[AUTH CONTEXT] Токен не найден в localStorage');
      if (mountedRef.current) {
        setIsAuthenticated(false);
        setUserData(null);
        setUserName("");
        setUserEmail("");
        setIsLoading(false);
      }
      return;
    }

    console.log('[AUTH CONTEXT] Токен найден, запрашиваем данные пользователя');

    try {
      const data = await getMe();
      console.log('[AUTH CONTEXT] Данные пользователя получены:', data);
      
      if (!mountedRef.current) return;

      if (!data || !data.email) {
        console.warn('[AUTH CONTEXT] Невалидные данные пользователя (нет email)');
        if (mountedRef.current) {
          setIsAuthenticated(false);
          setUserData(null);
          setUserName("");
          setUserEmail("");
          setIsLoading(false);
        }
        return;
      }

      const name = data.email.split("@")[0] || "Пользователь";
      const capitalizedName =
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

      if (mountedRef.current) {
        console.log('[AUTH CONTEXT] Устанавливаем состояние авторизованного пользователя');
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
      console.error('[AUTH CONTEXT] Ошибка в loadUserData:', error);
      if (mountedRef.current) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        
        if (
          errorMessage.includes("401") ||
          errorMessage.includes("Unauthorized") ||
          errorMessage.includes("токен") ||
          errorMessage.includes("не найден")
        ) {
          console.log('[AUTH CONTEXT] Удаляем токен из-за ошибки авторизации');
          removeToken();
        }
        
        setIsAuthenticated(false);
        setUserData(null);
        setUserName("");
        setUserEmail("");
        setIsLoading(false);
      }
    } finally {
      loadingRef.current = false;
      console.log('[AUTH CONTEXT] loadUserData завершен');
    }
  }, []);

  useEffect(() => {
    console.log('[AUTH CONTEXT] Монтирование AuthProvider');
    let isMounted = true;
    mountedRef.current = true;
    let hasLoaded = false;
    
    const timer = setTimeout(() => {
      if (isMounted && mountedRef.current && !hasLoaded) {
        hasLoaded = true;
        loadUserData();
      }
    }, 100);

    return () => {
      console.log('[AUTH CONTEXT] Размонтирование AuthProvider');
      isMounted = false;
      mountedRef.current = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    console.log('[AUTH CONTEXT] Вызов login:', { email });
    if (!mountedRef.current) return;
    setIsLoading(true);

    try {
      console.log('[AUTH CONTEXT] Вызов loginAPI...');
      await loginAPI(email, password);
      console.log('[AUTH CONTEXT] loginAPI успешно выполнен, вызов loadUserData');
      await loadUserData();
      console.log('[AUTH CONTEXT] login завершен успешно');
    } catch (error) {
      console.error('[AUTH CONTEXT] Ошибка в login:', error);
      if (mountedRef.current) {
        setIsLoading(false);
      }
      throw error;
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    console.log('[AUTH CONTEXT] Вызов register:', { email });
    if (!mountedRef.current) return;
    setIsLoading(true);

    try {
      console.log('[AUTH CONTEXT] Вызов registerAPI...');
      await registerAPI(email, password);
      console.log('[AUTH CONTEXT] registerAPI успешно выполнен, вызов loadUserData');
      await loadUserData();
      console.log('[AUTH CONTEXT] register завершен успешно');
    } catch (error) {
      console.error('[AUTH CONTEXT] Ошибка в register:', error);
      if (mountedRef.current) {
        setIsLoading(false);
      }
      throw error;
    }
  };

  const logout = () => {
    console.log('[AUTH CONTEXT] Вызов logout');
    if (mountedRef.current) {
      removeToken();
      setIsAuthenticated(false);
      setUserData(null);
      setUserName("");
      setUserEmail("");
    }
  };

  const refreshUserData = useCallback(async (): Promise<void> => {
    console.log('[AUTH CONTEXT] Вызов refreshUserData');
    if (!mountedRef.current) return;
    if (refreshingRef.current) return;
    if (loadingRef.current) return;
    
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
    if (timeSinceLastRefresh < 500) {
      console.log('[AUTH CONTEXT] refreshUserData пропущен (debounce)');
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
      } catch (error) {
        // Игнорируем ошибки
      }
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