"use client";

import { useState } from "react";
import Header from "./components/header/header";
import Main from "./components/main/main";
import RegistrForm from "./components/form/registrform";
import styles from "./page.module.css";

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleLoginClick = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
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
            <RegistrForm />
          </div>
        </div>
      )}
    </>
  );
}
