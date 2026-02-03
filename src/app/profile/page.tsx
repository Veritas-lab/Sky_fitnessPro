"use client";

import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import WorkoutSelectionModal from "../components/modal/workoutSelectionModal";
import DeleteConfirmModal from "../components/modal/deleteConfirmModal";
import CourseDeletedModal from "../components/modal/courseDeletedModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCourseById,
  getCourseProgress,
  deleteUserCourse,
} from "../services/courses/coursesApi";
import { CourseDetail } from "@/types/shared";
import {
  getPendingCourses,
  removePendingCourse,
} from "../services/pendingCourse";
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
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
          {showTooltip && <div className={styles.tooltip}>Удалить курс</div>}
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
              <span className={styles.daysText}>{course.duration} дней</span>
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
                {course.dailyDuration.from}-{course.dailyDuration.to} мин/день
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
            <span className={styles.complexityText}>{course.difficulty}</span>
          </div>
        </div>
        <div className={styles.progressSection}>
          <div className={styles.progressText}>Прогресс {course.progress}%</div>
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

const courseNameMap: Record<string, string> = {
  yoga: "yoga",
  stretching: "stretching",
  fitness: "fitness",
  "step-aerobics": "step-aerobics",
  bodyflex: "bodyflex",
};

export default function ProfilePage() {
  const router = useRouter();
  const {
    isAuthenticated,
    userData,
    userName,
    isLoading: authLoading,
    logout,
    refreshUserData,
  } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isCourseDeletedOpen, setIsCourseDeletedOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const mountedRef = useRef(false);
  const prevSelectedCoursesRef = useRef<string>("");

  useLayoutEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadUserData = useCallback(async (): Promise<void> => {
    if (!mountedRef.current || typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    if (!isAuthenticated) {
      if (mountedRef.current) {
        setIsLoading(false);
      }
      return;
    }

    if (!userData) {
      if (mountedRef.current) {
        setIsLoading(false);
      }
      return;
    }

    try {
      const email = userData.email || "";
      if (!email) {
        if (mountedRef.current) {
          setIsLoading(false);
        }
        return;
      }

      const userCourses: Course[] = [];
      const selectedCourses = userData.selectedCourses || [];
      const pendingCourses = getPendingCourses();
      const allCourseIds = [
        ...selectedCourses,
        ...pendingCourses.filter((id) => !selectedCourses.includes(id)),
      ];

      if (Array.isArray(allCourseIds) && allCourseIds.length > 0) {
        try {
          const coursePromises = allCourseIds.map(async (courseId: string): Promise<Course | null> => {
            if (!mountedRef.current) return null;
            try {
              const courseDetail = (await getCourseById(
                courseId
              )) as CourseDetail;
              if (!mountedRef.current) return null;

              let courseProgress;
              try {
                courseProgress = await getCourseProgress(courseId);
                if (!mountedRef.current) return null;
              } catch {
                courseProgress = {
                  courseId: courseId,
                  courseCompleted: false,
                  workoutsProgress: [],
                };
              }

              const workoutsProgress = courseProgress.workoutsProgress || [];
              const totalWorkouts = workoutsProgress.length;
              const completedWorkouts = workoutsProgress.filter(
                (wp) => wp.workoutCompleted
              ).length;
              const progress =
                totalWorkouts > 0
                  ? Math.round((completedWorkouts / totalWorkouts) * 100)
                  : 0;

              const courseNameEN = courseDetail.nameEN.toLowerCase();
              const imageKey = courseNameMap[courseNameEN] || courseNameEN;
              const image = courseImages[imageKey] || "/img/fitness.png";

              return {
                id: courseDetail._id,
                name: courseDetail.nameRU,
                image: image,
                duration: courseDetail.durationInDays,
                dailyDuration: {
                  from: courseDetail.dailyDurationInMinutes.from,
                  to: courseDetail.dailyDurationInMinutes.to,
                },
                difficulty: courseDetail.difficulty,
                progress: progress,
              };
            } catch {
              return null;
            }
          });

          const courses = await Promise.all(coursePromises);
          const validCourses = courses.filter(
            (course: Course | null): course is Course => course !== null
          );
          userCourses.push(...validCourses);
        } catch {}
      }

      if (mountedRef.current) {
        setUser({
          email: email,
          name: userName,
          courses: userCourses,
        });
        setIsLoading(false);
      }
    } catch {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, userData, userName]);

  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated && userData) {
      const selectedCourses = userData.selectedCourses || [];
      const currentSelectedCourses = selectedCourses.join(",");
      const prevStr = prevSelectedCoursesRef.current;

      if (currentSelectedCourses !== prevStr) {
        prevSelectedCoursesRef.current = currentSelectedCourses;
        setIsLoading(true);
        loadUserData();
      } else if (prevStr === "" && currentSelectedCourses) {
        prevSelectedCoursesRef.current = currentSelectedCourses;
        setIsLoading(true);
        loadUserData();
      } else if (prevStr === "" && !currentSelectedCourses && !user) {
        setIsLoading(true);
        loadUserData();
      } else if (prevStr === "" && !currentSelectedCourses) {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      prevSelectedCoursesRef.current = "";
    }
  }, [
    authLoading,
    isAuthenticated,
    userData,
    userData?.selectedCourses?.length,
    userData?.selectedCourses?.join(","),
    loadUserData,
    user,
  ]);

  const handleLogout = () => {
    if (!mountedRef.current) return;
    logout();
    router.push("/");
  };

  const handleDeleteCourse = (courseId: string) => {
    if (!mountedRef.current) return;
    setCourseToDelete(courseId);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (
      !mountedRef.current ||
      !courseToDelete ||
      typeof window === "undefined"
    ) {
      setIsDeleteConfirmOpen(false);
      setCourseToDelete(null);
      return;
    }

    if (!isAuthenticated) {
      setIsDeleteConfirmOpen(false);
      setCourseToDelete(null);
      return;
    }

    try {
      const courseIdToDelete = courseToDelete;
      await deleteUserCourse(courseIdToDelete);
      removePendingCourse(courseIdToDelete);

      await new Promise((resolve) => setTimeout(resolve, 300));

      await refreshUserData();

      await new Promise((resolve) => setTimeout(resolve, 200));

      if (mountedRef.current) {
        loadUserData();
      }

      setIsDeleteConfirmOpen(false);
      setCourseToDelete(null);

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
        } catch {}
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
  const getWorkoutsForCourse = (_courseId: string) => {
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
      {user && (
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
