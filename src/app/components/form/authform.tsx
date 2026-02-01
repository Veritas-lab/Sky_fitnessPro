"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import styles from "./authform.module.css";

interface AuthFormProps {
  onSwitchToRegister?: () => void;
  onAuthSuccess?: (name: string, email: string, password?: string) => void;
}

const STORAGE_KEY = "sky_fitness_auth";
const USERS_STORAGE_KEY = "sky_fitness_users";

interface UserData {
  email: string;
  password: string;
  name: string;
}

export default function AuthForm({
  onSwitchToRegister,
  onAuthSuccess,
}: AuthFormProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!login || !password) {
      return;
    }

    if (typeof window !== "undefined") {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (savedUsers) {
        try {
          const users: UserData[] = JSON.parse(savedUsers);
          const user = users.find((u) => u.email === login);

          if (user) {
            if (user.password !== password) {
              setError("Пароль введен неверно, попробуйте еще раз.");
              return;
            }
            if (onAuthSuccess) {
              onAuthSuccess(user.name, user.email);
            }
            return;
          }
        } catch {
        }
      }
    }

    setError("Логин введен неверно, попробуйте еще раз.");
  };

  const handleInputChange = () => {
    if (error) {
      setError("");
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
        <div className={styles.inputWrapper}>
          <input
            type="text"
            placeholder="Эл. почта"
            className={`${styles.inputField} ${error && error.includes("Логин") ? styles.inputFieldError : ""}`}
            value={login}
            onChange={(e) => {
              setLogin(e.target.value);
              handleInputChange();
            }}
          />
          {error && error.includes("Логин") && (
            <div className={styles.errorMessage}>{error}</div>
          )}
        </div>
        <div className={styles.inputWrapper}>
          <input
            type="password"
            placeholder="Пароль"
            className={`${styles.inputField} ${error && error.includes("Пароль") ? styles.inputFieldError : ""}`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              handleInputChange();
            }}
          />
          {error && error.includes("Пароль") && (
            <div className={styles.errorMessage}>{error}</div>
          )}
        </div>
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
