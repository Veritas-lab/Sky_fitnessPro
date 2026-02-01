"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import styles from "./registrform.module.css";

interface RegistrFormProps {
  onSwitchToAuth: () => void;
  onAuthSuccess?: (name: string, email: string, password: string) => void;
}

const STORAGE_KEY = "sky_fitness_auth";
const USERS_STORAGE_KEY = "sky_fitness_users";

interface UserData {
  email: string;
  password: string;
  name: string;
}

export default function RegistrForm({
  onSwitchToAuth,
  onAuthSuccess,
}: RegistrFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    if (typeof window !== "undefined") {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      let users: UserData[] = [];

      if (savedUsers) {
        try {
          users = JSON.parse(savedUsers);
          const existingUser = users.find((u) => u.email === email);
          if (existingUser) {
            setError("Данная почта уже используется. Попробуйте войти.");
            return;
          }
        } catch {
          users = [];
        }
      }

      const name = email.split("@")[0] || "Пользователь";
      const capitalizedName =
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

      const newUser: UserData = {
        email,
        password,
        name: capitalizedName,
      };

      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      if (onAuthSuccess) {
        onAuthSuccess(capitalizedName, email, password);
      }
    }
  };

  const handleInputChange = () => {
    if (error) {
      setError("");
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
        <div className={styles.inputWrapper}>
          <input
            type="email"
            placeholder="Эл. почта"
            className={`${styles.inputField} ${error ? styles.inputFieldError : ""}`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              handleInputChange();
            }}
          />
          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
        <input
          type="password"
          placeholder="Пароль"
          className={styles.inputField}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            handleInputChange();
          }}
        />
        <input
          type="password"
          placeholder="Повторите пароль"
          className={styles.inputField}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            handleInputChange();
          }}
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
