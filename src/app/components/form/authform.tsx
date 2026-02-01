"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import styles from "./authform.module.css";

interface AuthFormProps {
  onSwitchToRegister?: () => void;
  onAuthSuccess?: (name: string, email: string) => void;
}

export default function AuthForm({
  onSwitchToRegister,
  onAuthSuccess,
}: AuthFormProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (login && password && onAuthSuccess) {
      const name = login.split("@")[0] || "Пользователь";
      const capitalizedName =
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      onAuthSuccess(capitalizedName, login);
    }
  };

  return (
    <form className={styles.authForm} onSubmit={handleSubmit}>
      <Image
        src="/img/logo.svg"
        alt="Sky Fitness Pro"
        width={220}
        height={35}
        className={styles.logo}
      />
      <div className={styles.formFrame}>
        <input
          type="text"
          placeholder="Логин"
          className={styles.inputField}
          value={login}
          onChange={(e) => setLogin(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          className={styles.inputField}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
