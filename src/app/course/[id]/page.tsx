"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import Header from "../../components/header/header";
import RegistrForm from "../../components/form/registrform";
import AuthForm from "../../components/form/authform";
import AuthPromptModal from "../../components/modal/authPromptModal";
import CourseAddModal from "../../components/modal/courseAddModal";
import {
  isAuthenticated as checkAuth,
  removeToken,
} from "../../services/authToken";
import styles from "../course.module.css";
import pageStyles from "../../page.module.css";

const AuthHeader = dynamic(() => import("../../components/header/authHeader"), {
  ssr: false,
});

const STORAGE_KEY = "sky_fitness_auth";

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

const courseImages: Record<string, string> = {
  yoga: "/img/yoga.png",
  stretching: "/img/stretching.png",
  fitness: "/img/fitness.png",
  "step-aerobics": "/img/step_aerobics.png",
  bodyflex: "/img/bodyflex.png",
};

const courseCardImages: Record<string, string> = {
  yoga: "/img/youga_card.png",
  stretching: "/img/stretching_card.png",
  fitness: "/img/fitness_card.png",
  "step-aerobics": "/img/step_aerobics_card.png",
  bodyflex: "/img/bodyflex_card.png",
};

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const [courseId, setCourseId] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<"register" | "auth">("register");
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [courseAddModal, setCourseAddModal] = useState<{
    isOpen: boolean;
    type: "success" | "alreadyAdded" | "error";
  }>({ isOpen: false, type: "success" });
  const mountedRef = useRef(false);

  useLayoutEffect(() => {
    mountedRef.current = true;
    setIsMounted(true);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;

    if (typeof window !== "undefined" && checkAuth()) {
      const savedAuth = localStorage.getItem(STORAGE_KEY);
      if (savedAuth) {
        try {
          const authData: AuthData = JSON.parse(savedAuth);
          if (authData.isAuthenticated && authData.userName && authData.userEmail) {
            if (mountedRef.current) {
              setIsAuthenticated(true);
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
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!mountedRef.current || !courseId) return;

    if (!isAuthenticated && courseId) {
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          setShowAuthPrompt(true);
        }
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isAuthenticated, courseId]);

  useEffect(() => {
    if (params?.id && typeof params.id === "string") {
      setCourseId(params.id);
    }
  }, [params]);

  const courseImage = courseId
    ? courseImages[courseId] || "/img/fitness.png"
    : "/img/fitness.png";

  const courseCardImage = courseId
    ? courseCardImages[courseId] || "/img/fitness_card.png"
    : "/img/fitness_card.png";

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
        } catch {
        }
      }
    });
  };

  const handleCloseAuthPrompt = () => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        try {
          setShowAuthPrompt(false);
        } catch {
        }
      }
    });
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
    if (!mountedRef.current) return;
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      removeToken();
      localStorage.removeItem(STORAGE_KEY);
      router.push("/");
    }
  };

  const handleAddCourse = () => {
    if (!mountedRef.current || !courseId || typeof window === "undefined") {
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

      const courseNameMap: Record<string, string> = {
        yoga: "Йога",
        stretching: "Стретчинг",
        fitness: "Фитнес",
        "step-aerobics": "Степ-аэробика",
        bodyflex: "Бодифлекс",
      };

      const courseImage = courseImages[courseId] || "/img/fitness.png";
      const courseName = courseNameMap[courseId] || "Курс";

      const newCourse: Course = {
        id: courseId,
        name: courseName,
        image: courseImage,
        duration: 25,
        dailyDuration: { from: 20, to: 50 },
        difficulty: "Сложность",
        progress: 0,
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
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        try {
          setCourseAddModal({ isOpen: false, type: "success" });
        } catch {
        }
      }
    });
  };

  return (
    <>
      {isAuthenticated && userName && userEmail ? (
        <AuthHeader
          userName={userName}
          userEmail={userEmail}
          onLogout={handleLogout}
        />
      ) : (
        <Header onLoginClick={handleLoginClick} />
      )}
      <main className={styles.courseMain}>
        <div className={styles.courseImageContainer}>
          {courseId ? (
            <>
              <Image
                src={courseCardImage}
                alt={courseId}
                fill
                className={styles.courseImage}
              />
              <Image
                src={courseImage}
                alt={courseId}
                fill
                className={styles.courseImageMobile}
              />
            </>
          ) : (
            <div>Загрузка...</div>
          )}
        </div>
        {courseId && (
          <div className={styles.courseFrame}>
            <h2 className={styles.courseTitle}>Подойдет для вас, если:</h2>
            <div className={styles.courseTextBlocksContainer}>
              <div className={styles.courseTextBlock}>
                <span className={styles.courseTextNumber}>1</span>
                <p className={styles.courseTextDescription}>
                  Давно хотели попробовать йогу, но не решались начать
                </p>
              </div>
              <div className={styles.courseTextBlock2}>
                <span className={styles.courseTextNumber2}>2</span>
                <p className={styles.courseTextDescription2}>
                  Хотите укрепить позвоночник, избавиться от болей в спине и
                  суставах
                </p>
              </div>
              <div className={styles.courseTextBlock3}>
                <span className={styles.courseTextNumber3}>3</span>
                <p className={styles.courseTextDescription}>
                  Ищете активность, полезную для тела и души
                </p>
              </div>
            </div>
          </div>
        )}
        {courseId && (
          <div className={styles.directionsSection}>
            <h2 className={styles.directionsTitle}>Направления</h2>
            <div className={styles.directionsFrame}>
              <div className={styles.directionBlock}>
                <div className={styles.directionItem}>
                  <Image
                    src="/img/Sparcle.svg"
                    alt="icon"
                    width={24}
                    height={24}
                    className={styles.directionsIcon}
                  />
                  <span className={styles.directionsText}>
                    Йога для новичков
                  </span>
                </div>
                <div className={styles.directionItem}>
                  <Image
                    src="/img/Sparcle.svg"
                    alt="icon"
                    width={24}
                    height={24}
                    className={styles.directionsIcon}
                  />
                  <span className={styles.directionsText}>
                    Классическая йога
                  </span>
                </div>
              </div>
              <div className={styles.directionBlock}>
                <div className={styles.directionItem}>
                  <Image
                    src="/img/Sparcle.svg"
                    alt="icon"
                    width={24}
                    height={24}
                    className={styles.directionsIcon}
                  />
                  <span className={styles.directionsText}>Кундалини-йога</span>
                </div>
                <div className={styles.directionItem}>
                  <Image
                    src="/img/Sparcle.svg"
                    alt="icon"
                    width={24}
                    height={24}
                    className={styles.directionsIcon}
                  />
                  <span className={styles.directionsText}>Йогатерапия</span>
                </div>
              </div>
              <div className={styles.directionBlock}>
                <div className={styles.directionItem}>
                  <Image
                    src="/img/Sparcle.svg"
                    alt="icon"
                    width={24}
                    height={24}
                    className={styles.directionsIcon}
                  />
                  <span className={styles.directionsText}>Хатха-йога</span>
                </div>
                <div className={styles.directionItem}>
                  <Image
                    src="/img/Sparcle.svg"
                    alt="icon"
                    width={24}
                    height={24}
                    className={styles.directionsIcon}
                  />
                  <span className={styles.directionsText}>Аштанга-йога</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {courseId && (
          <>
            <Image
              src="/img/runner.png"
              alt="runner"
              width={500}
              height={500}
              className={styles.courseRunnerImage}
            />
            <Image
              src="/img/runner.png"
              alt="runner"
              width={300}
              height={300}
              className={styles.courseRunnerImageMobile}
            />
            <Image
              src="/img/vector.png"
              alt="vector"
              width={200}
              height={200}
              className={styles.courseVectorImageMobile}
            />
            <div className={styles.courseContentBlock}>
              <div className={styles.courseContentRight}>
                <h2 className={styles.courseContentTitle}>
                  Начните путь
                  <br />к новому телу
                </h2>
                <ul className={styles.courseContentList}>
                  <li>проработка всех групп мышц</li>
                  <li>тренировка суставов</li>
                  <li>улучшение циркуляции крови</li>
                  <li>упражнения заряжают бодростью</li>
                  <li>помогают противостоять стрессам</li>
                </ul>
                {isAuthenticated ? (
                  <button
                    className={styles.courseContentButton}
                    onClick={handleAddCourse}
                  >
                    Добавить курс
                  </button>
                ) : (
                  <button
                    className={styles.courseContentButton}
                    onClick={handleLoginClick}
                  >
                    Войдите, чтобы добавить курс
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      {isMounted && isFormOpen && (
        <div
          className={pageStyles.modalOverlay}
          onClick={handleCloseForm}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={pageStyles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={pageStyles.closeButton}
              onClick={handleCloseForm}
              aria-label="Закрыть"
              type="button"
            >
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
      {isMounted && showAuthPrompt && !isAuthenticated && (
        <AuthPromptModal
          onClose={handleCloseAuthPrompt}
          onLoginClick={handleLoginClick}
        />
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
