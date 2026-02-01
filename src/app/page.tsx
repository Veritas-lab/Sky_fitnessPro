"use client";

import { useState, useEffect, useRef } from "react";
import Header from "./components/header/header";
import AuthHeader from "./components/header/authHeader";
import Main from "./components/main/main";
import RegistrForm from "./components/form/registrform";
import AuthForm from "./components/form/authform";
import CourseAddModal from "./components/modal/courseAddModal";
import {
  isAuthenticated as checkAuth,
  removeToken,
  getToken,
} from "./services/authToken";
import { getUserData } from "./services/auth/authApi";
import {
  getAllCourses,
  Course as ApiCourse,
  addCourseToUser,
} from "./services/courses/coursesApi";
import styles from "./page.module.css";

interface DisplayCourse {
  _id: string;
  nameRU: string;
  nameEN: string;
  image: string;
  duration: number;
  dailyDuration: { from: number; to: number };
  difficulty: string;
  courseId: string;
}

const courseImages: Record<string, string> = {
  yoga: "/img/yoga.png",
  stretching: "/img/stretching.png",
  fitness: "/img/fitness.png",
  "step-aerobics": "/img/step_aerobics.png",
  bodyflex: "/img/bodyflex.png",
};

const courseNameMap: Record<string, string> = {
  Yoga: "yoga",
  Stretching: "stretching",
  Fitness: "fitness",
  "Step Aerobics": "step-aerobics",
  "StepAerobics": "step-aerobics",
  Bodyflex: "bodyflex",
};

const courseNameRUMap: Record<string, string> = {
  "Йога": "yoga",
  "Стретчинг": "stretching",
  "Фитнес": "fitness",
  "Степ-аэробика": "step-aerobics",
  "Бодифлекс": "bodyflex",
};

const courseOrder = ["yoga", "stretching", "fitness", "step-aerobics", "bodyflex"];

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<"register" | "auth">("register");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [courses, setCourses] = useState<DisplayCourse[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [courseAddModal, setCourseAddModal] = useState<{
    isOpen: boolean;
    type: "success" | "alreadyAdded" | "error";
  }>({ isOpen: false, type: "success" });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mountedRef.current || typeof window === "undefined") return;

    const loadData = async () => {
      try {
        const allCourses = await getAllCourses();

        const displayCourses: DisplayCourse[] = allCourses.map(
          (course: ApiCourse) => {
            let courseId = courseNameMap[course.nameEN];
            if (!courseId) {
              courseId = courseNameRUMap[course.nameRU];
            }
            if (!courseId) {
              const normalizedName = course.nameEN
                .toLowerCase()
                .replace(/\s+/g, "-");
              courseId = normalizedName;
            }

            const imageKey = courseId;
            let image = courseImages[imageKey];
            
            if (!image) {
              const normalizedKey = course.nameEN
                .toLowerCase()
                .replace(/\s+/g, "-");
              image = courseImages[normalizedKey];
            }
            
            if (!image) {
              image = "/img/fitness.png";
            }

            return {
              _id: course._id,
              nameRU: course.nameRU,
              nameEN: course.nameEN,
              image: image,
              duration: 25,
              dailyDuration: { from: 20, to: 50 },
              difficulty: "Сложность",
              courseId: courseId,
            };
          }
        );

        const sortedCourses = displayCourses.sort((a, b) => {
          const indexA = courseOrder.indexOf(a.courseId);
          const indexB = courseOrder.indexOf(b.courseId);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        if (mountedRef.current) {
          setCourses(sortedCourses);
          setIsLoadingCourses(false);
        }
      } catch {
        if (mountedRef.current) {
          setIsLoadingCourses(false);
        }
      }

      if (checkAuth()) {
        const token = getToken();
        if (token) {
          try {
            const userData = await getUserData(token);
            if (mountedRef.current) {
              setIsAuthenticated(true);
              setUserEmail(userData.email);
              const name = userData.email.split("@")[0] || "Пользователь";
              const capitalizedName =
                name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
              setUserName(capitalizedName);
            }
          } catch {
            if (mountedRef.current) {
              setIsAuthenticated(false);
              removeToken();
            }
          }
        }
      }
    };

    loadData();
  }, []);

  const handleLoginClick = () => {
    setFormType("register");
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        try {
          setIsFormOpen(false);
        } catch {}
      }
    });
  };

  const handleSwitchToAuth = () => {
    setFormType("auth");
  };

  const handleSwitchToRegister = () => {
    setFormType("register");
  };

  const handleAuthSuccess = async (name: string, email: string) => {
    setUserName(name);
    setUserEmail(email);
    setIsAuthenticated(true);
    setIsFormOpen(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      removeToken();
    }
  };

  const handleAddCourse = async (courseId: string) => {
    if (
      typeof window === "undefined" ||
      !isAuthenticated ||
      !mountedRef.current
    ) {
      setCourseAddModal({ isOpen: true, type: "error" });
      return;
    }

    const token = getToken();
    if (!token) {
      setCourseAddModal({ isOpen: true, type: "error" });
      return;
    }

    try {
      const allCourses = await getAllCourses();
      const courseNameEN =
        Object.entries(courseNameMap).find(([, id]) => id === courseId)?.[0] ||
        courseId;

      const foundCourse = allCourses.find(
        (course: ApiCourse) =>
          course.nameEN.toLowerCase() === courseNameEN.toLowerCase() ||
          course.nameRU.toLowerCase() === courseNameEN.toLowerCase()
      );

      if (!foundCourse) {
        setCourseAddModal({ isOpen: true, type: "error" });
        return;
      }

      const userData = await getUserData(token);
      const courseExists = userData.selectedCourses.includes(foundCourse._id);

      if (courseExists) {
        setCourseAddModal({ isOpen: true, type: "alreadyAdded" });
        return;
      }

      await addCourseToUser(foundCourse._id);
      setCourseAddModal({ isOpen: true, type: "success" });
    } catch {
      setCourseAddModal({ isOpen: true, type: "error" });
    }
  };

  const handleCloseCourseAddModal = () => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        try {
          setCourseAddModal({ isOpen: false, type: "success" });
        } catch {}
      }
    });
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
          courses={courses}
          isLoadingCourses={isLoadingCourses}
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
