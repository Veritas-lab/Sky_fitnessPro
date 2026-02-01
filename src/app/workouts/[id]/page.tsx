"use client";

import { useState, useEffect, useRef, useLayoutEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ProgressModal from "../../components/modal/progressModal";
import SuccessModal from "../../components/modal/successModal";
import styles from "./workout.module.css";

const AuthHeader = dynamic(() => import("../../components/header/authHeader"), {
  ssr: false,
  loading: () => null,
});

const STORAGE_KEY = "sky_fitness_auth";

interface AuthData {
  isAuthenticated: boolean;
  userName: string;
  userEmail: string;
}

interface Exercise {
  _id: string;
  name: string;
  quantity: number;
}

interface Workout {
  _id: string;
  name: string;
  video: string;
  exercises: Exercise[];
  courseName?: string;
  workoutNumber?: number;
}

export default function WorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const [workoutId, setWorkoutId] = useState<string>("");
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [progress, setProgress] = useState<number[]>([]);
  const [userName, setUserName] = useState<string>("Пользователь");
  const [userEmail, setUserEmail] = useState<string>("");
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
    if (!mountedRef.current) return;

    if (typeof window !== "undefined") {
      const savedAuth = localStorage.getItem(STORAGE_KEY);
      if (savedAuth) {
        try {
          const authData: AuthData = JSON.parse(savedAuth);
          if (authData.isAuthenticated && authData.userName && authData.userEmail) {
            if (mountedRef.current) {
              setUserName(authData.userName);
              setUserEmail(authData.userEmail);
            }
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!mountedRef.current || !workoutId) return;

    let isCancelled = false;

    // TODO: Заменить на реальный API запрос
    // Mock data для верстки
    const timer = setTimeout(() => {
      if (mountedRef.current && !isCancelled) {
        // Пример данных тренировки
        const mockWorkout: Workout = {
          _id: workoutId,
          name: "Урок 1. Основные движения",
          video: "https://www.youtube.com/embed/gJPs7b8SpVw",
          courseName: "Йога",
          workoutNumber: 2,
          exercises: [
            { _id: "1", name: "Наклоны вперед", quantity: 15 },
            { _id: "2", name: "Наклоны назад", quantity: 10 },
            {
              _id: "3",
              name: "Поднятие ног, согнутых в коленях",
              quantity: 20,
            },
            { _id: "4", name: "Наклоны вперед", quantity: 15 },
            { _id: "5", name: "Наклоны назад", quantity: 10 },
            {
              _id: "6",
              name: "Поднятие ног, согнутых в коленях",
              quantity: 20,
            },
            { _id: "7", name: "Наклоны вперед", quantity: 15 },
            { _id: "8", name: "Наклоны назад", quantity: 10 },
            {
              _id: "9",
              name: "Поднятие ног, согнутых в коленях",
              quantity: 20,
            },
          ],
        };
        if (mountedRef.current && !isCancelled) {
          setWorkout(mockWorkout);
          setProgress(new Array(mockWorkout.exercises.length).fill(0));
          setIsLoading(false);
        }
      }
    }, 0);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [workoutId]);

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

  const handleSaveProgress = (newProgress: number[]) => {
    if (!mountedRef.current || !workout || typeof window === "undefined")
      return;
    try {
      setProgress(newProgress);
      // TODO: Реализовать сохранение прогресса через API
      console.log("Saving progress:", newProgress);
      // Показываем модальное окно успеха
      setIsSuccessModalOpen(true);
    } catch {
      // Игнорируем ошибки
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
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      router.push("/");
    }
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
      {isMounted && userName && userEmail && (
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
