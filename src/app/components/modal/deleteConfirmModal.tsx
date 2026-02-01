"use client";

import { useRef } from "react";
import styles from "./deleteConfirmModal.module.css";

interface DeleteConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const mountedRef = useRef(true);

  const handleConfirm = () => {
    if (!mountedRef.current) return;
    mountedRef.current = false;
    try {
      onConfirm();
    } catch {
      // Игнорируем ошибки
    }
  };

  const handleCancel = () => {
    if (!mountedRef.current) return;
    mountedRef.current = false;
    try {
      onCancel();
    } catch {
      // Игнорируем ошибки
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.textContainer}>
          <p className={styles.questionText}>
            Вы точно хотите удалить курс?
          </p>
          <p className={styles.warningText}>
            Прогресс будет утерян.
          </p>
        </div>
        <div className={styles.buttonsContainer}>
          <button className={styles.confirmButton} onClick={handleConfirm}>
            Да
          </button>
          <button className={styles.cancelButton} onClick={handleCancel}>
            Нет
          </button>
        </div>
      </div>
    </div>
  );
}
