import Link from "next/link";
import styles from "./card.module.css";

interface CardProps {
  title: string;
  image: string;
  courseName: string;
}

const courseIdMap: Record<string, string> = {
  Yoga: "yoga",
  Stretching: "stretching",
  Fitness: "fitness",
  "Step Aerobics": "step-aerobics",
  Bodyflex: "bodyflex",
};

export default function Card({ title, image, courseName }: CardProps) {
  const courseId = courseIdMap[title] || title.toLowerCase();
  const courseUrl = `/course/${courseId}`;

  return (
    <Link href={courseUrl} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          <img src={image} alt={title} className={styles.cardImage} />
          <img src="/img/plus.svg" alt="Add" className={styles.plusIcon} />
        </div>
        <div className={styles.cardFrame}>
          <h3 className={styles.courseTitle}>{courseName}</h3>
          <div className={styles.badgesContainer}>
            <div className={styles.firstRow}>
              <div className={styles.daysBadge}>
                <img
                  src="/img/calendar.svg"
                  alt="Calendar"
                  className={styles.calendarIcon}
                />
                <span className={styles.daysText}>25 дней</span>
              </div>
              <div className={styles.clockBadge}>
                <img
                  src="/img/clock.svg"
                  alt="Clock"
                  className={styles.clockIcon}
                />
                <span className={styles.clockText}>20-50 мин/день</span>
              </div>
            </div>
            <div className={styles.complexityBadge}>
              <img
                src="/img/complexity.svg"
                alt="Complexity"
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
