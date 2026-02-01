"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import WorkoutSelectionModal from "../components/modal/workoutSelectionModal";
import DeleteConfirmModal from "../components/modal/deleteConfirmModal";
import CourseDeletedModal from "../components/modal/courseDeletedModal";
import { removeToken, isAuthenticated as checkAuth } from "../services/authToken";
import styles from "./profile.module.css";

interface CourseCardProps {
  course: Course;
  onDelete: (courseId: string) => void;
  onStartWorkout: (course: Course) => void;
  getButtonText: (progress: number) => string;
}

function CourseCard({
  course,
  onDelete,
  onStartWorkout,
  getButtonText,
}: CourseCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={styles.courseCard}>
      <div className={styles.courseImageWrapper}>
        <Image
          src={course.image}
          alt={course.name}
          fill
          className={styles.courseImage}
        />
        <div
          className={styles.deleteButtonContainer}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button
            className={styles.deleteButton}
            onClick={() => onDelete(course.id)}
            aria-label="Удалить курс"
            title="Удалить курс"
          >
            <Image
              src="/img/minus.svg"
              alt="Удалить курс"
              width={30}
              height={30}
              className={styles.deleteIcon}
            />
          </button>
          {showTooltip && (
            <div className={styles.tooltip}>Удалить курс</div>
          )}
        </div>
      </div>
      <div className={styles.courseInfo}>
        <h3 className={styles.courseName}>{course.name}</h3>
        <div className={styles.courseDetails}>
          <div className={styles.firstRow}>
            <div className={styles.daysBadge}>
              <Image
                src="/img/calendar.svg"
                alt="Calendar"
                width={16}
                height={16}
                className={styles.calendarIcon}
              />
              <span className={styles.daysText}>
                {course.duration} дней
              </span>
            </div>
            <div className={styles.clockBadge}>
              <Image
                src="/img/clock.svg"
                alt="Clock"
                width={16}
                height={16}
                className={styles.clockIcon}
              />
              <span className={styles.clockText}>
                {course.dailyDuration.from}-
                {course.dailyDuration.to} мин/день
              </span>
            </div>
          </div>
          <div className={styles.complexityBadge}>
            <Image
              src="/img/complexity.svg"
              alt="Complexity"
              width={16}
              height={16}
              className={styles.complexityIcon}
            />
            <span className={styles.complexityText}>
              {course.difficulty}
            </span>
          </div>
        </div>
        <div className={styles.progressSection}>
          <div className={styles.progressText}>
            Прогресс {course.progress}%
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
        <button
          className={styles.courseButton}
          onClick={() => onStartWorkout(course)}
        >
          {getButtonText(course.progress)}
        </button>
      </div>
    </div>
  );
}

const AuthHeader = dynamic(() => import("../components/header/authHeader"), {
  ssr: false,
});

// Mock data - будет заменено на реальные данные из API
interface Course {
  id: string;
  name: string;
  image: string;
  duration: number;
  dailyDuration: { from: number; to: number };
  difficulty: string;
  progress: number;
  workoutId?: string; // ID первой тренировки курса
  workouts?: Record<string, number[]>;
}

interface User {
  email: string;
  name: string;
  courses: Course[];
}

const courseImages: Record<string, string> = {
  yoga: "/img/yoga.png",
  stretching: "/img/stretching.png",
  fitness: "/img/fitness.png",
  "step-aerobics": "/img/step_aerobics.png",
  bodyflex: "/img/bodyflex.png",
};

const STORAGE_KEY = "sky_fitness_auth";

interface AuthData {
  isAuthenticated: boolean;
  userName: string;
  userEmail: string;
  courses?: Course[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isCourseDeletedOpen, setIsCourseDeletedOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const mountedRef = useRef(false);

  useLayoutEffect(() => {
    mountedRef.current = true;
    setIsMounted(true);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadUserData = () => {
    if (!mountedRef.current || typeof window === "undefined") return;

    if (!checkAuth()) {
      if (mountedRef.current) {
        setIsLoading(false);
      }
      return;
    }

    const savedAuth = localStorage.getItem(STORAGE_KEY);
    if (savedAuth) {
      try {
        const authData: AuthData = JSON.parse(savedAuth);
        if (authData.isAuthenticated && authData.userName && authData.userEmail) {
          let courses = authData.courses || [];
          
          if (courses.length === 0) {
            const HISTORY_KEY = `sky_fitness_history_${authData.userEmail}`;
            const savedHistory = localStorage.getItem(HISTORY_KEY);
            if (savedHistory) {
              try {
                const history = JSON.parse(savedHistory);
                if (history.courses && history.courses.length > 0) {
                  courses = history.courses;
                  const updatedAuthData: AuthData = {
                    ...authData,
                    courses: courses,
                  };
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAuthData));
                }
              } catch {
                // Игнорируем ошибки
              }
            }
          }
          
          const userData: User = {
            email: authData.userEmail,
            name: authData.userName,
            courses: courses,
          };
          if (mountedRef.current) {
            setUser(userData);
            setIsLoading(false);
          }
        } else {
          if (mountedRef.current) {
            setIsLoading(false);
          }
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    } else {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!mountedRef.current) return;
    loadUserData();

    const handleStorageChange = () => {
      if (mountedRef.current) {
        loadUserData();
      }
    };

    const handleFocus = () => {
      if (mountedRef.current) {
        loadUserData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);
    const interval = setInterval(() => {
      if (document.hasFocus() && mountedRef.current) {
        loadUserData();
      }
    }, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    if (!mountedRef.current) return;
    if (typeof window !== "undefined") {
      removeToken();
      localStorage.removeItem(STORAGE_KEY);
      router.push("/");
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    if (!mountedRef.current) return;
    setCourseToDelete(courseId);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!mountedRef.current || !courseToDelete || typeof window === "undefined") {
      setIsDeleteConfirmOpen(false);
      setCourseToDelete(null);
      return;
    }

    const savedAuth = localStorage.getItem(STORAGE_KEY);
    if (!savedAuth) {
      setIsDeleteConfirmOpen(false);
      setCourseToDelete(null);
      return;
    }

    try {
      const courseIdToDelete = courseToDelete;
      const authData: AuthData = JSON.parse(savedAuth);
      const courses = authData.courses || [];

      const updatedCourses = courses.filter(
        (course) => course.id !== courseIdToDelete
      );

      const updatedAuthData: AuthData = {
        ...authData,
        courses: updatedCourses,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAuthData));
      
      const HISTORY_KEY = `sky_fitness_history_${authData.userEmail}`;
      localStorage.setItem(HISTORY_KEY, JSON.stringify({ courses: updatedCourses }));

      setIsDeleteConfirmOpen(false);
      setCourseToDelete(null);

      if (user && mountedRef.current) {
        const updatedUser: User = {
          ...user,
          courses: updatedCourses,
        };
        setUser(updatedUser);
      }

      setTimeout(() => {
        if (mountedRef.current) {
          setIsCourseDeletedOpen(true);
        }
      }, 300);
    } catch {
      setIsDeleteConfirmOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    if (!mountedRef.current) return;
    setIsDeleteConfirmOpen(false);
    setCourseToDelete(null);
  };

  const handleCloseCourseDeleted = () => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        try {
          setIsCourseDeletedOpen(false);
        } catch {
        }
      }
    });
  };

  const handleAddCourseClick = () => {
    if (!mountedRef.current) return;
    router.push("/");
  };

  const handleScrollToTop = () => {
    if (!mountedRef.current || typeof window === "undefined") return;
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // Игнорируем ошибки прокрутки
    }
  };

