"use client";

import { useEffect, useRef } from "react";
import styles from "./successModal.module.css";

interface SuccessModalProps {
  onClose: () => void;
  autoCloseDelay?: number; // Автоматическое закрытие через N миллисекунд
}

export default function SuccessModal({
  onClose,
  autoCloseDelay = 2000,
}: SuccessModalProps) {
  const mountedRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCloseRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (onClose && typeof onClose === "function") {
      onCloseRef.current = onClose;
    }
  }, [onClose]);

  useEffect(() => {
    mountedRef.current = true;

    if (autoCloseDelay > 0) {
      const timeoutId = setTimeout(() => {
        if (mountedRef.current && timeoutRef.current === timeoutId) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          requestAnimationFrame(() => {
            if (mountedRef.current) {
              try {
                if (
                  onCloseRef.current &&
                  typeof onCloseRef.current === "function"
                ) {
                  onCloseRef.current();
                }
              } catch (error) {
                console.error("Ошибка при закрытии модального окна:", error);
              }
            }
          });
        }
      }, autoCloseDelay);
      timeoutRef.current = timeoutId;
    }

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [autoCloseDelay]);

  const handleClose = () => {
    if (!mountedRef.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    requestAnimationFrame(() => {
      if (!mountedRef.current) return;
      try {
        if (onCloseRef.current && typeof onCloseRef.current === "function") {
          onCloseRef.current();
        }
      } catch (error) {
        console.error("Ошибка при закрытии модального окна:", error);
      }
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.textContainer}>
          <p className={styles.textLine1}>Ваш прогресс</p>
          <p className={styles.textLine2}>засчитан!</p>
        </div>
        <div className={styles.checkmarkContainer}>
          <svg
            className={styles.checkmark}
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="24" cy="24" r="24" fill="#bcec30" />
            <path
              d="M14 24L20 30L34 16"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
