"use client";

import Link from "next/link";
import styles from "./authHeader.module.css";

interface AuthHeaderProps {
  userName: string;
}

export default function AuthHeader({ userName }: AuthHeaderProps) {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logoLink}>
        <img
          src="/img/logo.svg"
          alt="Sky Fitness Pro"
          className={styles.logo}
        />
      </Link>
      <Link href="/profile" className={styles.profileBlock}>
        <img
          src="/img/Profile.svg"
          alt="Profile"
          className={styles.profileIcon}
        />
        <span className={styles.userName}>{userName}</span>
        <img
          src="/img/strelka.svg"
          alt="Arrow"
          className={styles.arrowIcon}
        />
      </Link>
    </header>
  );
}
