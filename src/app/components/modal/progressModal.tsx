"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./progressModal.module.css";

interface Exercise {
  _id: string;
  name: string;
  quantity: number;
}

interface ProgressModalProps {
  exercises: Exercise[];
  initialProgress?: number[];
  onSave: (progress: number[]) => void;
  onClose: () => void;
}

export default function ProgressModal({
  exercises,
  initialProgress = [],
  onSave,
  onClose,
}: ProgressModalProps) {
  // Используем строки для input'ов, чтобы разрешить пустые значения во время ввода
  const [progressValues, setProgressValues] = useState<string[]>(() => {
    return initialProgress.length > 0
      ? initialProgress.map((val) => (val > 0 ? val.toString() : ""))
      : new Array(exercises.length).fill("");
  });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setProgressValues(
      initialProgress.length > 0
        ? initialProgress.map((val) => (val > 0 ? val.toString() : ""))
        : new Array(exercises.length).fill("")
    );
    return () => {
      mountedRef.current = false;
    };
  }, [exercises.length, initialProgress]);

  const handleProgressChange = (index: number, value: string) => {
    if (!mountedRef.current) return;

    // Разрешаем пустую строку или только цифры
    if (value === "" || /^\d+$/.test(value)) {
      const newValues = [...progressValues];
      newValues[index] = value;
      setProgressValues(newValues);
    }
  };

  const handleBlur = (index: number) => {
    if (!mountedRef.current) return;
    const value = progressValues[index];
    const numValue = parseInt(value) || 0;
    const maxValue = exercises[index]?.quantity || 0;
    const validatedValue = Math.max(0, Math.min(numValue, maxValue));

    const newValues = [...progressValues];
    newValues[index] = validatedValue > 0 ? validatedValue.toString() : "";
    setProgressValues(newValues);
  };

  const handleSave = () => {
    if (!mountedRef.current || typeof window === "undefined") return;
    try {
      // Преобразуем строковые значения в числа и валидируем их
      const numericProgress = progressValues.map((value, index) => {
        const numValue = parseInt(value) || 0;
        const maxValue = exercises[index]?.quantity || 0;
        return Math.max(0, Math.min(numValue, maxValue));
      });
      onSave(numericProgress);
      onClose();
    } catch {
      // Игнорируем ошибки
    }
  };

  const getExerciseQuestion = (exerciseName: string): string => {
    if (exerciseName.includes("наклоны вперед")) {
      return "Сколько раз вы сделали наклоны вперед?";
    }
    if (exerciseName.includes("наклоны назад")) {
      return "Сколько раз вы сделали наклоны назад?";
    }
    if (
      exerciseName.includes("поднятие ног") ||
      exerciseName.includes("согнутых в коленях")
    ) {
      return "Сколько раз вы сделали поднятие ног, согнутых в коленях?";
    }
    return `Сколько раз вы сделали ${exerciseName.toLowerCase()}?`;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2 className={styles.title}>Мой прогресс</h2>
        <div className={styles.exercisesList}>
          {exercises.map((exercise, index) => (
            <div key={exercise._id} className={styles.exerciseItem}>
              <label className={styles.question}>
                {getExerciseQuestion(exercise.name)}
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                min="0"
                max={exercise.quantity}
                value={progressValues[index] || ""}
                onChange={(e) => handleProgressChange(index, e.target.value)}
                onBlur={() => handleBlur(index)}
                className={styles.progressInput}
                placeholder="0"
              />
            </div>
          ))}
        </div>
        <button className={styles.saveButton} onClick={handleSave}>
          Сохранить
        </button>
      </div>
    </div>
  );
}
