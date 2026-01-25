import Link from "next/link";
import styles from "./header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <Link href="/" className={styles.logoLink}>
          <img
            src="/img/logo.svg"
            alt="Sky Fitness Pro"
            className={styles.logo}
          />
        </Link>
        <p className={styles.subtitle}>Онлайн-тренировки для занятий дома</p>
      </div>
      <button className={styles.loginButton}>Войти</button>
    </header>
  );
}
