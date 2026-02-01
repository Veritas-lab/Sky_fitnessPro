"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import styles from "./registrform.module.css";

interface RegistrFormProps {
  onSwitchToAuth: () => void;
  onAuthSuccess?: (name: string, email: string) => void;
}

export default function RegistrForm({
  onSwitchToAuth,
  onAuthSuccess,
}: RegistrFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email && password && password === confirmPassword && onAuthSuccess) {
      const name = email.split("@")[0] || "Пользователь";
      const capitalizedName =
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      onAuthSuccess(capitalizedName, email);
    }
  };

  return (
    <form className={styles.registrForm} onSubmit={handleSubmit}>
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          className={styles.inputField}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Повторите пароль"
          className={styles.inputField}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
