"use client";

import styles from "./registrform.module.css";

export default function RegistrForm() {
  return (
    <form className={styles.registrForm}>
      <img src="/img/logo.svg" alt="Sky Fitness Pro" className={styles.logo} />
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
        <button type="button" className={styles.loginButton}>
          Войти
        </button>
      </div>
    </form>
  );
}
