"use client";

import { useState, useEffect } from "react";
import Header from "./components/header/header";
import AuthHeader from "./components/header/authHeader";
import Main from "./components/main/main";
import RegistrForm from "./components/form/registrform";
import AuthForm from "./components/form/authform";
import CourseAddModal from "./components/modal/courseAddModal";
import { isAuthenticated as checkAuth, removeToken } from "./services/authToken";
import styles from "./page.module.css";

interface Course {
  id: string;
  name: string;
  image: string;
  duration: number;
  dailyDuration: { from: number; to: number };
  difficulty: string;
  progress: number;
  workoutId?: string;
}

interface AuthData {
  isAuthenticated: boolean;
  userName: string;
  userEmail: string;
  courses?: Course[];
}

const STORAGE_KEY = "sky_fitness_auth";

const courseDataMap: Record<string, Omit<Course, "id">> = {
  yoga: {
    name: "Йога",
    image: "/img/yoga.png",
    duration: 25,
    dailyDuration: { from: 20, to: 50 },
    difficulty: "Сложность",
    progress: 0,
    workoutId: "workout1",
  },
  stretching: {
    name: "Стретчинг",
    image: "/img/stretching.png",
    duration: 25,
    dailyDuration: { from: 20, to: 50 },
    difficulty: "Сложность",
    progress: 0,
    workoutId: "workout2",
  },
  fitness: {
    name: "Фитнес",
    image: "/img/fitness.png",
    duration: 25,
    dailyDuration: { from: 20, to: 50 },
    difficulty: "Сложность",
    progress: 0,
    workoutId: "workout3",
  },
  "step-aerobics": {
    name: "Степ-аэробика",
    image: "/img/step_aerobics.png",
    duration: 25,
    dailyDuration: { from: 20, to: 50 },
    difficulty: "Сложность",
    progress: 0,
  },
  bodyflex: {
    name: "Бодифлекс",
    image: "/img/bodyflex.png",
    duration: 25,
    dailyDuration: { from: 20, to: 50 },
    difficulty: "Сложность",
    progress: 0,
  },
};

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<"register" | "auth">("register");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>("Сергей");
  const [userEmail, setUserEmail] = useState<string>("sergey.petrov96@mail.ru");
  const [courseAddModal, setCourseAddModal] = useState<{
    isOpen: boolean;
    type: "success" | "alreadyAdded" | "error";
  }>({ isOpen: false, type: "success" });

  useEffect(() => {
    if (typeof window !== "undefined" && checkAuth()) {
      const savedAuth = localStorage.getItem(STORAGE_KEY);
      if (savedAuth) {
        try {
          const authData: AuthData = JSON.parse(savedAuth);
          if (authData.isAuthenticated && authData.userEmail) {
            setIsAuthenticated(authData.isAuthenticated);
            setUserName(authData.userName);
            setUserEmail(authData.userEmail);
            
            if (!authData.courses || authData.courses.length === 0) {
              const HISTORY_KEY = `sky_fitness_history_${authData.userEmail}`;
              const savedHistory = localStorage.getItem(HISTORY_KEY);
              if (savedHistory) {
                try {
                  const history = JSON.parse(savedHistory);
                  if (history.courses && history.courses.length > 0) {
                    const updatedAuthData: AuthData = {
                      ...authData,
                      courses: history.courses,
                    };
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAuthData));
                  }
                } catch {
                }
              }
            }
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, []);

  const handleLoginClick = () => {
    setFormType("register");
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleSwitchToAuth = () => {
    setFormType("auth");
  };

  const handleSwitchToRegister = () => {
    setFormType("register");
  };

  const handleAuthSuccess = (name: string, email: string) => {
    setUserName(name);
    setUserEmail(email);
    setIsAuthenticated(true);
    setIsFormOpen(false);
    if (typeof window !== "undefined") {
      const HISTORY_KEY = `sky_fitness_history_${email}`;
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      let savedCourses: Course[] = [];

      if (savedHistory) {
        try {
          const history = JSON.parse(savedHistory);
          savedCourses = history.courses || [];
        } catch {
          savedCourses = [];
        }
      }

      const authData: AuthData = {
        isAuthenticated: true,
        userName: name,
        userEmail: email,
        courses: savedCourses,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      removeToken();
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleAddCourse = (courseId: string) => {
    if (typeof window === "undefined" || !isAuthenticated) {
      setCourseAddModal({ isOpen: true, type: "error" });
      return;
    }

    const savedAuth = localStorage.getItem(STORAGE_KEY);
    if (!savedAuth) {
      setCourseAddModal({ isOpen: true, type: "error" });
      return;
    }

    try {
      const authData: AuthData = JSON.parse(savedAuth);
      const courses = authData.courses || [];

      const courseExists = courses.some((course) => course.id === courseId);
      if (courseExists) {
        setCourseAddModal({ isOpen: true, type: "alreadyAdded" });
        return;
      }

      const courseData = courseDataMap[courseId];
      if (!courseData) {
        setCourseAddModal({ isOpen: true, type: "error" });
        return;
      }

      const newCourse: Course = {
        id: courseId,
        ...courseData,
      };

      const updatedAuthData: AuthData = {
        ...authData,
        courses: [...courses, newCourse],
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAuthData));
      
      const HISTORY_KEY = `sky_fitness_history_${userEmail}`;
      localStorage.setItem(HISTORY_KEY, JSON.stringify({ courses: updatedAuthData.courses }));
      
      setCourseAddModal({ isOpen: true, type: "success" });
    } catch {
      setCourseAddModal({ isOpen: true, type: "error" });
    }
  };

  const handleCloseCourseAddModal = () => {
    try {
      setCourseAddModal({ isOpen: false, type: "success" });
    } catch {
      // Игнорируем ошибки при закрытии
    }
  };

  return (
    <>
      {isAuthenticated ? (
        <AuthHeader
          userName={userName}
          userEmail={userEmail}
          onLogout={handleLogout}
        />
      ) : (
        <Header onLoginClick={handleLoginClick} />
      )}
      <main>
        <Main
          isAuthenticated={isAuthenticated}
          onAddCourse={handleAddCourse}
        />
      </main>
      {isFormOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseForm}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeButton} onClick={handleCloseForm}>
              ×
            </button>
            {formType === "register" ? (
              <RegistrForm
                onSwitchToAuth={handleSwitchToAuth}
                onAuthSuccess={handleAuthSuccess}
              />
            ) : (
              <AuthForm
                onSwitchToRegister={handleSwitchToRegister}
                onAuthSuccess={handleAuthSuccess}
              />
            )}
          </div>
        </div>
      )}
      {courseAddModal.isOpen && (
        <CourseAddModal
          type={courseAddModal.type}
          onClose={handleCloseCourseAddModal}
        />
      )}
    </>
  );
}
