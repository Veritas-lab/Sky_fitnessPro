"use client";
import { useState, FormEvent, useEffect, useRef, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./registrform.module.css";
import { useAuth } from "@/context/AuthContext";

interface RegistrFormProps {
  onSwitchToAuth: () => void;
  onAuthSuccess?: () => void;
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
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();
  const mountedRef = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useLayoutEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      setRegistrationSuccess(false);
    };
  }, []);

  // Редирект после успешной регистрации
  useEffect(() => {
    if (!mountedRef.current || !isAuthenticated || !registrationSuccess) return;

    // Вызываем onAuthSuccess для закрытия модального окна
    if (onAuthSuccess) {
      onAuthSuccess();
    }

    requestAnimationFrame(() => {
      if (mountedRef.current) {
        try {
          // Небольшая задержка для закрытия модального окна
          setTimeout(() => {
            if (mountedRef.current) {
              setRegistrationSuccess(false);
              router.push("/profile");
              // Альтернативный вариант редиректа, если router.push не работает
              setTimeout(() => {
                if (mountedRef.current && typeof window !== "undefined") {
                  const currentPath = window.location.pathname;
                  if (currentPath !== "/profile") {
                    window.location.href = "/profile";
                  }
                }
              }, 500);
            }
          }, 200);
        } catch (error) {
          console.error("[REGISTER FORM] Ошибка при редиректе:", error);
          setRegistrationSuccess(false);
          // Пробуем альтернативный способ редиректа
          if (typeof window !== "undefined") {
            window.location.href = "/profile";
          }
        }
      }
    });
  }, [isAuthenticated, registrationSuccess, router, onAuthSuccess]);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!mountedRef.current) return;

    requestAnimationFrame(() => {
      if (mountedRef.current) {
        try {
          setEmailError("");
          setPasswordError("");
          setConfirmPasswordError("");
        } catch (error) {
          console.error("[REGISTER FORM] Ошибка при очистке ошибок:", error);
        }
      }
    });

    if (!email || !password || !confirmPassword) {
      return;
    }

    if (!validateEmail(email)) {
      if (!mountedRef.current) return;
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          try {
            setEmailError("Введите корректный Email");
          } catch (error) {
            console.error(
              "[REGISTER FORM] Ошибка при установке ошибки email:",
              error
            );
          }
        }
      });
      return;
    }

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      if (!mountedRef.current) return;
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          try {
            setPasswordError(passwordValidationError);
          } catch (error) {
            console.error(
              "[REGISTER FORM] Ошибка при установке ошибки пароля:",
              error
            );
          }
        }
      });
      return;
    }

    if (password !== confirmPassword) {
      if (!mountedRef.current) return;
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          try {
            setConfirmPasswordError("Пароли не совпадают");
          } catch (error) {
            console.error(
              "[REGISTER FORM] Ошибка при установке ошибки подтверждения пароля:",
              error
            );
          }
        }
      });
      return;
    }

    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        setIsLoading(true);
      }
    });

    try {
      await register(email, password);

      // Регистрация успешна - устанавливаем флаг и ждем обновления isAuthenticated
      if (!mountedRef.current) return;
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          try {
            setIsLoading(false);
            setRegistrationSuccess(true);
          } catch (error) {
            console.error(
              "[REGISTER FORM] Ошибка при установке флага успеха:",
              error
            );
            setIsLoading(false);
          }
        }
      });
    } catch (err) {
      if (!mountedRef.current) return;
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          try {
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
            setIsLoading(false);
            setRegistrationSuccess(false);
          } catch (error) {
            console.error(
              "[REGISTER FORM] Ошибка при установке ошибок:",
              error
            );
          }
        }
      });
    }
  };

  const handleEmailChange = (value: string) => {
    if (!mountedRef.current) return;
    try {
      setEmail(value);
      if (emailError) {
        requestAnimationFrame(() => {
          if (mountedRef.current) {
            try {
              setEmailError("");
            } catch (error) {
              console.error(
                "[REGISTER FORM] Ошибка при очистке ошибки email:",
                error
              );
            }
          }
        });
      }
    } catch (error) {
      console.error("[REGISTER FORM] Ошибка при изменении email:", error);
    }
  };

  const handlePasswordChange = (value: string) => {
    if (!mountedRef.current) return;
    try {
      setPassword(value);
      if (passwordError) {
        requestAnimationFrame(() => {
          if (mountedRef.current) {
            try {
              setPasswordError("");
            } catch (error) {
              console.error(
                "[REGISTER FORM] Ошибка при очистке ошибки пароля:",
                error
              );
            }
          }
        });
      }
    } catch (error) {
      console.error("[REGISTER FORM] Ошибка при изменении пароля:", error);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    if (!mountedRef.current) return;
    try {
      setConfirmPassword(value);
      if (confirmPasswordError) {
        requestAnimationFrame(() => {
          if (mountedRef.current) {
            try {
              setConfirmPasswordError("");
            } catch (error) {
              console.error(
                "[REGISTER FORM] Ошибка при очистке ошибки подтверждения пароля:",
                error
              );
            }
          }
        });
      }
    } catch (error) {
      console.error(
        "[REGISTER FORM] Ошибка при изменении подтверждения пароля:",
        error
      );
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
              autoComplete="new-password"
              className={`${styles.inputField} ${styles.passwordInput} ${passwordError ? styles.inputFieldError : ""}`}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => {
                if (!mountedRef.current) return;
                requestAnimationFrame(() => {
                  if (mountedRef.current) {
                    try {
                      setShowPassword(!showPassword);
                    } catch (error) {
                      console.error(
                        "[REGISTER FORM] Ошибка при переключении видимости пароля:",
                        error
                      );
                    }
                  }
                });
              }}
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
          {passwordError && (
            <div className={styles.errorMessage}>{passwordError}</div>
          )}
        </div>

        <div className={styles.inputWrapper}>
          <div className={styles.passwordInputContainer}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Повторите пароль"
              autoComplete="new-password"
              className={`${styles.inputField} ${styles.passwordInput} ${confirmPasswordError ? styles.inputFieldError : ""}`}
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => {
                if (!mountedRef.current) return;
                requestAnimationFrame(() => {
                  if (mountedRef.current) {
                    try {
                      setShowConfirmPassword(!showConfirmPassword);
                    } catch (error) {
                      console.error(
                        "[REGISTER FORM] Ошибка при переключении видимости подтверждения пароля:",
                        error
                      );
                    }
                  }
                });
              }}
              aria-label={
                showConfirmPassword ? "Скрыть пароль" : "Показать пароль"
              }
            >
              {showConfirmPassword ? (
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
          {confirmPasswordError && (
            <div className={styles.errorMessage}>{confirmPasswordError}</div>
          )}
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
      </div>
    </form>
  );
}
