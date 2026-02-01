"use client";

import styles from "./deleteConfirmModal.module.css";

interface DeleteConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
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
          <button className={styles.confirmButton} onClick={onConfirm}>
            Да
          </button>
          <button className={styles.cancelButton} onClick={onCancel}>
            Нет
          </button>
        </div>
      </div>
    </div>
  );
}
