import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CourseDetail, Workout } from "@/types/shared";

interface CourseWithWorkouts extends Omit<CourseDetail, "workouts"> {
  workouts: Workout[];
  progress?: {
    courseCompleted: boolean;
    progressPercent: number;
  };
}

interface CoursesState {
  courses: CourseWithWorkouts[];
  isLoading: boolean;
  error: string | null;
  selectedCourseId: string | null;
}

const initialState: CoursesState = {
  courses: [],
  isLoading: false,
  error: null,
  selectedCourseId: null,
};

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setCourses: (state, action: PayloadAction<CourseWithWorkouts[]>) => {
      state.courses = action.payload;
    },
    addCourse: (state, action: PayloadAction<CourseWithWorkouts>) => {
      const existingIndex = state.courses.findIndex(
        (c) => c._id === action.payload._id
      );
      if (existingIndex === -1) {
        state.courses.push(action.payload);
      }
    },
    removeCourse: (state, action: PayloadAction<string>) => {
      state.courses = state.courses.filter((c) => c._id !== action.payload);
    },
    updateCourse: (
      state,
      action: PayloadAction<{ id: string; course: Partial<CourseWithWorkouts> }>
    ) => {
      const index = state.courses.findIndex((c) => c._id === action.payload.id);
      if (index !== -1) {
        state.courses[index] = {
          ...state.courses[index],
          ...action.payload.course,
        };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedCourseId: (state, action: PayloadAction<string | null>) => {
      state.selectedCourseId = action.payload;
    },
    clearCourses: (state) => {
      state.courses = [];
      state.selectedCourseId = null;
      state.error = null;
    },
  },
});

export const {
  setCourses,
  addCourse,
  removeCourse,
  updateCourse,
  setLoading,
  setError,
  setSelectedCourseId,
  clearCourses,
} = coursesSlice.actions;
export default coursesSlice.reducer;
