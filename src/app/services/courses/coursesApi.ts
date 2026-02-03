import { BASE_URL } from '../constants';
import { getToken, removeToken } from '@/app/services/authToken';
import { Course, Workout, ProgressResponse, ApiError } from '@/types/shared';
import { addPendingCourse } from '../pendingCourse';

/**
 * Вспомогательная функция для запросов с авторизацией
 */
async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  if (!token) {
    throw new Error('Токен авторизации не найден');
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    'Authorization': `Bearer ${token.trim()}`,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof data === 'object' && data?.message
        ? data.message
        : `Ошибка запроса: ${response.status}`;
    
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    
    if (response.status === 401) {
      removeToken();
    }
    
    throw error;
  }

  return data as T;
}

/**
 * Получить все курсы
 * GET /api/fitness/courses
 */
export const getCourses = async (): Promise<Course[]> => {
  const response = await fetch(`${BASE_URL}/api/fitness/courses`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Ошибка получения курсов');
  }
  
  return data;
};

/**
 * Получить курс по ID
 * GET /api/fitness/courses/[courseId]
 */
export const getCourseById = async (courseId: string): Promise<Course> => {
  const response = await fetch(`${BASE_URL}/api/fitness/courses/${courseId}`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Ошибка получения курса');
  }
  
  return data;
};

/**
 * Получить список тренировок курса
 * GET /api/fitness/courses/[courseId]/workouts
 * Требует авторизации
 */
export const getCourseWorkouts = async (
  courseId: string
): Promise<Workout[]> => {
  return await fetchWithAuth<Workout[]>(
    `/api/fitness/courses/${courseId}/workouts`
  );
};

/**
 * Получить данные по тренировке
 * GET /api/fitness/workouts/[workoutId]
 * Требует авторизации
 */
export const getWorkoutById = async (workoutId: string): Promise<Workout> => {
  return await fetchWithAuth<Workout>(
    `/api/fitness/workouts/${workoutId}`
  );
};

/**
 * Добавить курс для пользователя
 * POST /api/fitness/users/me/courses
 * Требует авторизации
 */
export const addUserCourse = async (courseId: string): Promise<{ message: string }> => {
  try {
    return await fetchWithAuth<{ message: string }>(
      `/api/fitness/users/me/courses`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ courseId }),
      }
    );
  } catch (error) {
    if (error instanceof Error && 'status' in error && error.status === 500) {
      await addPendingCourse(courseId);
      const err = new Error(
        'Ошибка сервера при добавлении курса. Курс добавлен в очередь на обработку.'
      ) as Error & { status?: number; isPending?: boolean };
      err.status = 500;
      err.isPending = true;
      throw err;
    }
    throw error;
  }
};

/**
 * Удалить курс у пользователя
 * DELETE /api/fitness/users/me/courses/[courseId]
 * Требует авторизации
 */
export const deleteUserCourse = async (courseId: string): Promise<{ message: string }> => {
  return await fetchWithAuth<{ message: string }>(
    `/api/fitness/users/me/courses/${courseId}`,
    {
      method: 'DELETE',
    }
  );
};

/**
 * Удалить весь прогресс по курсу
 * PATCH /api/fitness/courses/[courseId]/reset
 * Требует авторизации
 */
export const resetCourseProgress = async (
  courseId: string
): Promise<{ message: string }> => {
  return await fetchWithAuth<{ message: string }>(
    `/api/fitness/courses/${courseId}/reset`,
    {
      method: 'PATCH',
    }
  );
};

/**
 * Получить прогресс пользователя по всему курсу
 * GET /api/fitness/users/me/progress?courseId={courseId}
 * Требует авторизации
 */
export const getCourseProgress = async (
  courseId: string
): Promise<ProgressResponse> => {
  return await fetchWithAuth<ProgressResponse>(
    `/api/fitness/users/me/progress?courseId=${courseId}`
  );
};

/**
 * Получить прогресс пользователя по тренировке
 * GET /api/fitness/users/me/progress?courseId={courseId}&workoutId={workoutID}
 * Требует авторизации
 */
export const getWorkoutProgress = async (
  courseId: string,
  workoutId: string
): Promise<{ workoutId: string; workoutCompleted: boolean; progressData: number[] }> => {
  return await fetchWithAuth(
    `/api/fitness/users/me/progress?courseId=${courseId}&workoutId=${workoutId}`
  );
};

/**
 * Сохранить прогресс тренировки
 * PATCH /api/fitness/courses/[courseId]/workouts/[workoutId]
 * Требует авторизации
 */
export const saveWorkoutProgress = async (
  courseId: string,
  workoutId: string,
  progressData: number[]
): Promise<{ message: string }> => {
  return await fetchWithAuth<{ message: string }>(
    `/api/fitness/courses/${courseId}/workouts/${workoutId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({ progressData }),
    }
  );
};

/**
 * Удалить весь прогресс по тренировке
 * PATCH /api/fitness/courses/[courseId]/workouts/[workoutId]/reset
 * Требует авторизации
 */
export const resetWorkoutProgress = async (
  courseId: string,
  workoutId: string
): Promise<{ message: string }> => {
  return await fetchWithAuth<{ message: string }>(
    `/api/fitness/courses/${courseId}/workouts/${workoutId}/reset`,
    { 
      method: 'PATCH' 
    }
  );
};

export const courseAPI = {
  getCourses,
  getCourseById,
  getCourseWorkouts,
  getWorkoutById,
  addUserCourse,
  deleteUserCourse,
  resetCourseProgress,
  getCourseProgress,
  getWorkoutProgress,
  saveWorkoutProgress,
  resetWorkoutProgress,
};

export default courseAPI;