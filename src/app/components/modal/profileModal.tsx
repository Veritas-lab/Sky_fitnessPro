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
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const handleProfileClick = () => {
    if (!mountedRef.current) return;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (!mountedRef.current) return;
      try {
        onClose();
        router.push("/profile");
      } catch {}
    });
  };

  const handleLogout = () => {
    if (!mountedRef.current) return;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (!mountedRef.current) return;
      try {
        if (onLogout) {
          onLogout();
        }
        onClose();
      } catch {}
    });
  };

  const handleClose = () => {
    if (!mountedRef.current) return;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (!mountedRef.current) return;
      try {
        onClose();
      } catch {}
    });
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
