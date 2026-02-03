"use client";
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./authform.module.css";
import { useAuth } from "@/contexts/AuthContext";

interface AuthFormProps {
  onSwitchToRegister?: () => void;
  onAuthSuccess?: () => void;
}

export default function AuthForm({
  onSwitchToRegister,
  onAuthSuccess,
}: AuthFormProps) {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Редирект после успешного входа
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/profile");
      router.refresh();
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      if (err instanceof Error) {
        const errorMessage = err.message;
        if (
          errorMessage.includes("Пользователь с таким email не найден") ||
          errorMessage.includes("email не найден") ||
          errorMessage.includes("не найден")
        ) {
          setError("Логин введен неверно, попробуйте еще раз.");
        } else if (
          errorMessage.includes("Неверный пароль") ||
          errorMessage.includes("неверный пароль")
        ) {
          setError("Пароль введен неверно, попробуйте еще раз.");
        } else {
          setError(errorMessage);
        }
      } else {
        setError("Произошла ошибка при входе");
      }
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
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
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
              autoComplete="current-password"
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
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path d="M10 5C6.68629 5 4 7.68629 4 11C4 14.3137 6.68629 17 10 17C13.3137 17 16 14.3137 16 11C16 7.68629 13.3137 5 10 5ZM10 15C7.79086 15 6 13.2091 6 11C6 8.79086 7.79086 7 10 7C12.2091 7 14 8.79086 14 11C14 13.2091 12.2091 15 10 15Z" />
                  <path d="M10 8C8.89543 8 8 8.89543 8 10C8 11.1046 8.89543 12 10 12C11.1046 12 12 11.1046 12 10C12 8.89543 11.1046 8 10 8Z" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path d="M10 5C6.68629 5 4 7.68629 4 11C4 14.3137 6.68629 17 10 17C13.3137 17 16 14.3137 16 11C16 7.68629 13.3137 5 10 5ZM10 15C7.79086 15 6 13.2091 6 11C6 8.79086 7.79086 7 10 7C12.2091 7 14 8.79086 14 11C14 13.2091 12.2091 15 10 15Z" />
                  <path d="M10 8C8.89543 8 8 8.89543 8 10C8 11.1046 8.89543 12 10 12C11.1046 12 12 11.1046 12 10C12 8.89543 11.1046 8 10 8Z" />
                </svg>
              )}
            </button>
          </div>
          {error && error.includes("Пароль") && (
            <div className={styles.errorMessage}>{error}</div>
          )}
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
      </div>
    </form>
  );
}