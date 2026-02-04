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

/**
 * Нормализует URL видео YouTube для использования в iframe
 * Преобразует обычный YouTube URL в embed формат, если необходимо
 * Добавляет необходимые параметры для обхода ограничений безопасности
 */
function normalizeVideoUrl(url: string): string {
  if (!url || !url.trim()) {
    return url;
  }

  const trimmedUrl = url.trim();

  // Извлекаем ID видео из различных форматов YouTube URL
  let videoId: string | null = null;

  // Формат: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmedUrl.match(/[?&]v=([^&]+)/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }

  // Формат: https://youtu.be/VIDEO_ID
  const shortMatch = trimmedUrl.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) {
    videoId = shortMatch[1];
  }

  // Формат: https://www.youtube.com/embed/VIDEO_ID
  const embedMatch = trimmedUrl.match(/embed\/([^?&]+)/);
  if (embedMatch) {
    videoId = embedMatch[1];
  }

  // Если нашли ID, создаем embed URL с необходимыми параметрами
  if (videoId) {
    // Очищаем videoId от лишних символов
    const cleanVideoId = videoId.split('&')[0].split('?')[0];
    
    // Получаем origin для параметра origin
    const origin = typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost:3000';
    
    // Добавляем параметры для обхода ограничений безопасности
    const params = new URLSearchParams({
      'enablejsapi': '1',
      'origin': origin,
      'rel': '0', // Отключаем показ связанных видео
      'modestbranding': '1', // Уменьшаем брендинг YouTube
    });
    
    return `https://www.youtube.com/embed/${cleanVideoId}?${params.toString()}`;
  }

  // Если уже embed URL, добавляем параметры если их нет
  if (trimmedUrl.includes('youtube.com/embed/')) {
    try {
      const urlObj = new URL(trimmedUrl);
      const origin = typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost:3000';
      
      urlObj.searchParams.set('enablejsapi', '1');
      urlObj.searchParams.set('origin', origin);
      urlObj.searchParams.set('rel', '0');
      urlObj.searchParams.set('modestbranding', '1');
      return urlObj.toString();
    } catch (e) {
      // Если не удалось распарсить URL, просто добавляем параметры вручную
      const separator = trimmedUrl.includes('?') ? '&' : '?';
      const origin = typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost:3000';
      return `${trimmedUrl}${separator}enablejsapi=1&origin=${encodeURIComponent(origin)}&rel=0&modestbranding=1`;
    }
  }

  // Если не удалось распознать формат, возвращаем исходный URL
  return trimmedUrl;
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
    isLoading: authLoading 
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


  useEffect(() => {

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
       
        const courseId = searchParams.get("courseId");
        console.log('[WORKOUT PAGE] Course ID из URL:', courseId);

    
        const workoutData = (await getWorkoutById(workoutId)) as Workout;
        if (!mountedRef.current) return;

        console.log('[WORKOUT PAGE] Данные тренировки получены:', workoutData);
        console.log('[WORKOUT PAGE] Детали тренировки:', {
          id: workoutData._id,
          name: workoutData.name,
          video: workoutData.video,
          hasVideo: !!workoutData.video,
          exercisesCount: workoutData.exercises?.length || 0,
          exercises: workoutData.exercises?.map((ex, idx) => ({
            index: idx,
            id: ex._id,
            name: ex.name,
            quantity: ex.quantity
          })) || [],
          exercisesArray: workoutData.exercises,
          exercisesType: Array.isArray(workoutData.exercises) ? 'array' : typeof workoutData.exercises
        });
        
        // Проверяем, что exercises - это массив
        if (!Array.isArray(workoutData.exercises)) {
          console.warn('[WORKOUT PAGE] exercises не является массивом, преобразуем:', workoutData.exercises);
          workoutData.exercises = [];
        }

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
          console.log('[WORKOUT PAGE] Данные тренировки перед установкой:', {
            workoutData,
            exercisesCount: workoutData.exercises?.length || 0,
            hasVideo: !!workoutData.video,
            exercises: workoutData.exercises
          });
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
              {workout.courseName || workout.name || 'Тренировка'}
            </h1>
            
            {/* Видео секция */}
            {workout.video && workout.video.trim() ? (
              <div className={styles.videoSection}>
                <div className={styles.videoWrapper}>
                  <iframe
                    src={normalizeVideoUrl(workout.video)}
                    title={workout.name || 'Видео тренировки'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    className={styles.video}
                    onError={(e) => {
                      console.error('[WORKOUT PAGE] Ошибка загрузки видео:', workout.video, e);
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className={styles.videoSection}>
                <div className={styles.videoWrapper}>
                  <div className={styles.noVideoMessage}>
                    Видео для этой тренировки недоступно
                  </div>
                </div>
              </div>
            )}

            {/* Упражнения секция */}
            <div className={styles.exercisesSection}>
              <h2 className={styles.exercisesTitle}>
                Упражнения тренировки {workout.workoutNumber || 1}
              </h2>
              <div className={styles.exercisesList}>
                {workout.exercises && Array.isArray(workout.exercises) && workout.exercises.length > 0 ? (
                  workout.exercises
                    .filter((exercise) => {
                      const isValid = exercise && exercise.name && exercise.name.trim();
                      if (!isValid) {
                        console.warn('[WORKOUT PAGE] Фильтрация: пропущено невалидное упражнение:', exercise);
                      }
                      return isValid;
                    })
                    .map((exercise, index) => {
                      const originalIndex = workout.exercises?.indexOf(exercise) ?? index;
                      return (
                        <div
                          key={exercise._id || `exercise-${originalIndex}`}
                          className={styles.exerciseItem}
                        >
                          <span className={styles.exerciseName}>
                            {exercise.name} {getExerciseProgress(originalIndex)}%
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
                    {!workout.exercises || (Array.isArray(workout.exercises) && workout.exercises.length === 0)
                      ? 'Упражнения для этой тренировки отсутствуют. Эта тренировка содержит только видео-материал.'
                      : 'Загрузка упражнений...'}
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