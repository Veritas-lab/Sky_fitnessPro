"use client";

import styles from "./main.module.css";
import Card from "../card/card";

interface DisplayCourse {
  _id: string;
  nameRU: string;
  nameEN: string;
  image: string;
  duration: number;
  dailyDuration: { from: number; to: number };
  difficulty: string;
  courseId: string;
}

interface MainProps {
  courses: DisplayCourse[];
  isLoadingCourses: boolean;
  isAuthenticated?: boolean;
  onAddCourse?: (courseId: string) => void;
}

export default function Main({
  courses,
  isLoadingCourses,
  isAuthenticated = false,
  onAddCourse,
}: MainProps) {
  return (
    <div className={styles.main}>
      <section className={styles.titleSection}>
        <h1 className={styles.mainTitle}>
          Начните заниматься спортом и улучшите качество жизни
        </h1>
        <div className={styles.promoContainer}>
          <div className={styles.promoBanner}>
            <p className={styles.promoText}>
              Измени своё
              <br />
              тело за полгода!
            </p>
          </div>
          <svg
            className={styles.polygonIcon}
            width="31"
            height="36"
            viewBox="0 0 31 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.25285 34.7255C1.65097 35.9972 -0.601266 34.3288 0.148526 32.4259L12.4256 1.26757C12.9078 0.043736 14.4198 -0.389332 15.4768 0.393651L29.4288 10.7288C30.4858 11.5118 30.5121 13.0844 29.4819 13.9023L3.25285 34.7255Z"
              fill="#BCEC30"
            />
          </svg>
        </div>
      </section>

      <section className={styles.cardsSection}>
        <div className={styles.cardsContainer}>
          {isLoadingCourses
            ? Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className={styles.cardSkeleton}>
                  <div className={styles.skeletonImage} />
                  <div className={styles.skeletonContent}>
                    <div className={styles.skeletonTitle} />
                    <div className={styles.skeletonBadges}>
                      <div className={styles.skeletonBadge} />
                      <div className={styles.skeletonBadge} />
                    </div>
                    <div className={styles.skeletonBadge} />
                  </div>
                </div>
              ))
            : courses.map((course, index) => (
                <Card
                  key={course._id}
                  title={course.nameEN}
                  image={course.image}
                  courseName={course.nameRU}
                  isAuthenticated={isAuthenticated}
                  onAddCourse={onAddCourse}
                  priority={index === 0}
                />
              ))}
        </div>
      </section>
      <button
        className={styles.scrollTopButton}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        Наверх!
      </button>
    </div>
  );
}
