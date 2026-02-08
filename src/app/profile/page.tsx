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
import { CourseDetail, Workout } from "@/types/shared";
import { useAuth } from "@/context/AuthContext";
import WorkoutSelectionModal from "@/app/components/modal/workoutSelectionModal";
import CourseDeletedModal from "@/app/components/modal/courseDeletedModal";
import DeleteConfirmModal from "@/app/components/modal/deleteConfirmModal";

const AuthHeader = dynamic(() => import("@/app/components/header/authHeader"), {
  ssr: false,
  loading: () => <div style={{ height: "80px" }} />,
});

interface CourseWithWorkouts extends Omit<CourseDetail, "workouts"> {
  workouts: Workout[];
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
    userData,
    refreshUserData,
  } = useAuth();

  const [courses, setCourses] = useState<CourseWithWorkouts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] =
    useState<CourseWithWorkouts | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const mountedRef = useRef(false);
  const userDataRef = useRef(userData);
  const isAuthenticatedRef = useRef(isAuthenticated);
  const authLoadingRef = useRef(authLoading);

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

  useEffect(() => {
    if (!mountedRef.current) return;
    if (!authLoading && !isAuthenticated) {
      // Используем requestAnimationFrame для избежания конфликтов с размонтированием
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          setTimeout(() => {
            if (mountedRef.current) {
              router.push("/");
            }
          }, 0);
        }
      });
    }
  }, [authLoading, isAuthenticated, router]);

  
  useEffect(() => {
    if (!mountedRef.current || authLoading || !isAuthenticated) {
      return;
    }

    loadCoursesData();
  }, [authLoading, isAuthenticated, userData?.selectedCourses]);

  
  const loadCoursesData = async (): Promise<void> => {
    if (
      !mountedRef.current ||
      authLoadingRef.current ||
      !isAuthenticatedRef.current
    ) {
      return;
    }

    // Используем requestAnimationFrame для безопасного обновления состояния
    requestAnimationFrame(() => {
      if (!mountedRef.current) return;
      setIsLoading(true);
    });

    try {
      const userCourseIds = userDataRef.current?.selectedCourses || [];

      if (userCourseIds.length === 0) {
        requestAnimationFrame(() => {
          if (mountedRef.current) {
            setCourses([]);
            setIsLoading(false);
          }
        });
        return;
      }

      const coursesData = await Promise.all(
        userCourseIds.map(async (courseId) => {
          // Проверяем mountedRef перед каждой асинхронной операцией
          if (!mountedRef.current) return null;

          try {
            const course = (await getCourseById(courseId)) as CourseDetail;
            if (!mountedRef.current) return null;

            const workouts = await getCourseWorkouts(courseId);
            if (!mountedRef.current) return null;

            let progress:
              | { courseCompleted: boolean; progressPercent: number }
              | undefined = undefined;
            try {
              const progressData = await getCourseProgress(courseId);
              if (!mountedRef.current) return null;

              // Используем общее количество тренировок в курсе
              const totalWorkouts = workouts.length;

              if (
                progressData &&
                progressData.workoutsProgress &&
                totalWorkouts > 0
              ) {
                let totalProgressPercent = 0;
                let workoutsWithProgress = 0;

                // Рассчитываем прогресс для каждой тренировки на основе progressData
                for (const workoutProgress of progressData.workoutsProgress) {
                  // Находим соответствующую тренировку
                  const workout = workouts.find(
                    (w) => w._id === workoutProgress.workoutId
                  );

                  if (
                    workout &&
                    workout.exercises &&
                    workout.exercises.length > 0
                  ) {
                    let workoutPercent = 0;

                    // Если тренировка полностью завершена, считаем её как 100%
                    if (workoutProgress.workoutCompleted === true) {
                      workoutPercent = 100;
                    } else if (
                      workoutProgress.progressData &&
                      workoutProgress.progressData.length > 0
                    ) {
                      // Рассчитываем процент выполнения на основе progressData
                      let totalCompleted = 0;
                      let totalRequired = 0;

                      // Сопоставляем progressData с exercises
                      const exercisesCount = workout.exercises.length;
                      const progressDataCount =
                        workoutProgress.progressData.length;
                      const minLength = Math.min(
                        exercisesCount,
                        progressDataCount
                      );

                      for (let i = 0; i < minLength; i++) {
                        const exercise = workout.exercises[i];
                        const completed = workoutProgress.progressData[i] || 0;
                        const required = exercise.quantity || 0;

                        if (required > 0) {
                          // Ограничиваем выполненное значение максимумом требуемого
                          totalCompleted += Math.min(
                            Math.max(0, completed),
                            required
                          );
                          totalRequired += required;
                        }
                      }

                      // Рассчитываем процент выполнения этой тренировки
                      workoutPercent =
                        totalRequired > 0
                          ? Math.round((totalCompleted / totalRequired) * 100)
                          : 0;
                    }

                    // Добавляем процент этой тренировки к общему прогрессу
                    totalProgressPercent += workoutPercent;
                    workoutsWithProgress++;
                  }
                }

                // Рассчитываем общий процент прогресса курса
                // Учитываем тренировки с прогрессом и тренировки без прогресса (0%)
                const averageProgress =
                  workoutsWithProgress > 0
                    ? totalProgressPercent / totalWorkouts
                    : 0;

                const progressPercent = Math.round(
                  Math.min(averageProgress, 100)
                );

                progress = {
                  progressPercent,
                  courseCompleted: progressData.courseCompleted || false,
                };
              } else {
                // Если нет данных о прогрессе, но есть тренировки - прогресс 0%
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
                } else {
                
                  progress = {
                    progressPercent: 0,
                    courseCompleted: false,
                  };
                }
              } else {
          
                progress = {
                  progressPercent: 0,
                  courseCompleted: false,
                };
              }
            }

            return {
              ...course,
              workouts,
              progress,
            } as CourseWithWorkouts;
          } catch (error) {
            console.error(
              `[PROFILE PAGE] Ошибка загрузки курса ${courseId}:`,
              error
            );
            return null;
          }
        })
      );

      if (!mountedRef.current) return;

      const validCourses = coursesData.filter(
        (course): course is CourseWithWorkouts => course !== null
      );

      requestAnimationFrame(() => {
        if (mountedRef.current) {
          setCourses(validCourses);
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error("[PROFILE PAGE] Ошибка загрузки курсов:", error);
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          setCourses([]);
          setIsLoading(false);
        }
      });
    }
  };

  useEffect(() => {
    if (!mountedRef.current || !isAuthenticated || authLoading) {
      return;
    }

    const handleFocus = async () => {
      if (mountedRef.current) {
        // Обновляем данные пользователя при возврате на страницу
        try {
          await refreshUserData();
        } catch (refreshError) {
          console.error("Ошибка при обновлении данных пользователя:", refreshError);
        }
        // Затем загружаем курсы с актуальными данными
        if (mountedRef.current) {
          loadCoursesData();
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (!mountedRef.current || typeof window === "undefined") return;

    let rafId: number | null = null;

    const handleScroll = () => {
      if (!mountedRef.current) return;

      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        if (!mountedRef.current) return;
        try {
          const scrollY = window.scrollY || window.pageYOffset;
          if (mountedRef.current) {
            setShowScrollTop(scrollY > 300);
          }
        } catch (error) {
          console.error("[PROFILE PAGE] Ошибка в handleScroll:", error);
        }
        rafId = null;
      });
    };

    
    const scrollOptions: AddEventListenerOptions = { passive: true };
    window.addEventListener("scroll", handleScroll, scrollOptions);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      // При удалении опции не нужны, но функция должна быть той же
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollToTop = () => {
    if (!mountedRef.current || typeof window === "undefined") return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const handleLogout = () => {
    if (!mountedRef.current) return;
    try {
      logout();

      requestAnimationFrame(() => {
        if (mountedRef.current) {
          setTimeout(() => {
            if (mountedRef.current) {
              router.push("/");
            }
          }, 0);
        }
      });
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  const handleStartWorkout = (course: CourseWithWorkouts) => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        setSelectedCourse(course);
        setIsWorkoutModalOpen(true);
      }
    });
  };

  const handleCloseWorkoutModal = () => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        try {
          setIsWorkoutModalOpen(false);
          setSelectedCourse(null);

          setTimeout(() => {
            if (mountedRef.current) {
              loadCoursesData();
            }
          }, 500);
        } catch (error) {
          console.error(
            "[PROFILE PAGE] Ошибка при закрытии модального окна тренировки:",
            error
          );
        }
      }
    });
  };

  const handleDeleteCourse = (courseId: string) => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        setCourseToDelete(courseId);
        setIsDeleteConfirmModalOpen(true);
      }
    });
  };

  const handleConfirmDelete = async () => {
    if (!mountedRef.current || !courseToDelete) return;

    requestAnimationFrame(() => {
      if (mountedRef.current) {
        setIsDeleteConfirmModalOpen(false);
      }
    });

    try {
      await deleteUserCourse(courseToDelete);
      if (!mountedRef.current) return;


      try {
        await refreshUserData();
      } catch (refreshError) {
        console.error("Ошибка при обновлении данных пользователя:", refreshError);
      }

      // Обновляем список курсов
      const updatedCourses = courses.filter((c) => c._id !== courseToDelete);
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          setCourses(updatedCourses);
          setCourseToDelete(null);
          // Показываем модальное окно об успешном удалении
          setIsDeleteModalOpen(true);
        }
      });
    } catch (error) {
      // Обрабатываем ошибки удаления
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        // Если курс не был добавлен или уже удален - просто обновляем список
        if (
          errorMessage.includes("не был добавлен") ||
          errorMessage.includes("не найден") ||
          errorMessage.includes("not found") ||
          errorMessage.includes("not added")
        ) {
          // Курс уже удален или не был добавлен - обновляем данные пользователя и список
          try {
            await refreshUserData();
          } catch (refreshError) {
            console.error("Ошибка при обновлении данных пользователя:", refreshError);
          }
          const updatedCourses = courses.filter(
            (c) => c._id !== courseToDelete
          );
          requestAnimationFrame(() => {
            if (mountedRef.current) {
              setCourses(updatedCourses);
              setCourseToDelete(null);
            }
          });
        } else {
    
          console.error("Ошибка при удалении курса:", error);
          if (mountedRef.current) {
            setCourseToDelete(null);
          }
        }
      } else {
        console.error("Ошибка при удалении курса:", error);
        if (mountedRef.current) {
          setCourseToDelete(null);
        }
      }
    }
  };

  const handleCancelDelete = () => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        setIsDeleteConfirmModalOpen(false);
        setCourseToDelete(null);
      }
    });
  };

  const handleCloseDeleteModal = () => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        try {
          setIsDeleteModalOpen(false);
        } catch (error) {
          console.error(
            "[PROFILE PAGE] Ошибка при закрытии модального окна удаления:",
            error
          );
        }
      }
    });
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
      subtitle: "Описание тренировки",
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
                <button className={styles.logoutButton} onClick={handleLogout}>
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
                  onClick={() => {
                    if (!mountedRef.current) return;
                    requestAnimationFrame(() => {
                      if (mountedRef.current) {
                        router.push("/");
                      }
                    });
                  }}
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

                      <div className={styles.badgesContainer}>
                        <div className={styles.firstRow}>
                          {"durationInDays" in course && (
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

                          {"dailyDurationInMinutes" in course && (
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
                                {course.dailyDurationInMinutes?.to || 0}{" "}
                                мин/день
                              </span>
                            </div>
                          )}
                        </div>

                        {"difficulty" in course && (
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

                      <div className={styles.progressSection}>
                        <div className={styles.progressText}>
                          Прогресс {course.progress?.progressPercent || 0}%
                        </div>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{
                              width: `${course.progress?.progressPercent || 0}%`,
                            }}
                          />
                        </div>
                      </div>

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
      {isMounted && isDeleteConfirmModalOpen && (
        <DeleteConfirmModal
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
      {isMounted && isDeleteModalOpen && (
        <CourseDeletedModal
          onClose={handleCloseDeleteModal}
          autoCloseDelay={3000}
        />
      )}
      {isMounted && mountedRef.current && showScrollTop && (
        <button
          className={styles.scrollTopButton}
          onClick={handleScrollToTop}
          aria-label="Наверх"
        >
          Наверх ↑
        </button>
      )}
    </>
  );
}
