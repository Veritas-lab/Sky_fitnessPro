"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./workoutSelectionModal.module.css";

interface Workout {
  id: string;
  name: string;
  subtitle: string;
  day: number;
}

interface WorkoutSelectionModalProps {
  courseName: string;
  courseId: string; // ✅ Добавлен пропс
  workouts: Workout[];
  onClose: () => void;
}

export default function WorkoutSelectionModal({
  courseName: _courseName,
  courseId, // ✅ Получаем courseId
  workouts,
  onClose,
}: WorkoutSelectionModalProps) {
  const router = useRouter();
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleToggleWorkout = (workoutId: string) => {
    if (!mountedRef.current) return;
    setSelectedWorkouts((prev) =>
      prev.includes(workoutId)
        ? prev.filter((id) => id !== workoutId)
        : [...prev, workoutId]
    );
  };

  const handleStart = () => {
    if (
      !mountedRef.current ||
      selectedWorkouts.length === 0 ||
      typeof window === "undefined"
    )
      return;
    
    const wasMounted = mountedRef.current;
    mountedRef.current = false;
    
    if (wasMounted) {
      requestAnimationFrame(() => {
        try {
          // ✅ Добавляем courseId в query параметры
          router.push(`/workouts/${selectedWorkouts[0]}?courseId=${courseId}`);
          onClose();
        } catch {}
      });
    }
  };

  const handleClose = () => {
    if (!mountedRef.current) return;
    const wasMounted = mountedRef.current;
    mountedRef.current = false;
    
    if (wasMounted) {
      requestAnimationFrame(() => {
        try {
          onClose();
        } catch {}
      });
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose}>
          ×
        </button>
        <h2 className={styles.title}>Выберите тренировку</h2>
        <div className={styles.workoutsList}>
          {workouts.map((workout) => {
            const isSelected = selectedWorkouts.includes(workout.id);
            return (
              <div
                key={workout.id}
                className={styles.workoutItem}
                onClick={() => handleToggleWorkout(workout.id)}
              >
                <div
                  className={`${styles.checkbox} ${
                    isSelected ? styles.checkboxSelected : ""
                  }`}
                >
                  {isSelected && (
                    <svg
                      className={styles.checkmark}
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M1 6L4 9L11 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div className={styles.workoutInfo}>
                  <h3 className={styles.workoutName}>{workout.name}</h3>
                  <p className={styles.workoutSubtitle}>
                    {workout.subtitle} / {workout.day} день
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <button
          className={styles.startButton}
          onClick={handleStart}
          disabled={selectedWorkouts.length === 0}
        >
          Начать
        </button>
      </div>
    </div>
  );
}