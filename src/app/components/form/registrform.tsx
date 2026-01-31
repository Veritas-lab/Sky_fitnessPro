"use client";

import Image from "next/image";
import styles from "./registrform.module.css";

interface RegistrFormProps {
  onSwitchToAuth: () => void;
}

export default function RegistrForm({ onSwitchToAuth }: RegistrFormProps) {
  return (
    <form className={styles.registrForm}>
      <Image
        src="/img/logo.svg"
        alt="Sky Fitness Pro"
        width={220}
        height={35}
        className={styles.logo}
      />
      <div className={styles.formFrame}>
        <input
          type="email"
          placeholder="Эл.почта"
          className={styles.inputField}
        />
        <input
          type="password"
          placeholder="Пароль"
          className={styles.inputField}
        />
        <input
          type="password"
          placeholder="Повторите пароль"
          className={styles.inputField}
        />
      </div>
      <div className={styles.buttonFrame}>
        <button type="submit" className={styles.registerButton}>
          Зарегистрироваться
        </button>
        <button
          type="button"
          className={styles.loginButton}
          onClick={onSwitchToAuth}
        >
          Войти
        </button>
      </div>
    </form>
  );
}