  const getButtonText = (progress: number) => {
    if (progress === 0) return "Начать тренировки";
    if (progress === 100) return "Начать заново";
    return "Продолжить";
  };

  const handleStartWorkout = (course: Course) => {
    if (!mountedRef.current) return;
    setSelectedCourse(course);
    setIsWorkoutModalOpen(true);
  };

  const handleCloseWorkoutModal = () => {
    if (!mountedRef.current) return;
    try {
      setIsWorkoutModalOpen(false);
      setSelectedCourse(null);
    } catch {
      // Игнорируем ошибки
    }
  };

  // Mock данные тренировок для курса
  const getWorkoutsForCourse = (courseId: string) => {
    const workouts = [
      {
        id: "workout1",
        name: "Утренняя практика",
        subtitle: "Йога на каждый день",
        day: 1,
      },
      {
        id: "workout2",
        name: "Красота и здоровье",
        subtitle: "Йога на каждый день",
        day: 2,
      },
      {
        id: "workout3",
        name: "Асаны стоя",
        subtitle: "Йога на каждый день",
        day: 3,
      },
      {
        id: "workout4",
        name: "Растягиваем мышцы бедра",
        subtitle: "Йога на каждый день",
        day: 4,
      },
      {
        id: "workout5",
        name: "Гибкость спины",
        subtitle: "Йога на каждый день",
        day: 5,
      },
    ];
    return workouts;
  };

  return (
    <>
      {user && isMounted && (
        <AuthHeader
          userName={user.name}
          userEmail={user.email}
          onLogout={handleLogout}
        />
      )}
      <main className={styles.main}>
        {isLoading ? (
          <div className={styles.container}>
            <div className={styles.loading}>Загрузка...</div>
          </div>
        ) : !user ? (
          <div className={styles.container}>
            <div className={styles.error}>Пользователь не найден</div>
          </div>
        ) : (
          <div className={styles.profileContainer}>
            <h1 className={styles.title}>Профиль</h1>

            <div className={styles.userInfoBlock}>
              <Image
                src="/img/Profile_1.png"
                alt="Profile"
                width={200}
                height={200}
                className={styles.profileAvatar}
              />
              <div className={styles.userData}>
                <h2 className={styles.userName}>{user.name}</h2>
                <p className={styles.userLogin}>Логин: {user.email}</p>
                <button className={styles.logoutButton} onClick={handleLogout}>
                  Выйти
                </button>
              </div>
            </div>

            <h2 className={styles.coursesTitle}>Мои курсы</h2>
            {user.courses.length > 0 ? (
              <div className={styles.coursesList}>
                {user.courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onDelete={handleDeleteCourse}
                    onStartWorkout={handleStartWorkout}
                    getButtonText={getButtonText}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.noCoursesContainer}>
                <p className={styles.noCourses}>
                  У вас пока нет выбранных курсов
                </p>
                <button
                  className={styles.addCourseButton}
                  onClick={handleAddCourseClick}
                >
                  Добавить курс
                </button>
              </div>
            )}
            <button
              className={styles.scrollTopButton}
              onClick={handleScrollToTop}
            >
              Наверх!
            </button>
          </div>
        )}
      </main>
      {isWorkoutModalOpen && selectedCourse && (
        <WorkoutSelectionModal
          courseName={selectedCourse.name}
          workouts={getWorkoutsForCourse(selectedCourse.id)}
          onClose={handleCloseWorkoutModal}
        />
      )}
      {isDeleteConfirmOpen && !isCourseDeletedOpen && (
        <DeleteConfirmModal
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
      {isCourseDeletedOpen && !isDeleteConfirmOpen && (
        <CourseDeletedModal onClose={handleCloseCourseDeleted} />
      )}
    </>
  );
}
