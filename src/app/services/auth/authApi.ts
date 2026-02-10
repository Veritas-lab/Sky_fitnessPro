import { BASE_URL } from "../constants";
import { getToken, removeToken, saveToken } from "@/app/services/authToken";
import { User, LoginResponse, RegisterResponse } from "@/types/shared";

export const registerUser = async (
  email: string,
  password: string
): Promise<RegisterResponse> => {
  if (!email || !email.trim()) {
    throw new Error("Email обязателен для регистрации");
  }
  if (!password || !password.trim()) {
    throw new Error("Пароль обязателен для регистрации");
  }

  const response = await fetch(`${BASE_URL}/api/fitness/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: JSON.stringify({ email: email.trim(), password }),
  });

  const data = (await response.json()) as
    | RegisterResponse
    | { message?: string };

  if (!response.ok) {
    const errorData = data as { message?: string };
    throw new Error(errorData.message || "Ошибка регистрации");
  }

  return data as RegisterResponse;
};

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  if (!email || !email.trim()) {
    throw new Error("Email обязателен для входа");
  }
  if (!password || !password.trim()) {
    throw new Error("Пароль обязателен для входа");
  }

  const response = await fetch(`${BASE_URL}/api/fitness/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  });

  const data = (await response.json()) as LoginResponse | { message?: string };

  if (!response.ok) {
    const errorData = data as { message?: string };
    throw new Error(errorData.message || "Ошибка входа");
  }

  const loginData = data as LoginResponse;
  if (loginData.token) {
    saveToken(loginData.token);
  } else {
    throw new Error("Сервер не вернул токен авторизации");
  }

  return loginData;
};

export type AuthApiError = Error & { status?: number };

let getMePromise: Promise<User> | null = null;
let getMeInProgress = false;
let lastGetMeTime = 0;
const GET_ME_DEBOUNCE_MS = 1000;

interface TokenPayload {
  exp?: number;
  [key: string]: unknown;
}

const validateToken = (token: string): boolean => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return false;
    }
    const payload = parts[1];
    if (!payload) {
      return false;
    }
    const decodedPayload = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    ) as TokenPayload;
    if (decodedPayload.exp) {
      const expirationTime = decodedPayload.exp * 1000;
      const currentTime = Date.now();
      if (currentTime >= expirationTime) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
};

export const getMe = async (): Promise<User> => {
  if (getMePromise && getMeInProgress) {
    return getMePromise;
  }

  const now = Date.now();
  const timeSinceLastRequest = now - lastGetMeTime;
  if (getMeInProgress && timeSinceLastRequest < GET_ME_DEBOUNCE_MS) {
    if (getMePromise) {
      return getMePromise;
    }
  }

  getMeInProgress = true;
  lastGetMeTime = now;

  getMePromise = (async (): Promise<User> => {
    try {
      const token = getToken();

      if (!token) {
        getMeInProgress = false;
        getMePromise = null;
        const err = new Error("Токен авторизации не найден") as AuthApiError;
        err.status = 401;
        throw err;
      }

      if (!validateToken(token)) {
        removeToken();
        getMeInProgress = false;
        getMePromise = null;
        const err = new Error(
          "Токен авторизации невалиден или истек"
        ) as AuthApiError;
        err.status = 401;
        throw err;
      }

      const cleanToken = token.trim();

      let response: Response;
      try {
        response = await fetch(`${BASE_URL}/api/fitness/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        });
      } catch (fetchError) {
        // Обработка сетевых ошибок (Failed to fetch, CORS, и т.д.)
        console.error("Ошибка при получении данных пользователя:", fetchError);
        getMeInProgress = false;
        getMePromise = null;
        const err = new Error(
          "Не удалось подключиться к серверу. Проверьте подключение к интернету."
        ) as AuthApiError;
        err.status = 0; // 0 означает сетевую ошибку
        throw err;
      }

      const data = (await response.json().catch(() => ({}))) as {
        user?: User;
        email?: string;
        selectedCourses?: string[];
        message?: string;
      };

      if (!response.ok && response.status !== 201) {
        const err = new Error(
          data?.message || "Ошибка получения данных пользователя"
        ) as AuthApiError;
        err.status = response.status;

        if (response.status === 401 || response.status === 400) {
          removeToken();
        }

        getMeInProgress = false;
        getMePromise = null;
        throw err;
      }

      const userData: User = data.user || {
        email: data.email || "",
        selectedCourses: data.selectedCourses || [],
      };

      if (!userData.email) {
        getMeInProgress = false;
        getMePromise = null;
        const err = new Error(
          "Сервер не вернул email пользователя"
        ) as AuthApiError;
        err.status = 400;
        throw err;
      }

      getMeInProgress = false;
      getMePromise = null;

      return userData;
    } catch (error) {
      if (getMeInProgress) {
        getMeInProgress = false;
        getMePromise = null;
      }
      console.error("[AUTH API] Ошибка в getMe:", error);
      throw error;
    }
  })();

  return getMePromise;
};

export const authAPI = {
  registerUser,
  login,
  getMe,
};

export default authAPI;
