"use client";

import { useState, useEffect } from "react";
import Header from "./components/header/header";
import AuthHeader from "./components/header/authHeader";
import Main from "./components/main/main";
import RegistrForm from "./components/form/registrform";
import AuthForm from "./components/form/authform";
import styles from "./page.module.css";

interface AuthData {
  isAuthenticated: boolean;
  userName: string;
  userEmail: string;
}

const STORAGE_KEY = "sky_fitness_auth";

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<"register" | "auth">("register");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>("Сергей");
  const [userEmail, setUserEmail] = useState<string>("sergey.petrov96@mail.ru");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = localStorage.getItem(STORAGE_KEY);
      if (savedAuth) {
        try {
          const authData: AuthData = JSON.parse(savedAuth);
          if (authData.isAuthenticated) {
            setIsAuthenticated(authData.isAuthenticated);
            setUserName(authData.userName);
            setUserEmail(authData.userEmail);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, []);

  const handleLoginClick = () => {
    setFormType("register");
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleSwitchToAuth = () => {
    setFormType("auth");
  };

  const handleSwitchToRegister = () => {
    setFormType("register");
  };

  const handleAuthSuccess = (name: string, email: string) => {
    setUserName(name);
    setUserEmail(email);
    setIsAuthenticated(true);
    setIsFormOpen(false);
    if (typeof window !== "undefined") {
      const authData: AuthData = {
        isAuthenticated: true,
        userName: name,
        userEmail: email,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <>
      {isAuthenticated ? (
        <AuthHeader
          userName={userName}
          userEmail={userEmail}
          onLogout={handleLogout}
        />
      ) : (
        <Header onLoginClick={handleLoginClick} />
      )}
      <main>
        <Main />
      </main>
      {isFormOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseForm}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeButton} onClick={handleCloseForm}>
              ×
            </button>
            {formType === "register" ? (
              <RegistrForm
                onSwitchToAuth={handleSwitchToAuth}
                onAuthSuccess={handleAuthSuccess}
              />
            ) : (
              <AuthForm
                onSwitchToRegister={handleSwitchToRegister}
                onAuthSuccess={handleAuthSuccess}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
