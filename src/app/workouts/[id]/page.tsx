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
  const searchParams = useSearchParams(); // ✅ Получаем query параметры
  const router = useRouter();
  const { 
    isAuthenticated, 
    userName, 
    userEmail, 
    logout,
    isLoading: authLoading // ✅ Добавляем состояние загрузки авторизации
  } = useAuth();
  
  const [workoutId, setWorkoutId] = useState("");
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

  // ✅ Исправленный эффект загрузки данных
  useEffect(() => {
    // Ждём окончания загрузки авторизации
    if (authLoading) {
      console.log('[WORKOUT PAGE] Ожидание завершения загрузки авторизации');
      return;
    }

    // Перенаправляем неавторизованных пользователей
    if (!isAuthenticated) {
      console.log('[WORKOUT PAGE] Пользователь не авторизован, перенаправление на /login');
      router.push("/login");
      return;
    }

    // Загружаем данные только если есть workoutId
    if (!mountedRef.current || !workoutId) {
      console.log('[WORKOUT PAGE] Нет workoutId, пропускаем загрузку');
      return;
    }

    const loadWorkoutData = async (): Promise<void> => {
      console.log('[WORKOUT PAGE] Запуск загрузки данных тренировки:', workoutId);
      if (!mountedRef.current) return;
      setIsLoading(true);

      try {
        // ✅ Получаем courseId из query параметров
        const courseId = searchParams.get("courseId");
        console.log('[WORKOUT PAGE] Course ID из URL:', courseId);

        // Загружаем данные тренировки
        const workoutData = (await getWorkoutById(workoutId)) as Workout;
        if (!mountedRef.current) return;

        console.log('[WORKOUT PAGE] Данные тренировки получены:', workoutData);

        // Инициализируем прогресс
        let savedProgress = new Array(workoutData.exercises?.length || 0).fill(0);

        // Загружаем прогресс, если есть courseId
        if (courseId && workoutData.exercises) {
          try {
            const workoutProgress = await getWorkoutProgress(courseId, workoutId);
            console.log('[WORKOUT PAGE] Прогресс тренировки:', workoutProgress);
            
            if (
              workoutProgress.progressData &&
              workoutProgress.progressData.length === workoutData.exercises.length
            ) {
              savedProgress = workoutProgress.progressData.map((val, idx) => {
                const maxVal = workoutData.exercises[idx]?.quantity || 0;
                return Math.max(0, Math.min(val, maxVal));
              });
            }
          } catch (progressError) {
            console.warn('[WORKOUT PAGE] Ошибка загрузки прогресса:', progressError);
          }
        }

        if (mountedRef.current) {
          setWorkout(workoutData);
          setProgress(savedProgress);
          setIsLoading(false);
          console.log('[WORKOUT PAGE] Данные успешно загружены');
        }
      } catch (error) {
        console.error('[WORKOUT PAGE] Ошибка загрузки тренировки:', error);
        if (mountedRef.current) {
          setIsLoading(false);
          
          // Показываем ошибку пользователю
          if (error instanceof Error) {
            alert(`Ошибка загрузки тренировки: ${error.message}`);
          }
          
          // Возвращаем на предыдущую страницу
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

  // ... остальные функции без изменений (handleOpenProgressModal, handleCloseProgressModal и т.д.) ...

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
            <div className={styles.loading}>Загрузка тренировки...</div>
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
              alert("Не удалось сохранить прогресс: отсутствует информация о курсе");
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