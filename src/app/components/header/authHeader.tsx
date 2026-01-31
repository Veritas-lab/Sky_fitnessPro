"use client";

import { useState } from "react";
import Link from "next/link";
import ProfileModal from "../modal/profileModal";
import styles from "./authHeader.module.css";

interface AuthHeaderProps {
  userName: string;
  userEmail?: string;
  onLogout?: () => void;
}

export default function AuthHeader({
  userName,
  userEmail = "sergey.petrov96@mail.ru",
  onLogout,
}: AuthHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleArrowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <header className={styles.header}>
        <Link href="/" className={styles.logoLink}>
          <img
            src="/img/logo.svg"
            alt="Sky Fitness Pro"
            className={styles.logo}
          />
        </Link>
        <div className={styles.profileBlock}>
          <Link href="/profile" className={styles.profileLink}>
            <img
              src="/img/Profile.svg"
              alt="Profile"
              className={styles.profileIcon}
            />
            <span className={styles.userName}>{userName}</span>
          </Link>
          <button
            className={styles.arrowButton}
            onClick={handleArrowClick}
            aria-label="Открыть меню профиля"
          >
            <img src="/img/strelka.svg" alt="Arrow" className={styles.arrowIcon} />
          </button>
        </div>
      </header>
      {isModalOpen && (
        <ProfileModal
          userName={userName}
          userEmail={userEmail}
          onClose={handleCloseModal}
          onLogout={onLogout}
        />
      )}
    </>
  );
}
