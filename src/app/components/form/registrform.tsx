"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import styles from "./registrform.module.css";
import { registerUser } from "../../services/auth/authApi";

interface RegistrFormProps {
  onSwitchToAuth: () => void;
  onAuthSuccess?: (name: string, email: string) => void;
}

function validatePassword(password: string): string | null {
  if (password.length < 6) {
    return "Пароль должен содержать не менее 6 символов";
  }

  const specialChars = password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g);
  if (!specialChars || specialChars.length < 2) {
    return "Пароль должен содержать не менее 2 спецсимволов";
  }

  if (!/[A-Z]/.test(password)) {
    return "Пароль должен содержать как минимум одну заглавную букву";
  }

  return null;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default function RegistrForm({
  onSwitchToAuth,
  onAuthSuccess,
}: RegistrFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (!email || !password || !confirmPassword) {
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Введите корректный Email");
      return;
    }

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Пароли не совпадают");
      return;
    }

    setIsLoading(true);

    try {
      await registerUser({ email, password });

      const name = email.split("@")[0] || "Пользователь";
      const capitalizedName =
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

      if (onAuthSuccess) {
        onAuthSuccess(capitalizedName, email);
      }
    } catch (err) {
      if (err instanceof Error) {
        const errorMessage = err.message;
        if (
          errorMessage.includes("Email") ||
          errorMessage.includes("почта") ||
          errorMessage.includes("email")
        ) {
          setEmailError(errorMessage);
        } else if (
          errorMessage.includes("Пароль") ||
          errorMessage.includes("пароль") ||
          errorMessage.includes("password")
        ) {
          setPasswordError(errorMessage);
        } else {
          setPasswordError(errorMessage);
        }
      } else {
        setPasswordError("Произошла ошибка при регистрации");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError("");
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (confirmPasswordError) {
      setConfirmPasswordError("");
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
            className={`${styles.inputField} ${emailError ? styles.inputFieldError : ""}`}
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
          />
          {emailError && (
            <div className={styles.errorMessage}>{emailError}</div>
          )}
        </div>
        <div className={styles.inputWrapper}>
          <div className={styles.passwordInputContainer}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Пароль"
              className={`${styles.inputField} ${styles.passwordInput} ${passwordError ? styles.inputFieldError : ""}`}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
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
          {passwordError && (
            <div className={styles.errorMessage}>{passwordError}</div>
          )}
        </div>
        <div className={styles.inputWrapper}>
          <div className={styles.passwordInputContainer}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Повторите пароль"
              className={`${styles.inputField} ${styles.passwordInput} ${confirmPasswordError ? styles.inputFieldError : ""}`}
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword ? "Скрыть пароль" : "Показать пароль"
              }
            >
              {showConfirmPassword ? (
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
          {confirmPasswordError && (
            <div className={styles.errorMessage}>{confirmPasswordError}</div>
          )}
        </div>
      </div>
      <div className={styles.buttonFrame}>
        <button
          type="submit"
          className={styles.registerButton}
          disabled={isLoading}
        >
          {isLoading ? "Регистрация..." : "Зарегистрироваться"}
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
