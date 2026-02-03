"use client";

import { useEffect, useRef } from "react";
import styles from "./courseAddModal.module.css";

interface CourseAddModalProps {
  type: "success" | "alreadyAdded" | "error";
  onClose: () => void;
  autoCloseDelay?: number;
}

export default function CourseAddModal({
  type,
  onClose,
  autoCloseDelay = 3000,
}: CourseAddModalProps) {
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

    if (autoCloseDelay > 0 && type !== "error") {
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
  }, [autoCloseDelay, type]);

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

  const getText = () => {
    switch (type) {
      case "success":
        return {
          line1: "Курс в твоём списке.",
          line2: "Можно начинать прямо сейчас!",
        };
      case "alreadyAdded":
        return {
          line1: "Курс уже был добавлен.",
          line2: "Ждём на тренировке!",
        };
      case "error":
        return {
          line1: "Упс! Курс не добавлен.",
          line2: "Проверьте интернет и попробуйте ещё раз.",
          line3: "Если не поможет — напишите нам!",
        };
      default:
        return { line1: "", line2: "" };
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#bcec30";
      case "alreadyAdded":
        return "#bcec30";
      case "error":
        return "#ff6b6b";
      default:
        return "#bcec30";
    }
  };

  const text = getText();
  const iconColor = getIconColor();

  return (
    <div
      className={styles.modalOverlay}
      onClick={type === "error" ? handleClose : undefined}
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeButtonX}
          onClick={handleClose}
          aria-label="Закрыть"
        >
          ×
        </button>
        <div className={styles.textContainer}>
          <p className={styles.textLine1}>{text.line1}</p>
          <p className={styles.textLine2}>{text.line2}</p>
          {text.line3 && <p className={styles.textLine3}>{text.line3}</p>}
        </div>
        {type !== "error" && (
          <div className={styles.iconContainer}>
            <svg
              className={styles.icon}
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="24" cy="24" r="24" fill={iconColor} />
              <path
                d="M14 24L20 30L34 16"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
        {type === "error" && (
          <div className={styles.iconContainer}>
            <svg
              className={styles.icon}
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="24" cy="24" r="24" fill={iconColor} />
              <path
                d="M18 18L30 30M30 18L18 30"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
        {type === "error" && (
          <button className={styles.closeButton} onClick={handleClose}>
            Закрыть
          </button>
        )}
      </div>
    </div>
  );
}
