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
  const onCloseRef = useRef<() => void>(() => {});
  const onLoginClickRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (onClose && typeof onClose === "function") {
      onCloseRef.current = onClose;
    }
    if (onLoginClick && typeof onLoginClick === "function") {
      onLoginClickRef.current = onLoginClick;
    }
  }, [onClose, onLoginClick]);

  useEffect(() => {
    mountedRef.current = true;

    if (autoCloseDelay > 0) {
      const timeoutId = setTimeout(() => {
        if (mountedRef.current && timeoutRef.current === timeoutId) {
          mountedRef.current = false;
          timeoutRef.current = null;
          try {
            if (
              onCloseRef.current &&
              typeof onCloseRef.current === "function"
            ) {
              onCloseRef.current();
            }
          } catch {}
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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (mountedRef.current) {
      mountedRef.current = false;
      try {
        if (onCloseRef.current && typeof onCloseRef.current === "function") {
          onCloseRef.current();
        }
      } catch {}
    }
  };

  const handleLoginClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (mountedRef.current) {
      mountedRef.current = false;
      try {
        if (onCloseRef.current && typeof onCloseRef.current === "function") {
          onCloseRef.current();
        }
        if (
          onLoginClickRef.current &&
          typeof onLoginClickRef.current === "function"
        ) {
          onLoginClickRef.current();
        }
      } catch {}
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeButtonX}
          onClick={handleClose}
          aria-label="Закрыть"
        >
          ×
        </button>
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
        <button
          className={styles.loginButton}
          onClick={handleLoginClick}
          type="button"
        >
          Войти
        </button>
      </div>
    </div>
  );
}
