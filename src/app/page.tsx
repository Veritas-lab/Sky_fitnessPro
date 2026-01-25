"use client";

import { useState } from "react";
import Header from "./components/header/header";
import Main from "./components/main/main";
import RegistrForm from "./components/form/registrform";
import AuthForm from "./components/form/authform";
import styles from "./page.module.css";

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<"register" | "auth">("register");

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

  return (
    <>
      <Header onLoginClick={handleLoginClick} />
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
              <RegistrForm onSwitchToAuth={handleSwitchToAuth} />
            ) : (
              <AuthForm onSwitchToRegister={handleSwitchToRegister} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
