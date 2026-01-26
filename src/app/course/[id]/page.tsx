"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "../../components/header/header";
import RegistrForm from "../../components/form/registrform";
import AuthForm from "../../components/form/authform";
import styles from "../course.module.css";
import pageStyles from "../../page.module.css";

const courseImages: Record<string, string> = {
  yoga: "/img/youga_card.png",
  stretching: "/img/stretching_card.png",
  fitness: "/img/fitness_card.png",
  "step-aerobics": "/img/step_aerobics_card.png",
  bodyflex: "/img/bodyflex_card.png",
};

export default function CoursePage() {
  const params = useParams();
  const [courseId, setCourseId] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<"register" | "auth">("register");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (params?.id && typeof params.id === "string") {
      setCourseId(params.id);
    }
  }, [params]);

  const courseImage = courseId
    ? courseImages[courseId] || "/img/fitness_card.png"
    : "/img/fitness_card.png";

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
      <main className={styles.courseMain}>
        <div className={styles.courseImageContainer}>
          {courseId ? (
            <img
              src={courseImage}
              alt={courseId}
              className={styles.courseImage}
            />
          ) : (
            <div>Загрузка...</div>
          )}
        </div>
        {courseId && (
          <div className={styles.courseFrame}>
            <h2 className={styles.courseTitle}>Подойдет для вас, если:</h2>
            <div className={styles.courseTextBlocksContainer}>
              <div className={styles.courseTextBlock}>
                <span className={styles.courseTextNumber}>1</span>
                <p className={styles.courseTextDescription}>
                  Давно хотели попробовать йогу, но не решались начать
                </p>
              </div>
              <div className={styles.courseTextBlock2}>
                <span className={styles.courseTextNumber2}>2</span>
              </div>
            </div>
          </div>
        )}
      </main>
      {isMounted && isFormOpen && (
        <div 
          className={pageStyles.modalOverlay} 
          onClick={handleCloseForm}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={pageStyles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={pageStyles.closeButton}
              onClick={handleCloseForm}
              aria-label="Закрыть"
            >
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
