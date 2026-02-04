import coursesReducer, {
  setCourses,
  addCourse,
  removeCourse,
  updateCourse,
  setLoading,
  setError,
  setSelectedCourseId,
  clearCourses,
} from "../coursesSlice";
import { CourseDetail } from "@/types/shared";

const mockCourse: CourseDetail = {
  _id: "1",
  nameRU: "Йога",
  nameEN: "Yoga",
  description: "Описание курса",
  directions: ["Гибкость"],
  fitting: ["Для начинающих"],
  workouts: ["workout1"],
  difficulty: "Легкая",
  durationInDays: 30,
  dailyDurationInMinutes: {
    from: 20,
    to: 30,
  },
};

const mockCourseWithWorkouts = {
  ...mockCourse,
  workouts: [],
  progress: {
    courseCompleted: false,
    progressPercent: 0,
  },
};

describe("coursesSlice", () => {
  const initialState = {
    courses: [],
    isLoading: false,
    error: null,
    selectedCourseId: null,
  };

  it("должен возвращать начальное состояние", () => {
    expect(coursesReducer(undefined, { type: "unknown" })).toEqual(
      initialState
    );
  });

  it("должен устанавливать список курсов", () => {
    const courses = [mockCourseWithWorkouts];
    const actual = coursesReducer(initialState, setCourses(courses));
    expect(actual.courses).toEqual(courses);
    expect(actual.courses.length).toBe(1);
  });

  it("должен добавлять курс", () => {
    const actual = coursesReducer(
      initialState,
      addCourse(mockCourseWithWorkouts)
    );
    expect(actual.courses.length).toBe(1);
    expect(actual.courses[0]).toEqual(mockCourseWithWorkouts);
  });

  it("не должен добавлять дубликат курса", () => {
    const stateWithCourse = {
      ...initialState,
      courses: [mockCourseWithWorkouts],
    };
    const actual = coursesReducer(
      stateWithCourse,
      addCourse(mockCourseWithWorkouts)
    );
    expect(actual.courses.length).toBe(1);
  });

  it("должен удалять курс", () => {
    const stateWithCourses = {
      ...initialState,
      courses: [mockCourseWithWorkouts],
    };
    const actual = coursesReducer(stateWithCourses, removeCourse("1"));
    expect(actual.courses.length).toBe(0);
  });

  it("должен обновлять курс", () => {
    const stateWithCourse = {
      ...initialState,
      courses: [mockCourseWithWorkouts],
    };
    const updatedCourse = {
      ...mockCourseWithWorkouts,
      progress: {
        courseCompleted: true,
        progressPercent: 100,
      },
    };
    const actual = coursesReducer(
      stateWithCourse,
      updateCourse({ id: "1", course: updatedCourse })
    );
    expect(actual.courses[0].progress?.progressPercent).toBe(100);
  });

  it("должен устанавливать loading состояние", () => {
    const actual = coursesReducer(initialState, setLoading(true));
    expect(actual.isLoading).toBe(true);
  });

  it("должен устанавливать ошибку", () => {
    const errorMessage = "Ошибка загрузки";
    const actual = coursesReducer(initialState, setError(errorMessage));
    expect(actual.error).toBe(errorMessage);
  });

  it("должен устанавливать выбранный ID курса", () => {
    const actual = coursesReducer(initialState, setSelectedCourseId("1"));
    expect(actual.selectedCourseId).toBe("1");
  });

  it("должен очищать все курсы", () => {
    const stateWithCourses = {
      ...initialState,
      courses: [mockCourseWithWorkouts],
      selectedCourseId: "1",
      error: "Ошибка",
    };
    const actual = coursesReducer(stateWithCourses, clearCourses());
    expect(actual.courses).toEqual([]);
    expect(actual.selectedCourseId).toBe(null);
    expect(actual.error).toBe(null);
  });
});
