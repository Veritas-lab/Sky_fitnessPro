"use client";

import { useState, useEffect, useRef, useLayoutEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import styles from "./workout.module.css";

const AuthHeader = dynamic(() => import("../../components/header/authHeader"), {
  ssr: false,
  loading: () => null,
});

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
  courseName?: string; // Название курса
  workoutNumber?: number; // Номер тренировки
}

export default function WorkoutPage() {
  const params = useParams();
  const [workoutId, setWorkoutId] = useState<string>("");
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [progress, setProgress] = useState<number[]>([]);
  const [userName, setUserName] = useState<string>("Пользователь");
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

    // TODO: Получить имя пользователя из API или localStorage
    // Mock data для верстки
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        setUserName("Сергей");
      }
    }, 0);

    return () => {
      clearTimeout(timer);
    };
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
            { _id: "3", name: "Поднятие ног, согнутых в коленях", quantity: 20 },
            { _id: "4", name: "Наклоны вперед", quantity: 15 },
            { _id: "5", name: "Наклоны назад", quantity: 10 },
            { _id: "6", name: "Поднятие ног, согнутых в коленях", quantity: 20 },
            { _id: "7", name: "Наклоны вперед", quantity: 15 },
            { _id: "8", name: "Наклоны назад", quantity: 10 },
            { _id: "9", name: "Поднятие ног, согнутых в коленях", quantity: 20 },
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

  const handleProgressChange = (index: number, value: number) => {
    if (!mountedRef.current) return;
    const newProgress = [...progress];
    newProgress[index] = Math.max(0, Math.min(value, workout?.exercises[index].quantity || 0));
    setProgress(newProgress);
  };

  const handleSaveProgress = () => {
    if (!mountedRef.current || !workout || typeof window === "undefined") return;
    try {
      // TODO: Реализовать сохранение прогресса через API
      console.log("Saving progress:", progress);
      alert("Прогресс сохранен!");
    } catch (error) {
      // Игнорируем ошибки
    }
  };

  const getExerciseProgress = (index: number): number => {
    if (!mountedRef.current || !workout || !workout.exercises || !workout.exercises[index] || workout.exercises[index].quantity === 0) return 0;
    const currentProgress = progress[index] || 0;
    return Math.round((currentProgress / workout.exercises[index].quantity) * 100);
  };

  return (
    <>
      {isMounted && userName && (
        <Suspense fallback={null}>
          <AuthHeader userName={userName} userEmail="sergey.petrov96@mail.ru" />
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
            <h1 className={styles.title}>{workout.courseName || workout.name}</h1>

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
                      <div key={exercise._id || index} className={styles.exerciseItem}>
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
                  onClick={handleSaveProgress}
                >
                  Заполнить свой прогресс
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
