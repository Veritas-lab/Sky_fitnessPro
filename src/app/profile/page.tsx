"use client";

import { useState, useEffect } from "react";
import AuthHeader from "../components/header/authHeader";
import styles from "./page.module.css";

// Mock data - будет заменено на реальные данные из API
interface Course {
  id: string;
  name: string;
  image: string;
  duration: number;
  dailyDuration: { from: number; to: number };
  difficulty: string;
  progress: number;
}

interface User {
  email: string;
  name: string;
  courses: Course[];
}

const courseImages: Record<string, string> = {
  yoga: "/img/yoga.png",
  stretching: "/img/stretching.png",
  fitness: "/img/fitness.png",
  "step-aerobics": "/img/step_aerobics.png",
  bodyflex: "/img/bodyflex.png",
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // TODO: Заменить на реальный API запрос
    // Mock data для верстки
    const timer = setTimeout(() => {
      if (isMounted) {
        setUser({
          email: "sergey.petrov96",
          name: "Сергей",
          courses: [
            {
              id: "yoga",
              name: "Йога",
              image: courseImages.yoga,
              duration: 25,
              dailyDuration: { from: 20, to: 50 },
              difficulty: "Сложность",
              progress: 40,
            },
            {
              id: "stretching",
              name: "Стретчинг",
              image: courseImages.stretching,
              duration: 25,
              dailyDuration: { from: 20, to: 50 },
              difficulty: "Сложность",
              progress: 0,
            },
            {
              id: "fitness",
              name: "Фитнес",
              image: courseImages.fitness,
              duration: 25,
              dailyDuration: { from: 20, to: 50 },
              difficulty: "Сложность",
              progress: 100,
            },
          ],
        });
        setIsLoading(false);
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const handleLogout = () => {
    // TODO: Реализовать выход
    console.log("Logout");
  };

  const handleDeleteCourse = (courseId: string) => {
    // TODO: Реализовать удаление курса
    console.log("Delete course:", courseId);
  };

  const getButtonText = (progress: number) => {
    if (progress === 0) return "Начать тренировки";
    if (progress === 100) return "Начать заново";
    return "Продолжить";
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Пользователь не найден</div>
      </div>
    );
  }

  return (
    <>
      <AuthHeader userName={user.name} />
      <main className={styles.main}>
        <div className={styles.profileContainer}>
          <h1 className={styles.title}>Профиль</h1>

          <div className={styles.userInfoBlock}>
            <img
              src="/img/Profile_1.png"
              alt="Profile"
              className={styles.profileAvatar}
            />
            <div className={styles.userData}>
              <h2 className={styles.userName}>{user.name}</h2>
              <p className={styles.userLogin}>Логин: {user.email}</p>
              <button className={styles.logoutButton} onClick={handleLogout}>
                Выйти
              </button>
            </div>
          </div>

          <h2 className={styles.coursesTitle}>Мои курсы</h2>
          {user.courses.length > 0 ? (
            <div className={styles.coursesList}>
              {user.courses.map((course) => (
                <div key={course.id} className={styles.courseCard}>
                  <div className={styles.courseImageWrapper}>
                    <img
                      src={course.image}
                      alt={course.name}
                      className={styles.courseImage}
                    />
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteCourse(course.id)}
                      aria-label="Удалить курс"
                      title="Удалить курс"
                    >
                      <img
                        src="/img/minus.svg"
                        alt="Удалить курс"
                        className={styles.deleteIcon}
                      />
                    </button>
                  </div>
                  <div className={styles.courseInfo}>
                    <h3 className={styles.courseName}>{course.name}</h3>
                    <div className={styles.courseDetails}>
                      <div className={styles.firstRow}>
                        <div className={styles.daysBadge}>
                          <img
                            src="/img/calendar.svg"
                            alt="Calendar"
                            className={styles.calendarIcon}
                          />
                          <span className={styles.daysText}>
                            {course.duration} дней
                          </span>
                        </div>
                        <div className={styles.clockBadge}>
                          <img
                            src="/img/clock.svg"
                            alt="Clock"
                            className={styles.clockIcon}
                          />
                          <span className={styles.clockText}>
                            {course.dailyDuration.from}-
                            {course.dailyDuration.to} мин/день
                          </span>
                        </div>
                      </div>
                      <div className={styles.complexityBadge}>
                        <img
                          src="/img/complexity.svg"
                          alt="Complexity"
                          className={styles.complexityIcon}
                        />
                        <span className={styles.complexityText}>
                          {course.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className={styles.progressSection}>
                      <div className={styles.progressText}>
                        Прогресс {course.progress}%
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                    <button className={styles.courseButton}>
                      {getButtonText(course.progress)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noCourses}>У вас пока нет выбранных курсов</p>
          )}
        </div>
      </main>
    </>
  );
}
