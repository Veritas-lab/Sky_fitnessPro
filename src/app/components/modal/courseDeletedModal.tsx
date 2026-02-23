"use client";

import { useEffect, useRef } from "react";
import styles from "./courseDeletedModal.module.css";

interface CourseDeletedModalProps {
  onClose: () => void;
  autoCloseDelay?: number;
}

export default function CourseDeletedModal({
  onClose,
  autoCloseDelay = 3000,
}: CourseDeletedModalProps) {
  const mountedRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    mountedRef.current = true;

    if (autoCloseDelay > 0) {
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
          }
          rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            if (mountedRef.current) {
              try {
                onCloseRef.current();
              } catch (error) {
                console.error("Ошибка при закрытии модального окна:", error);
              }
            }
          });
        }
      }, autoCloseDelay);
    }

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [autoCloseDelay]);

  const handleClose = () => {
    if (!mountedRef.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (!mountedRef.current) return;
      try {
        onCloseRef.current();
      } catch (error) {
        console.error("Ошибка при закрытии модального окна:", error);
      }
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.textContainer}>
          <p className={styles.textLine1}>Курс удален.</p>
          <p className={styles.textLine2}>Прогресс утерян.</p>
        </div>
        <div className={styles.iconContainer}>
          <svg
            className={styles.icon}
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
