"use client";
import { useState, useEffect, useRef, useLayoutEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import ProgressModal from "../../components/modal/progressModal";
import SuccessModal from "../../components/modal/successModal";
import {
  getWorkoutById,
  getWorkoutProgress,
  saveWorkoutProgress,
} from "../../services/courses/coursesApi";
import { Workout as BaseWorkout } from "@/types/shared";
import { useAuth } from "@/context/AuthContext";
import { normalizeVideoUrl } from "@/utils/videoUtils";
import styles from "./workout.module.css";

const AuthHeader = dynamic(() => import("../../components/header/authHeader"), {
  ssr: false,
  loading: () => null,
});

interface Workout extends BaseWorkout {
  courseName?: string;
  workoutNumber?: number;
  courseId?: string;
}

export default function WorkoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    isAuthenticated,
    userName,
    userEmail,
    logout,
    isLoading: authLoading,
  } = useAuth();

  const [workoutId, setWorkoutId] = useState("");
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [progress, setProgress] = useState<number[]>([]);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const mountedRef = useRef(false);

  useLayoutEffect(() => {
    mountedRef.current = true;
    setIsMounted(true);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (params?.id && typeof params.id === "string") {
      setWorkoutId(params.id);
    }
  }, [params]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    if (!mountedRef.current || !workoutId) {
      return;
    }

    const loadWorkoutData = async (): Promise<void> => {
      if (!mountedRef.current) return;
      setIsLoading(true);

      try {
        const courseId = searchParams.get("courseId");

        const workoutData = (await getWorkoutById(workoutId)) as Workout;
        if (!mountedRef.current) return;

        if (!Array.isArray(workoutData.exercises)) {
          workoutData.exercises = [];
        }

        let savedProgress = new Array(workoutData.exercises?.length || 0).fill(
          0
        );

        if (courseId && workoutData.exercises) {
          try {
            const workoutProgress = await getWorkoutProgress(
              courseId,
              workoutId
            );

            if (
              workoutProgress.progressData &&
              workoutProgress.progressData.length ===
                workoutData.exercises.length
            ) {
              savedProgress = workoutProgress.progressData.map((val, idx) => {
                const maxVal = workoutData.exercises[idx]?.quantity || 0;
                return Math.max(0, Math.min(val, maxVal));
              });
            }
          } catch (progressError) {
            console.error("Ошибка при загрузке прогресса:", progressError);
          }
        }

        if (mountedRef.current) {
          setWorkout(workoutData);
          setProgress(savedProgress);
          setVideoError(false);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("[WORKOUT PAGE] Ошибка загрузки тренировки:", error);
        if (mountedRef.current) {
          setIsLoading(false);

          const errorMessage =
            error instanceof Error
              ? error.message
              : typeof error === "string"
                ? error
                : "Неизвестная ошибка";
          alert(`Ошибка загрузки тренировки: ${errorMessage}`);

          setTimeout(() => {
            if (mountedRef.current) {
              router.back();
            }
          }, 2000);
        }
      }
    };

    loadWorkoutData();
  }, [workoutId, isAuthenticated, authLoading, router, searchParams]);

  const handleLogout = () => {
    if (!mountedRef.current) return;
    logout();
    router.push("/");
  };

  const getExerciseProgress = (index: number): number => {
    if (
      !mountedRef.current ||
      !workout ||
      !workout.exercises ||
      !workout.exercises[index] ||
      workout.exercises[index].quantity === 0
    )
      return 0;

    const currentProgress = progress[index] || 0;
    return Math.round(
      (currentProgress / workout.exercises[index].quantity) * 100
    );
  };

  return (
    <>
      {isMounted && isAuthenticated && userName && userEmail && (
        <Suspense fallback={null}>
          <AuthHeader
            userName={userName}
            userEmail={userEmail}
            onLogout={handleLogout}
          />
        </Suspense>
      )}

      <main className={styles.main}>
        {isLoading ? (
          <div className={styles.workoutContainer}>
            {/* Скелетон заголовка */}
            <div className={styles.skeletonTitle} />

            {/* Скелетон видео */}
            <div className={styles.videoSection}>
              <div className={styles.skeletonVideo} />
            </div>

            {/* Скелетон секции упражнений */}
            <div className={styles.exercisesSection}>
              <div className={styles.skeletonExercisesTitle} />
              <div className={styles.exercisesList}>
                {[1, 2, 3, 4, 5].map((index) => (
                  <div key={index} className={styles.exerciseItem}>
                    <div className={styles.skeletonExerciseName} />
                    <div className={styles.progressBar}>
                      <div className={styles.skeletonProgressBar} />
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.actions}>
                <div className={styles.skeletonButton} />
              </div>
            </div>
          </div>
        ) : !workout ? (
          <div className={styles.container}>
            <div className={styles.error}>Тренировка не найдена</div>
          </div>
        ) : (
          <div className={styles.workoutContainer}>
            <h1 className={styles.title}>
              {workout.courseName || workout.name || "Тренировка"}
            </h1>

            {/* Видео секция */}
            {(() => {
              if (!workout.video || !workout.video.trim() || videoError) {
                return (
                  <div className={styles.videoSection}>
                    <div className={styles.videoWrapper}>
                      <div className={styles.noVideoMessage}>
                        {videoError
                          ? "Ошибка загрузки видео. Пожалуйста, проверьте подключение к интернету или попробуйте позже."
                          : "Видео для этой тренировки недоступно"}
                      </div>
                    </div>
                  </div>
                );
              }

              const normalizedUrl = normalizeVideoUrl(workout.video);
              const isValidYouTubeUrl =
                normalizedUrl && normalizedUrl.includes("youtube.com/embed/");

              if (!isValidYouTubeUrl) {
                return (
                  <div className={styles.videoSection}>
                    <div className={styles.videoWrapper}>
                      <div className={styles.noVideoMessage}>
                        Некорректный URL видео. Поддерживаются только YouTube
                        видео.
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className={styles.videoSection}>
                  <div className={styles.videoWrapper}>
                    <iframe
                      src={normalizedUrl}
                      title={workout.name || "Видео тренировки"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      className={styles.video}
                      frameBorder="0"
                      loading="lazy"
                      onLoad={() => {
                        setVideoError(false);
                      }}
                      onError={() => {
                        // onError для iframe может не работать из-за политики безопасности браузера
                        // Используем альтернативный подход через проверку загрузки
                        console.error(
                          "[WORKOUT PAGE] Ошибка загрузки видео:",
                          workout.video
                        );
                        setVideoError(true);
                      }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Упражнения секция */}
            <div className={styles.exercisesSection}>
              <h2 className={styles.exercisesTitle}>
                Упражнения тренировки {workout.workoutNumber || 1}
              </h2>
              <div className={styles.exercisesList}>
                {workout.exercises &&
                Array.isArray(workout.exercises) &&
                workout.exercises.length > 0 ? (
                  workout.exercises
                    .filter((exercise) => {
                      return exercise && exercise.name && exercise.name.trim();
                    })
                    .map((exercise, index) => {
                      const originalIndex =
                        workout.exercises?.indexOf(exercise) ?? index;
                      return (
                        <div
                          key={exercise._id || `exercise-${originalIndex}`}
                          className={styles.exerciseItem}
                        >
                          <span className={styles.exerciseName}>
                            {exercise.name} {getExerciseProgress(originalIndex)}
                            %
                          </span>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{
                                width: `${getExerciseProgress(originalIndex)}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className={styles.noExercisesMessage}>
                    {!workout.exercises ||
                    (Array.isArray(workout.exercises) &&
                      workout.exercises.length === 0)
                      ? "Упражнения для этой тренировки отсутствуют. Эта тренировка содержит только видео-материал."
                      : "Загрузка упражнений..."}
                  </div>
                )}
              </div>

              {/* Кнопка заполнения прогресса */}
              <div className={styles.actions}>
                <button
                  className={styles.saveButton}
                  onClick={() => setIsProgressModalOpen(true)}
                >
                  Заполнить свой прогресс
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {isProgressModalOpen && workout && (
        <ProgressModal
          exercises={workout.exercises}
          initialProgress={progress}
          onSave={async (newProgress) => {
            if (!searchParams.get("courseId") || !workoutId) {
              alert(
                "Не удалось сохранить прогресс: отсутствует информация о курсе"
              );
              return;
            }

            await saveWorkoutProgress(
              searchParams.get("courseId")!,
              workoutId,
              newProgress
            );
            setProgress(newProgress);
            setIsProgressModalOpen(false);
            setIsSuccessModalOpen(true);
          }}
          onClose={() => setIsProgressModalOpen(false)}
        />
      )}

      {isSuccessModalOpen && (
        <SuccessModal
          onClose={() => setIsSuccessModalOpen(false)}
          autoCloseDelay={2000}
        />
      )}
    </>
  );
}
