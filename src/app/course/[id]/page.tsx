"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Header from "../../components/header/header";
import RegistrForm from "../../components/form/registrform";
import AuthForm from "../../components/form/authform";
import styles from "../course.module.css";
import pageStyles from "../../page.module.css";

const courseImages: Record<string, string> = {
  yoga: "/img/yoga.png",
  stretching: "/img/stretching.png",
  fitness: "/img/fitness.png",
  "step-aerobics": "/img/step_aerobics.png",
  bodyflex: "/img/bodyflex.png",
};

const courseCardImages: Record<string, string> = {
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
    ? courseImages[courseId] || "/img/fitness.png"
    : "/img/fitness.png";

  const courseCardImage = courseId
    ? courseCardImages[courseId] || "/img/fitness_card.png"
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
            <>
              <Image
                src={courseCardImage}
                alt={courseId}
                fill
                className={styles.courseImage}
              />
              <Image
                src={courseImage}
                alt={courseId}
                fill
                className={styles.courseImageMobile}
              />
            </>
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
                <p className={styles.courseTextDescription2}>
                  Хотите укрепить позвоночник, избавиться от болей в спине и
                  суставах
                </p>
              </div>
              <div className={styles.courseTextBlock3}>
                <span className={styles.courseTextNumber3}>3</span>
                <p className={styles.courseTextDescription}>
                  Ищете активность, полезную для тела и души
                </p>
              </div>
            </div>
          </div>
        )}
        {courseId && (
          <div className={styles.directionsSection}>
            <h2 className={styles.directionsTitle}>Направления</h2>
            <div className={styles.directionsFrame}>
              <div className={styles.directionBlock}>
                <div className={styles.directionItem}>
                  <Image
                    src="/img/Sparcle.svg"
                    alt="icon"
                    width={24}
                    height={24}
                    className={styles.directionsIcon}
                  />
                  <span className={styles.directionsText}>
                    Йога для новичков
                  </span>
                </div>
                <div className={styles.directionItem}>
                  <Image
                    src="/img/Sparcle.svg"
                    alt="icon"
                    width={24}
                    height={24}
                    className={styles.directionsIcon}
                  />
                  <span className={styles.directionsText}>
                    Классическая йога
                  </span>
                </div>
              </div>
              <div className={styles.directionBlock}>
                <div className={styles.directionItem}>
                  <Image
                    src="/img/Sparcle.svg"
                    alt="icon"
                    width={24}
                    height={24}
                    className={styles.directionsIcon}
                  />
                  <span className={styles.directionsText}>Кундалини-йога</span>
                </div>
                <div className={styles.directionItem}>
                  <Image
                    src="/img/Sparcle.svg"
                    alt="icon"
                    width={24}
                    height={24}
                    className={styles.directionsIcon}
                  />
                  <span className={styles.directionsText}>Йогатерапия</span>
                </div>
              </div>
              <div className={styles.directionBlock}>
                <div className={styles.directionItem}>
                  <Image
                    src="/img/Sparcle.svg"
                    alt="icon"
                    width={24}
                    height={24}
                    className={styles.directionsIcon}
                  />
                  <span className={styles.directionsText}>Хатха-йога</span>
                </div>
                <div className={styles.directionItem}>
                  <Image
                    src="/img/Sparcle.svg"
                    alt="icon"
                    width={24}
                    height={24}
                    className={styles.directionsIcon}
                  />
                  <span className={styles.directionsText}>Аштанга-йога</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {courseId && (
          <>
            <Image
              src="/img/runner.png"
              alt="runner"
              width={500}
              height={500}
              className={styles.courseRunnerImage}
            />
            <Image
              src="/img/runner.png"
              alt="runner"
              width={300}
              height={300}
              className={styles.courseRunnerImageMobile}
            />
            <Image
              src="/img/vector.png"
              alt="vector"
              width={200}
              height={200}
              className={styles.courseVectorImageMobile}
            />
            <div className={styles.courseContentBlock}>
              <div className={styles.courseContentRight}>
                <h2 className={styles.courseContentTitle}>
                  Начните путь
                  <br />к новому телу
                </h2>
                <ul className={styles.courseContentList}>
                  <li>проработка всех групп мышц</li>
                  <li>тренировка суставов</li>
                  <li>улучшение циркуляции крови</li>
                  <li>упражнения заряжают бодростью</li>
                  <li>помогают противостоять стрессам</li>
                </ul>
                <button className={styles.courseContentButton}>
                  Войдите, чтобы добавить курс
                </button>
              </div>
            </div>
          </>
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
              type="button"
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
