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

export interface ProgressResponse {
  courseId?: string;
  workoutId?: string;
  courseCompleted?: boolean;
  workoutCompleted?: boolean;
  workoutsProgress?: WorkoutProgress[];
  progressData?: number[];
}

export interface User {
  email: string;
  selectedCourses: string[];
}

export interface UserData {
  email: string;
  selectedCourses: string[];
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
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

export interface SaveWorkoutProgressRequest {
  progressData: number[];
}

export interface ResetWorkoutProgressResponse {
  message: string;
}
