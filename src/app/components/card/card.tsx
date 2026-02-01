"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./card.module.css";

interface CardProps {
  title: string;
  image: string;
  courseName: string;
  isAuthenticated?: boolean;
  onAddCourse?: (courseId: string) => void;
}

const courseIdMap: Record<string, string> = {
  Yoga: "yoga",
  Stretching: "stretching",
  Fitness: "fitness",
  "Step Aerobics": "step-aerobics",
  Bodyflex: "bodyflex",
};

export default function Card({
  title,
  image,
  courseName,
  isAuthenticated = false,
  onAddCourse,
}: CardProps) {
  const courseId = courseIdMap[title] || title.toLowerCase();
  const courseUrl = `/course/${courseId}`;

  const handlePlusClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated && onAddCourse) {
      onAddCourse(courseId);
    }
  };

  return (
    <Link href={courseUrl} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          <Image
            src={image}
            alt={title}
            width={360}
            height={325}
            className={styles.cardImage}
          />
          {isAuthenticated && (
            <button
              className={styles.plusIcon}
              onClick={handlePlusClick}
              aria-label="Добавить курс"
              type="button"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              <Image
                src="/img/plus.svg"
                alt="Add"
                width={30}
                height={30}
              />
            </button>
          )}
        </div>
        <div className={styles.cardFrame}>
          <h3 className={styles.courseTitle}>{courseName}</h3>
          <div className={styles.badgesContainer}>
            <div className={styles.firstRow}>
              <div className={styles.daysBadge}>
                <Image
                  src="/img/calendar.svg"
                  alt="Calendar"
                  width={16}
                  height={16}
                  className={styles.calendarIcon}
                />
                <span className={styles.daysText}>25 дней</span>
              </div>
              <div className={styles.clockBadge}>
                <Image
                  src="/img/clock.svg"
                  alt="Clock"
                  width={16}
                  height={16}
                  className={styles.clockIcon}
                />
                <span className={styles.clockText}>20-50 мин/день</span>
              </div>
            </div>
            <div className={styles.complexityBadge}>
              <Image
                src="/img/complexity.svg"
                alt="Complexity"
                width={16}
                height={16}
                className={styles.complexityIcon}
              />
              <span className={styles.complexityText}>Сложность</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
