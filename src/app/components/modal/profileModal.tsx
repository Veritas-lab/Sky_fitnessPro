"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./profileModal.module.css";

interface ProfileModalProps {
  userName: string;
  userEmail: string;
  onClose: () => void;
  onLogout?: () => void;
}

export default function ProfileModal({
  userName,
  userEmail,
  onClose,
  onLogout,
}: ProfileModalProps) {
  const router = useRouter();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleProfileClick = () => {
    if (!mountedRef.current) return;
    mountedRef.current = false;
    try {
      onClose();
      router.push("/profile");
    } catch {
      // Игнорируем ошибки
    }
  };

  const handleLogout = () => {
    if (!mountedRef.current) return;
    mountedRef.current = false;
    try {
      if (onLogout) {
        onLogout();
      }
      onClose();
    } catch {
      // Игнорируем ошибки
    }
  };

  const handleClose = () => {
    if (!mountedRef.current) return;
    mountedRef.current = false;
    try {
      onClose();
    } catch {
      // Игнорируем ошибки при закрытии
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose}>
          ×
        </button>
        <h2 className={styles.userName}>{userName}</h2>
        <p className={styles.userEmail}>{userEmail}</p>
        <div className={styles.buttonsContainer}>
          <button className={styles.profileButton} onClick={handleProfileClick}>
            Мой профиль
          </button>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
