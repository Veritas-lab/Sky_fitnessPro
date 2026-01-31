"use client";

import Image from "next/image";
import styles from "./authform.module.css";

interface AuthFormProps {
  onSwitchToRegister?: () => void;
}

export default function AuthForm({ onSwitchToRegister }: AuthFormProps) {
  return (
    <form className={styles.authForm}>
      <Image
        src="/img/logo.svg"
        alt="Sky Fitness Pro"
        width={220}
        height={35}
        className={styles.logo}
      />
      <div className={styles.formFrame}>
        <input type="text" placeholder="Логин" className={styles.inputField} />
        <input
          type="password"
          placeholder="Пароль"
          className={styles.inputField}
        />
      </div>
      <div className={styles.buttonFrame}>
        <button type="submit" className={styles.loginButton}>
          Войти
        </button>
        <button
          type="button"
          className={styles.registerButton}
          onClick={onSwitchToRegister}
        >
          Зарегистрироваться
        </button>
      </div>
    </form>
  );
}
