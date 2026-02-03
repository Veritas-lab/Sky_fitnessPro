import { BASE_URL } from '../constants';
import { getToken, removeToken, saveToken } from '@/app/services/authToken';
import { User, LoginResponse, RegisterResponse } from '@/types/shared';

/**
 * Регистрация нового пользователя
 * POST /api/fitness/auth/register
 */
export const registerUser = async (
  email: string,
  password: string,
): Promise<RegisterResponse> => {
  if (!email || !email.trim()) {
    throw new Error('Email обязателен для регистрации');
  }
  if (!password || !password.trim()) {
    throw new Error('Пароль обязателен для регистрации');
  }

  const response = await fetch(`${BASE_URL}/api/fitness/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify({ email: email.trim(), password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Ошибка регистрации');
  }

  return data;
};

/**
 * Авторизация пользователя
 * POST /api/fitness/auth/login
 */
export const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  if (!email || !email.trim()) {
    throw new Error('Email обязателен для входа');
  }
  if (!password || !password.trim()) {
    throw new Error('Пароль обязателен для входа');
  }

  const response = await fetch(`${BASE_URL}/api/fitness/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Ошибка входа');
  }

  // Сохраняем токен в localStorage
  if (data.token) {
    saveToken(data.token);
    console.log('[AUTH API] Токен сохранен:', data.token.substring(0, 20) + '...');
  } else {
    throw new Error('Сервер не вернул токен авторизации');
  }

  return data;
};

/** Ошибка с кодом ответа API */
export type AuthApiError = Error & { status?: number };

// Защита от множественных одновременных запросов getMe
let getMePromise: Promise<User> | null = null;
let getMeInProgress = false;
let lastGetMeTime = 0;
const GET_ME_DEBOUNCE_MS = 1000;

/**
 * Валидация JWT токена
 */
const validateToken = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('[AUTH API] Невалидный токен: неправильное количество частей');
      return false;
    }
    const payload = parts[1];
    if (!payload) {
      console.warn('[AUTH API] Невалидный токен: отсутствует payload');
      return false;
    }
    const decodedPayload = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    );
    if (decodedPayload.exp) {
      const expirationTime = decodedPayload.exp * 1000;
      const currentTime = Date.now();
      if (currentTime >= expirationTime) {
        console.warn('[AUTH API] Токен истек:', new Date(expirationTime).toISOString());
        return false;
      }
    }
    return true;
  } catch (error) {
    console.warn('[AUTH API] Ошибка валидации токена:', error);
    return false;
  }
};

/**
 * Получить данные текущего пользователя
 * GET /api/fitness/users/me
 * Требует авторизации
 */
export const getMe = async (): Promise<User> => {
  if (getMePromise && getMeInProgress) {
    console.log('[AUTH API] Возвращаем существующий запрос getMe');
    return getMePromise;
  }

  const now = Date.now();
  const timeSinceLastRequest = now - lastGetMeTime;
  if (getMeInProgress && timeSinceLastRequest < GET_ME_DEBOUNCE_MS) {
    if (getMePromise) {
      console.log('[AUTH API] Возвращаем кэшированный запрос getMe (debounce)');
      return getMePromise;
    }
  }

  getMeInProgress = true;
  lastGetMeTime = now;
  console.log('[AUTH API] Запуск нового запроса getMe');

  getMePromise = (async (): Promise<User> => {
    try {
      const token = getToken();

      if (!token) {
        getMeInProgress = false;
        getMePromise = null;
        console.warn('[AUTH API] Токен не найден в localStorage');
        const err = new Error('Токен авторизации не найден') as AuthApiError;
        err.status = 401;
        throw err;
      }

      console.log('[AUTH API] Токен найден:', token.substring(0, 20) + '...');

      if (!validateToken(token)) {
        removeToken();
        getMeInProgress = false;
        getMePromise = null;
        console.warn('[AUTH API] Токен невалиден, удален из localStorage');
        const err = new Error('Токен авторизации невалиден или истек') as AuthApiError;
        err.status = 401;
        throw err;
      }

      const cleanToken = token.trim();

      const response = await fetch(`${BASE_URL}/api/fitness/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
        },
      });

      console.log('[AUTH API] Ответ getMe:', {
        status: response.status,
        ok: response.ok,
        url: response.url,
      });

      const data = await response.json().catch(() => ({}));
      console.log('[AUTH API] Данные пользователя:', data);

      // ✅ Исправлено: 201 считается успешным ответом
      if (!response.ok && response.status !== 201) {
        const err = new Error(
          data?.message || 'Ошибка получения данных пользователя'
        ) as AuthApiError;
        err.status = response.status;

        if (response.status === 401 || response.status === 400) {
          removeToken();
        }

        getMeInProgress = false;
        getMePromise = null;
        throw err;
      }

      // ✅ Исправлено: Возвращаем data.user, а не data
      const userData = data.user || data;
      console.log('[AUTH API] Возвращаем данные пользователя:', userData);

      getMeInProgress = false;
      getMePromise = null;

      return userData;
    } catch (error) {
      if (getMeInProgress) {
        getMeInProgress = false;
        getMePromise = null;
      }
      console.error('[AUTH API] Ошибка в getMe:', error);
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