"use client";

import { useState, useEffect, useRef, useLayoutEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ProgressModal from "../../components/modal/progressModal";
import SuccessModal from "../../components/modal/successModal";
import {
  getWorkoutById,
  getWorkoutProgress,
  saveWorkoutProgress,
} from "../../services/courses/coursesApi";
import { Workout as BaseWorkout } from "@/types/shared";
import { useAuth } from "@/contexts/AuthContext";
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
  const router = useRouter();
  const { isAuthenticated, userName, userEmail, logout } = useAuth();
  const [workoutId, setWorkoutId] = useState<string>("");
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [progress, setProgress] = useState<number[]>([]);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
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
    if (!mountedRef.current || !workoutId) return;

    const loadWorkoutData = async (): Promise<void> => {
      if (!mountedRef.current) return;
      setIsLoading(true);

      if (!isAuthenticated) {
        if (mountedRef.current) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const workoutData = (await getWorkoutById(workoutId)) as Workout;
        if (!mountedRef.current) return;

        const workout: Workout = workoutData;

        let savedProgress = new Array(workoutData.exercises.length).fill(0);

        try {
          const urlParams = new URLSearchParams(window.location.search);
          const courseId = urlParams.get("courseId");

          if (courseId) {
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
            } catch {}
          }
        } catch {}

        if (mountedRef.current) {
          setWorkout(workout);
          setProgress(savedProgress);
          setIsLoading(false);
        }
      } catch {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadWorkoutData();
  }, [workoutId, isAuthenticated, router]);

  const handleOpenProgressModal = () => {
    if (!mountedRef.current || !workout) return;
    setIsProgressModalOpen(true);
  };

  const handleCloseProgressModal = () => {
    if (!mountedRef.current) return;
    try {
      setIsProgressModalOpen(false);
    } catch {
      // Игнорируем ошибки
    }
  };

  const handleSaveProgress = async (newProgress: number[]): Promise<void> => {
    if (
      !mountedRef.current ||
      !workout ||
      typeof window === "undefined" ||
      !workoutId
    ) {
      return;
    }

    if (!Array.isArray(newProgress) || newProgress.length === 0) {
      return;
    }

    if (!isAuthenticated) {
      setIsSuccessModalOpen(true);
      return;
    }

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const courseId = urlParams.get("courseId");

      if (!courseId) {
        setIsSuccessModalOpen(true);
        return;
      }

      await saveWorkoutProgress(courseId, workoutId, newProgress);

      if (mountedRef.current) {
        setProgress(newProgress);
        setIsSuccessModalOpen(true);
      }
    } catch {
      if (mountedRef.current) {
        setIsSuccessModalOpen(true);
      }
    }
  };

  const handleCloseSuccessModal = () => {
    if (!mountedRef.current) return;
    try {
      setIsSuccessModalOpen(false);
    } catch {
      // Игнорируем ошибки
    }
  };

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
          <div className={styles.container}>
            <div className={styles.loading}>Загрузка...</div>
          </div>
        ) : !workout ? (
          <div className={styles.container}>
            <div className={styles.error}>Тренировка не найдена</div>
          </div>
        ) : (
          <div className={styles.workoutContainer}>
            <h1 className={styles.title}>
              {workout.courseName || workout.name}
            </h1>

            {/* Видео секция */}
            {workout.video && (
              <div className={styles.videoSection}>
                <div className={styles.videoWrapper}>
                  <iframe
                    src={workout.video}
                    title={workout.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className={styles.video}
                  />
                </div>
              </div>
            )}

            {/* Упражнения секция */}
            <div className={styles.exercisesSection}>
              <h2 className={styles.exercisesTitle}>
                Упражнения тренировки {workout.workoutNumber || 1}
              </h2>
              <div className={styles.exercisesList}>
                {workout.exercises && workout.exercises.length > 0
                  ? workout.exercises.map((exercise, index) => (
                      <div
                        key={exercise._id || index}
                        className={styles.exerciseItem}
                      >
                        <span className={styles.exerciseName}>
                          {exercise.name} {getExerciseProgress(index)}%
                        </span>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{
                              width: `${getExerciseProgress(index)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  : null}
              </div>

              {/* Кнопка заполнения прогресса */}
              <div className={styles.actions}>
                <button
                  className={styles.saveButton}
                  onClick={handleOpenProgressModal}
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
          onSave={handleSaveProgress}
          onClose={handleCloseProgressModal}
        />
      )}
      {isSuccessModalOpen && (
        <SuccessModal onClose={handleCloseSuccessModal} autoCloseDelay={2000} />
      )}
    </>
  );
}
