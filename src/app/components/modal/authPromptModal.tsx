"use client";

import { useEffect, useRef } from "react";
import styles from "./authPromptModal.module.css";

interface AuthPromptModalProps {
  onClose: () => void;
  onLoginClick: () => void;
  autoCloseDelay?: number;
}

export default function AuthPromptModal({
  onClose,
  onLoginClick,
  autoCloseDelay = 5000,
}: AuthPromptModalProps) {
  const mountedRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    mountedRef.current = true;

    if (autoCloseDelay > 0) {
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          mountedRef.current = false;
          requestAnimationFrame(() => {
            try {
              onCloseRef.current();
            } catch {
              // Игнорируем ошибки при закрытии
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
    };
  }, [autoCloseDelay]);

  const handleClose = () => {
    if (!mountedRef.current) return;
    mountedRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    requestAnimationFrame(() => {
      try {
        onClose();
      } catch {
        // Игнорируем ошибки при закрытии
      }
    });
  };

  const handleLoginClick = () => {
    if (!mountedRef.current) return;
    mountedRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    requestAnimationFrame(() => {
      try {
        onClose();
        onLoginClick();
      } catch {
        // Игнорируем ошибки при закрытии
      }
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.textContainer}>
          <p className={styles.textLine1}>Тренировки ждут</p>
          <p className={styles.textLine2}>именно тебя.</p>
          <p className={styles.textLine3}>Войди и добавь свой курс!</p>
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
              d="M24 16V32M16 24H32"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
