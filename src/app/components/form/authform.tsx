"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import styles from "./authform.module.css";
import { loginUser } from "../../services/auth/authApi";
import { saveToken } from "../../services/authToken";

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
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!login || !password) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser({ email: login, password });
      saveToken(response.token);

      const name = login.split("@")[0] || "Пользователь";
      const capitalizedName =
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

      if (onAuthSuccess) {
        onAuthSuccess(capitalizedName, login);
      }
    } catch (err) {
      if (err instanceof Error) {
        const errorMessage = err.message;
        if (errorMessage.includes("email") || errorMessage.includes("найден")) {
          setError("Логин введен неверно, попробуйте еще раз.");
        } else if (
          errorMessage.includes("пароль") ||
          errorMessage.includes("Неверный")
        ) {
          setError("Пароль введен неверно, попробуйте еще раз.");
        } else {
          setError(errorMessage);
        }
      } else {
        setError("Произошла ошибка при входе");
      }
    } finally {
      setIsLoading(false);
    }
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
          <div className={styles.passwordInputContainer}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Пароль"
              className={`${styles.inputField} ${styles.passwordInput} ${error && error.includes("Пароль") ? styles.inputFieldError : ""}`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                handleInputChange();
              }}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 3.75C5.83333 3.75 2.27417 6.34167 0.833328 10C2.27417 13.6583 5.83333 16.25 10 16.25C14.1667 16.25 17.7258 13.6583 19.1667 10C17.7258 6.34167 14.1667 3.75 10 3.75ZM10 14.1667C7.69917 14.1667 5.83333 12.3008 5.83333 10C5.83333 7.69917 7.69917 5.83333 10 5.83333C12.3008 5.83333 14.1667 7.69917 14.1667 10C14.1667 12.3008 12.3008 14.1667 10 14.1667ZM10 7.5C8.62083 7.5 7.5 8.62083 7.5 10C7.5 11.3792 8.62083 12.5 10 12.5C11.3792 12.5 12.5 11.3792 12.5 10C12.5 8.62083 11.3792 7.5 10 7.5Z"
                    fill="#999999"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.5 2.5L17.5 17.5M8.15833 8.15833C7.84167 8.475 7.5 9.20833 7.5 10C7.5 11.3792 8.62083 12.5 10 12.5C10.7917 12.5 11.525 12.1583 11.8417 11.8417M5.97417 5.97417C4.60833 6.80833 3.52083 7.85833 2.77417 9.08333C3.52083 10.3083 4.60833 11.3583 5.97417 12.1925C7.34167 13.025 8.64167 13.3333 10 13.3333C11.3583 13.3333 12.6583 13.025 14.0258 12.1925L11.8417 9.99167M14.0258 7.00833C12.6583 6.175 11.3583 5.86667 10 5.86667C8.64167 5.86667 7.34167 6.175 5.97417 7.00833C4.60833 7.84167 3.52083 8.89167 2.77417 10.1167L5.83333 13.1758M14.1667 6.83333L17.2258 9.89167C17.7258 9.10833 18.1083 8.39167 18.3833 7.75"
                    stroke="#999999"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
          {error && error.includes("Пароль") && (
            <div className={styles.errorMessage}>{error}</div>
          )}
        </div>
      </div>
      <div className={styles.buttonFrame}>
        <button
          type="submit"
          className={styles.loginButton}
          disabled={isLoading}
        >
          {isLoading ? "Вход..." : "Войти"}
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
