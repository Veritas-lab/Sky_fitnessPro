"use client";

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

  const handleProfileClick = () => {
    onClose();
    router.push("/profile");
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
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
