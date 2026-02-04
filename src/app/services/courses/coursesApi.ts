import { BASE_URL } from "../constants";
import { getToken, removeToken } from "@/app/services/authToken";
import { Course, Workout, ProgressResponse, ApiError } from "@/types/shared";
import { addPendingCourse } from "../pendingCourse";

function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 30000
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      reject(
        new Error(
          "Превышено время ожидания ответа от сервера. Проверьте подключение к интернету."
        )
      );
    }, timeout);

    fetch(url, {
      ...options,
      signal: controller.signal,
    })
      .then((response) => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        if (error.name === "AbortError") {
          reject(
            new Error(
              "Превышено время ожидания ответа от сервера. Проверьте подключение к интернету."
            )
          );
        } else {
          reject(error);
        }
      });
  });
}

async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  if (!token) {
    throw new Error("Токен авторизации не найден");
  }

  const existingHeaders = options.headers as Record<string, string> | undefined;
  const headers: Record<string, string> = {
    ...(existingHeaders || {}),
    Authorization: `Bearer ${token.trim()}`,
  };

  try {
    const response = await fetchWithTimeout(
      `${BASE_URL}${path}`,
      {
        ...options,
        headers,
      },
      30000
    );

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const data: unknown = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorData = data as { message?: string } | string;
      const message =
        typeof errorData === "object" && errorData !== null && "message" in errorData
          ? errorData.message
          : typeof errorData === "string"
            ? errorData
            : `Ошибка запроса: ${response.status}`;

      const error = new Error(message) as Error & { status?: number };
      error.status = response.status;

      if (response.status === 401) {
        removeToken();
      }

      throw error;
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("время ожидания") ||
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Не удалось подключиться к серверу. Проверьте подключение к интернету и попробуйте снова."
        );
      }
      throw error;
    }
    throw new Error("Произошла неизвестная ошибка при выполнении запроса");
  }
}

export const getCourses = async (): Promise<Course[]> => {
  try {
    const response = await fetchWithTimeout(
      `${BASE_URL}/api/fitness/courses`,
      {},
      30000
    );
    const data = (await response.json()) as Course[] | { message?: string };

    if (!response.ok) {
      const errorData = data as { message?: string };
      throw new Error(errorData.message || "Ошибка получения курсов");
    }

    return data as Course[];
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("время ожидания") ||
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Не удалось загрузить курсы. Проверьте подключение к интернету и попробуйте снова."
        );
      }
      throw error;
    }
    throw new Error("Ошибка получения курсов");
  }
};

export const getCourseById = async (courseId: string): Promise<Course> => {
  try {
    const response = await fetchWithTimeout(
      `${BASE_URL}/api/fitness/courses/${courseId}`,
      {},
      30000
    );
    const data = (await response.json()) as Course | { message?: string };

    if (!response.ok) {
      const errorData = data as { message?: string };
      throw new Error(errorData.message || "Ошибка получения курса");
    }

    return data as Course;
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("время ожидания") ||
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Не удалось загрузить данные курса. Проверьте подключение к интернету и попробуйте снова."
        );
      }
      throw error;
    }
    throw new Error("Ошибка получения курса");
  }
};

export const getCourseWorkouts = async (
  courseId: string
): Promise<Workout[]> => {
  return await fetchWithAuth<Workout[]>(
    `/api/fitness/courses/${courseId}/workouts`
  );
};

export const getWorkoutById = async (workoutId: string): Promise<Workout> => {
  return await fetchWithAuth<Workout>(`/api/fitness/workouts/${workoutId}`);
};

export const addUserCourse = async (
  courseId: string
): Promise<{ message: string }> => {
  try {
    return await fetchWithAuth<{ message: string }>(
      `/api/fitness/users/me/courses`,
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify({ courseId }),
      }
    );
  } catch (error) {
    if (error instanceof Error && "status" in error && error.status === 500) {
      await addPendingCourse(courseId);
      const err = new Error(
        "Ошибка сервера при добавлении курса. Курс добавлен в очередь на обработку."
      ) as Error & { status?: number; isPending?: boolean };
      err.status = 500;
      err.isPending = true;
      throw err;
    }
    throw error;
  }
};

export const deleteUserCourse = async (
  courseId: string
): Promise<{ message: string }> => {
  return await fetchWithAuth<{ message: string }>(
    `/api/fitness/users/me/courses/${courseId}`,
    {
      method: "DELETE",
    }
  );
};

export const resetCourseProgress = async (
  courseId: string
): Promise<{ message: string }> => {
  return await fetchWithAuth<{ message: string }>(
    `/api/fitness/courses/${courseId}/reset`,
    {
      method: "PATCH",
    }
  );
};

export const getCourseProgress = async (
  courseId: string
): Promise<ProgressResponse> => {
  return await fetchWithAuth<ProgressResponse>(
    `/api/fitness/users/me/progress?courseId=${courseId}`
  );
};

export const getWorkoutProgress = async (
  courseId: string,
  workoutId: string
): Promise<{
  workoutId: string;
  workoutCompleted: boolean;
  progressData: number[];
}> => {
  return await fetchWithAuth(
    `/api/fitness/users/me/progress?courseId=${courseId}&workoutId=${workoutId}`
  );
};

export const saveWorkoutProgress = async (
  courseId: string,
  workoutId: string,
  progressData: number[]
): Promise<{ message: string }> => {
  return await fetchWithAuth<{ message: string }>(
    `/api/fitness/courses/${courseId}/workouts/${workoutId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify({ progressData }),
    }
  );
};

export const resetWorkoutProgress = async (
  courseId: string,
  workoutId: string
): Promise<{ message: string }> => {
  return await fetchWithAuth<{ message: string }>(
    `/api/fitness/courses/${courseId}/workouts/${workoutId}/reset`,
    {
      method: "PATCH",
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
