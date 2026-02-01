import { BASE_URL } from "../constants";
import { getToken } from "../authToken";

export interface ApiError {
  message: string;
}

export interface Course {
  _id: string;
  nameRU: string;
  nameEN: string;
  description: string;
  directions: string[];
  fitting: string[];
  workouts: string[];
}

export interface CourseDetail extends Course {
  difficulty: string;
  durationInDays: number;
  dailyDurationInMinutes: {
    from: number;
    to: number;
  };
}

export interface Workout {
  _id: string;
  name: string;
  video: string;
  exercises: Exercise[];
}

export interface Exercise {
  _id: string;
  name: string;
  quantity: number;
}

export interface AddCourseRequest {
  courseId: string;
}

export interface AddCourseResponse {
  message: string;
}

export interface DeleteCourseResponse {
  message: string;
}

export interface ResetCourseResponse {
  message: string;
}

export interface WorkoutProgress {
  workoutId: string;
  workoutCompleted: boolean;
  progressData: number[];
}

export interface CourseProgress {
  courseId: string;
  courseCompleted: boolean;
  workoutsProgress: WorkoutProgress[];
}

export interface SaveWorkoutProgressRequest {
  progressData: number[];
}

export interface ResetWorkoutProgressResponse {
  message: string;
}

export async function getAllCourses(): Promise<Course[]> {
  const response = await fetch(`${BASE_URL}/api/fitness/courses`, {
    method: "GET",
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function getCourseById(courseId: string): Promise<CourseDetail> {
  const response = await fetch(`${BASE_URL}/api/fitness/courses/${courseId}`, {
    method: "GET",
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function getCourseWorkouts(courseId: string): Promise<Workout[]> {
  const token = getToken();
  if (!token) {
    throw new Error("Требуется авторизация");
  }

  const response = await fetch(
    `${BASE_URL}/api/fitness/courses/${courseId}/workouts`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function addCourseToUser(courseId: string): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error("Требуется авторизация");
  }

  const requestBody: AddCourseRequest = {
    courseId: courseId,
  };

  const response = await fetch(`${BASE_URL}/api/fitness/users/me/courses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message);
  }

  await response.json();
}

export async function deleteCourseFromUser(courseId: string): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error("Требуется авторизация");
  }

  const response = await fetch(
    `${BASE_URL}/api/fitness/users/me/courses/${courseId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message);
  }

  await response.json();
}

export async function resetCourseProgress(courseId: string): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error("Требуется авторизация");
  }

  const response = await fetch(
    `${BASE_URL}/api/fitness/courses/${courseId}/reset`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message);
  }

  await response.json();
}

export async function getWorkoutById(workoutId: string): Promise<Workout> {
  const token = getToken();
  if (!token) {
    throw new Error("Требуется авторизация");
  }

  const response = await fetch(
    `${BASE_URL}/api/fitness/workouts/${workoutId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function getCourseProgress(
  courseId: string
): Promise<CourseProgress> {
  const token = getToken();
  if (!token) {
    throw new Error("Требуется авторизация");
  }

  const response = await fetch(
    `${BASE_URL}/api/fitness/users/me/progress?courseId=${courseId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function getWorkoutProgress(
  courseId: string,
  workoutId: string
): Promise<WorkoutProgress> {
  const token = getToken();
  if (!token) {
    throw new Error("Требуется авторизация");
  }

  const response = await fetch(
    `${BASE_URL}/api/fitness/users/me/progress?courseId=${courseId}&workoutId=${workoutId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function saveWorkoutProgress(
  courseId: string,
  workoutId: string,
  progressData: number[]
): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error("Требуется авторизация");
  }

  const requestBody: SaveWorkoutProgressRequest = {
    progressData: progressData,
  };

  const response = await fetch(
    `${BASE_URL}/api/fitness/courses/${courseId}/workouts/${workoutId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message);
  }

  await response.json();
}

export async function resetWorkoutProgress(
  courseId: string,
  workoutId: string
): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error("Требуется авторизация");
  }

  const response = await fetch(
    `${BASE_URL}/api/fitness/courses/${courseId}/workouts/${workoutId}/reset`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message);
  }

  await response.json();
}
