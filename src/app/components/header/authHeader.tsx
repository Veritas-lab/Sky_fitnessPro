"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ProfileModal from "../modal/profileModal";
import styles from "./authHeader.module.css";

interface AuthHeaderProps {
  userName: string;
  userEmail?: string;
  onLogout?: () => void;
}

export default function AuthHeader({
  userName,
  userEmail,
  onLogout,
}: AuthHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleArrowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (mountedRef.current) {
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          setIsModalOpen(true);
        }
      });
    }
  };

  const handleCloseModal = () => {
    if (mountedRef.current) {
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          setIsModalOpen(false);
        }
      });
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.leftSection}>
          <Link href="/" className={styles.logoLink}>
            <Image
              src="/img/logo.svg"
              alt="Sky Fitness Pro"
              width={220}
              height={35}
              className={styles.logo}
            />
          </Link>
          <p className={styles.subtitle}>Онлайн-тренировки для занятий дома</p>
        </div>
        <div className={styles.profileBlock}>
          <Link href="/profile" className={styles.profileLink}>
            <Image
              src="/img/Profile.svg"
              alt="Profile"
              width={24}
              height={24}
              className={styles.profileIcon}
            />
            <span className={styles.userName}>{userName}</span>
          </Link>
          <button
            className={styles.arrowButton}
            onClick={handleArrowClick}
            aria-label="Открыть меню профиля"
          >
            <Image
              src="/img/strelka.svg"
              alt="Arrow"
              width={16}
              height={16}
              className={styles.arrowIcon}
            />
          </button>
        </div>
      </header>
      {mountedRef.current && isModalOpen && (
        <ProfileModal
          userName={userName}
          userEmail={userEmail || ""}
          onClose={handleCloseModal}
          onLogout={onLogout}
        />
      )}
    </>
  );
}
