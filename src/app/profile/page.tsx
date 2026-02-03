"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import styles from "./profile.module.css";
import {
  getCourseById,
  getCourseWorkouts,
  getCourseProgress,
  deleteUserCourse,
} from "@/app/services/courses/coursesApi";
import { CourseDetail } from "@/types/shared";
import { useAuth } from "@/contexts/AuthContext";
import WorkoutSelectionModal from "@/app/components/modal/workoutSelectionModal";

const AuthHeader = dynamic(() => import("@/app/components/header/authHeader"), {
  ssr: false,
  loading: () => <div style={{ height: '80px' }} />,
});

interface CourseWithWorkouts extends CourseDetail {
  workouts: any[];
  progress?: {
    courseCompleted: boolean;
    progressPercent: number;
  };
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
  StepAerobics: "step-aerobics",
  Bodyflex: "bodyflex",
};

const courseNameRUMap: Record<string, string> = {
  Йога: "yoga",
  Стретчинг: "stretching",
  Фитнес: "fitness",
  "Степ-аэробика": "step-aerobics",
  Бодифлекс: "bodyflex",
};

export default function ProfilePage() {
  const router = useRouter();
  const { 
    isAuthenticated, 
    userName, 
    userEmail, 
    logout,
    isLoading: authLoading,
    userData
  } = useAuth();
  
  const [courses, setCourses] = useState<CourseWithWorkouts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithWorkouts | null>(null);
  const mountedRef = useRef(false);
  const userDataRef = useRef(userData);
  const isAuthenticatedRef = useRef(isAuthenticated);
  const authLoadingRef = useRef(authLoading);

  // Обновляем refs при изменении значений
  useEffect(() => {
    userDataRef.current = userData;
    isAuthenticatedRef.current = isAuthenticated;
    authLoadingRef.current = authLoading;
  }, [userData, isAuthenticated, authLoading]);

  useLayoutEffect(() => {
    mountedRef.current = true;
    setIsMounted(true);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Редирект на /login если не авторизован
  useEffect(() => {
    if (!mountedRef.current) return;
    if (!authLoading && !isAuthenticated) {
      // Используем setTimeout для избежания конфликтов с размонтированием
      setTimeout(() => {
        if (mountedRef.current) {
          router.push("/");
        }
      }, 0);
    }
  }, [authLoading, isAuthenticated, router]);


  // Загрузка курсов пользователя
  useEffect(() => {
    if (!mountedRef.current || authLoading || !isAuthenticated) {
      return;
    }

    console.log('[PROFILE PAGE] Запуск загрузки курсов пользователя');
    loadCoursesData();
  }, [authLoading, isAuthenticated, userData?.selectedCourses]);

  // Функция загрузки курсов (используется в разных местах)
  const loadCoursesData = async (): Promise<void> => {
    if (!mountedRef.current || authLoadingRef.current || !isAuthenticatedRef.current) {
      return;
    }
    
    if (!mountedRef.current) return;
    setIsLoading(true);

    try {
      const userCourseIds = userDataRef.current?.selectedCourses || [];
      
      if (userCourseIds.length === 0) {
        if (mountedRef.current) {
          setCourses([]);
          setIsLoading(false);
        }
        return;
      }

      const coursesData = await Promise.all(
        userCourseIds.map(async (courseId) => {
          try {
            const course = await getCourseById(courseId) as CourseDetail;
            const workouts = await getCourseWorkouts(courseId);
            
            let progress: { courseCompleted: boolean; progressPercent: number } | undefined = undefined;
            try {
              const progressData = await getCourseProgress(courseId);
              if (progressData && progressData.workoutsProgress && progressData.workoutsProgress.length > 0) {
                const completedWorkouts = progressData.workoutsProgress.filter(
                  (wp) => wp.workoutCompleted
                ).length;
                const totalWorkouts = progressData.workoutsProgress.length;
                const progressPercent = Math.round((completedWorkouts / totalWorkouts) * 100);
                progress = {
                  progressPercent,
                  courseCompleted: progressData.courseCompleted || false,
                };
              } else {
                progress = {
                  progressPercent: 0,
                  courseCompleted: false,
                };
              }
            } catch (error) {
              if (error instanceof Error) {
                const errorMessage = error.message.toLowerCase();
                if (
                  errorMessage.includes("не был добавлен") ||
                  errorMessage.includes("не найден") ||
                  errorMessage.includes("not found") ||
                  errorMessage.includes("not added")
                ) {
                  progress = {
                    progressPercent: 0,
                    courseCompleted: false,
                  };
                }
              }
            }
            
            return {
              ...course,
              workouts,
              progress,
            } as CourseWithWorkouts;
          } catch (error) {
            console.error(`[PROFILE PAGE] Ошибка загрузки курса ${courseId}:`, error);
            return null;
          }
        })
      );

      const validCourses = coursesData.filter(
        (course): course is CourseWithWorkouts => course !== null
      );

      if (mountedRef.current) {
        setCourses(validCourses);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('[PROFILE PAGE] Ошибка загрузки курсов:', error);
      if (mountedRef.current) {
        setCourses([]);
        setIsLoading(false);
      }
    }
  };

  // Обновление при возврате на страницу (фокус окна)
  useEffect(() => {
    if (!mountedRef.current || !isAuthenticated || authLoading) {
      return;
    }

    const handleFocus = () => {
      // Обновляем курсы при возврате на страницу
      if (mountedRef.current) {
        loadCoursesData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, authLoading]);

  const handleLogout = () => {
    if (!mountedRef.current) return;
    try {
      logout();
      // Используем setTimeout для избежания конфликтов с размонтированием
      setTimeout(() => {
        if (mountedRef.current) {
          router.push("/");
        }
      }, 0);
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const handleStartWorkout = (course: CourseWithWorkouts) => {
    if (!mountedRef.current) return;
    setSelectedCourse(course);
    setIsWorkoutModalOpen(true);
  };

  const handleCloseWorkoutModal = () => {
    if (!mountedRef.current) return;
    setIsWorkoutModalOpen(false);
    setSelectedCourse(null);
    // Обновляем курсы после закрытия модального окна тренировки
    // чтобы обновить прогресс, если тренировка была завершена
    setTimeout(() => {
      if (mountedRef.current) {
        loadCoursesData();
      }
    }, 500);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!mountedRef.current) return;
    try {
      await deleteUserCourse(courseId);
      // Обновляем список курсов
      const updatedCourses = courses.filter((c) => c._id !== courseId);
      if (mountedRef.current) {
        setCourses(updatedCourses);
      }
    } catch (error) {
      console.error('Ошибка при удалении курса:', error);
    }
  };

  const getCourseCardImage = (course: CourseWithWorkouts) => {
    // Сначала пробуем по английскому названию
    let courseId = courseNameMap[course.nameEN || ""];
    
    // Если не нашли, пробуем по русскому названию
    if (!courseId) {
      courseId = courseNameRUMap[course.nameRU || ""];
    }
    
    // Если все еще не нашли, нормализуем английское название
    if (!courseId && course.nameEN) {
      courseId = course.nameEN.toLowerCase().replace(/\s+/g, "-");
    }
    
    // Если и это не помогло, используем дефолтное
    return courseImages[courseId || ""] || "/img/fitness.png";
  };

  const getButtonText = (course: CourseWithWorkouts) => {
    if (!course.progress) return "Начать тренировки";
    if (course.progress.courseCompleted) return "Начать заново";
    if (course.progress.progressPercent > 0) return "Продолжить";
    return "Начать тренировки";
  };

  const getWorkoutsForCourse = (courseId: string) => {
    const course = courses.find((c) => c._id === courseId);
    if (!course || !course.workouts) return [];
    
    return course.workouts.map((workout, index) => ({
      id: workout._id,
      name: workout.name || `Тренировка ${index + 1}`,
      subtitle: workout.description || "Описание тренировки",
      day: index + 1,
    }));
  };

  if (authLoading || !isMounted) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (!isMounted || !isAuthenticated) {
    return null;
  }

  return (
    <>
      {userName && userEmail && (
        <AuthHeader
          userName={userName}
          userEmail={userEmail}
          onLogout={handleLogout}
        />
      )}

      <main className={styles.profileMain}>
        <div className={styles.profileContainer}>
          <div className={styles.profileFrame}>
            <h1 className={styles.profileTitle}>Профиль</h1>
            <div className={styles.userInfoBlock}>
              <Image
                src="/img/Profile_1.png"
                alt="Profile Avatar"
                width={200}
                height={200}
                className={styles.profileAvatar}
              />
              <div className={styles.userData}>
                <div className={styles.userName}>{userName}</div>
                <div className={styles.userLogin}>Логин: {userEmail}</div>
                <button
                  className={styles.logoutButton}
                  onClick={handleLogout}
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>

          <div className={styles.coursesSection}>
            <h2 className={styles.coursesTitle}>Мои курсы</h2>
            
            {isLoading ? (
              <div className={styles.loading}>Загрузка курсов...</div>
            ) : courses.length === 0 ? (
              <div className={styles.emptyState}>
                <p>У вас пока нет выбранных курсов</p>
                <button 
                  className={styles.emptyStateButton}
                  onClick={() => router.push("/")}
                >
                  Выбрать курс
                </button>
              </div>
            ) : (
              <div className={styles.coursesList}>
                {courses.map((course) => (
                  <div key={course._id} className={styles.courseCard}>
                    <div className={styles.courseImageWrapper}>
                      <Image
                        src={getCourseCardImage(course)}
                        alt={course.nameRU || course.nameEN || "Курс"}
                        fill
                        sizes="360px"
                        className={styles.courseImage}
                      />
                      <div className={styles.deleteButtonContainer}>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteCourse(course._id)}
                          aria-label="Удалить курс"
                        >
                          <Image
                            src="/img/minus.svg"
                            alt="Delete"
                            width={27}
                            height={27}
                            className={styles.deleteIcon}
                          />
                          <div className={styles.tooltip}>Удалить курс</div>
                        </button>
                      </div>
                    </div>
                    
                    <div className={styles.courseInfo}>
                      <h3 className={styles.courseName}>
                        {course.nameRU || course.nameEN}
                      </h3>
                      
                      <div className={styles.courseDetails}>
                        <div className={styles.firstRow}>
                          {'durationInDays' in course && (
                            <div className={styles.daysBadge}>
                              <Image
                                src="/img/calendar.svg"
                                alt="Calendar"
                                width={15}
                                height={15}
                                className={styles.calendarIcon}
                              />
                              <span className={styles.daysText}>
                                {course.durationInDays || 0} дней
                              </span>
                            </div>
                          )}
                          
                          {'dailyDurationInMinutes' in course && (
                            <div className={styles.clockBadge}>
                              <Image
                                src="/img/clock.svg"
                                alt="Clock"
                                width={15}
                                height={15}
                                className={styles.clockIcon}
                              />
                              <span className={styles.clockText}>
                                {course.dailyDurationInMinutes?.from || 0}-
                                {course.dailyDurationInMinutes?.to || 0} мин/день
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {'difficulty' in course && (
                          <div className={styles.complexityBadge}>
                            <Image
                              src="/img/complexity.svg"
                              alt="Complexity"
                              width={18}
                              height={18}
                              className={styles.complexityIcon}
                            />
                            <span className={styles.complexityText}>
                              Сложность
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {course.progress && (
                        <div className={styles.progressSection}>
                          <div className={styles.progressText}>
                            Прогресс {course.progress.progressPercent}%
                          </div>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${course.progress.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <button
                        className={styles.courseButton}
                        onClick={() => handleStartWorkout(course)}
                      >
                        {getButtonText(course)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {isMounted && isWorkoutModalOpen && selectedCourse && (
        <WorkoutSelectionModal
          courseName={selectedCourse.nameRU || selectedCourse.nameEN || ""}
          courseId={selectedCourse._id}
          workouts={getWorkoutsForCourse(selectedCourse._id)}
          onClose={handleCloseWorkoutModal}
        />
      )}
    </>
  );
}