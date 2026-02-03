"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import Header from "../../components/header/header";
import RegistrForm from "../../components/form/registrform";
import AuthForm from "../../components/form/authform";
import AuthPromptModal from "../../components/modal/authPromptModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCourses as getAllCourses,
  getCourseById,
  addUserCourse,
} from "../../services/courses/coursesApi";
import { Course as ApiCourse, CourseDetail } from "@/types/shared";
import styles from "../course.module.css";
import pageStyles from "../../page.module.css";

const AuthHeader = dynamic(() => import("../../components/header/authHeader"), {
  ssr: false,
  loading: () => null,
});

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
  const router = useRouter();
  const {
    isAuthenticated,
    userName,
    userEmail,
    userData,
    refreshUserData,
    logout,
  } = useAuth();
  const [courseId, setCourseId] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<"register" | "auth">("register");
  const [isMounted, setIsMounted] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [courseData, setCourseData] = useState<CourseDetail | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [courseError, setCourseError] = useState<string | null>(null);
  const mountedRef = useRef(false);

  useLayoutEffect(() => {
    mountedRef.current = true;
    setIsMounted(true);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mountedRef.current || !courseId) return;

    if (!isAuthenticated && courseId) {
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          setShowAuthPrompt(true);
        }
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isAuthenticated, courseId]);

  useEffect(() => {
    if (params?.id && typeof params.id === "string") {
      setCourseId(params.id);
    }
  }, [params]);

  useEffect(() => {
    if (!mountedRef.current || !courseId) return;

    const loadCourseData = async (): Promise<void> => {
      if (!mountedRef.current) return;
      setIsLoadingCourse(true);
      setCourseError(null);
      try {
        const allCourses = await getAllCourses();
        if (!mountedRef.current) return;

        const courseNameMap: Record<string, string> = {
          yoga: "yoga",
          stretching: "stretching",
          fitness: "fitness",
          "step-aerobics": "step-aerobics",
          bodyflex: "bodyflex",
        };

        const courseNameEN = courseNameMap[courseId] || courseId.toLowerCase();
        const foundCourse = allCourses.find(
          (course: ApiCourse) =>
            course.nameEN.toLowerCase() === courseNameEN.toLowerCase() ||
            course.nameRU.toLowerCase() === courseNameEN.toLowerCase()
        );

        if (!foundCourse) {
          if (mountedRef.current) {
            setCourseError("Курс не найден");
            setCourseData(null);
            setIsLoadingCourse(false);
          }
          return;
        }

        const courseDetail = await getCourseById(foundCourse._id);
        if (mountedRef.current) {
          setCourseData(courseDetail as CourseDetail);
          setCourseError(null);
        }
      } catch (error) {
        if (mountedRef.current) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          setCourseError(errorMessage || "Ошибка загрузки данных курса");
          setCourseData(null);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoadingCourse(false);
        }
      }
    };

    loadCourseData();
  }, [courseId]);

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
    if (mountedRef.current) {
      setIsFormOpen(false);
    }
  };

  const handleCloseAuthPrompt = () => {
    if (mountedRef.current) {
      setShowAuthPrompt(false);
    }
  };

  const handleSwitchToAuth = () => {
    setFormType("auth");
  };

  const handleSwitchToRegister = () => {
    setFormType("register");
  };

  const handleAuthSuccess = async (): Promise<void> => {
    if (!mountedRef.current) return;
    setIsFormOpen(false);
    await refreshUserData();
  };

  const handleLogout = () => {
    if (!mountedRef.current) return;
    logout();
    router.push("/");
  };

  const handleAddCourse = async (): Promise<void> => {
    if (!mountedRef.current || !courseId || typeof window === "undefined") {
      return;
    }

    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    if (!userData) {
      return;
    }

    try {
      const allCourses = await getAllCourses();
      const courseNameMap: Record<string, string> = {
        yoga: "yoga",
        stretching: "stretching",
        fitness: "fitness",
        "step-aerobics": "step-aerobics",
        bodyflex: "bodyflex",
      };

      const courseNameEN = courseNameMap[courseId] || courseId.toLowerCase();
      const foundCourse = allCourses.find(
        (course: ApiCourse) =>
          course.nameEN.toLowerCase() === courseNameEN.toLowerCase() ||
          course.nameRU.toLowerCase() === courseNameEN.toLowerCase()
      );

      if (!foundCourse) {
        return;
      }

      const courseExists = userData.selectedCourses.includes(foundCourse._id);

      if (courseExists) {
        return;
      }

      await addUserCourse(foundCourse._id);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await refreshUserData();

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch {
      // Ignore errors silently
    }
  };

  return (
    <>
      {isAuthenticated && userName && userEmail ? (
        <AuthHeader
          userName={userName}
          userEmail={userEmail}
          onLogout={handleLogout}
        />
      ) : (
        <Header onLoginClick={handleLoginClick} />
      )}
      <main className={styles.courseMain}>
        <div className={styles.courseImageContainer}>
          {courseId ? (
            <>
              <Image
                src={courseCardImage}
                alt={courseId}
                fill
                sizes="(max-width: 768px) 100vw, 1440px"
                className={styles.courseImage}
              />
              <Image
                src={courseImage}
                alt={courseId}
                fill
                sizes="(max-width: 768px) 100vw, 1440px"
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
            {isLoadingCourse ? (
              <div className={styles.courseTextBlocksContainer}>
                <div className={styles.courseTextBlock}>
                  <span className={styles.courseTextNumber}>1</span>
                  <div className={styles.skeletonText}>
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLineShort} />
                  </div>
                </div>
                <div className={styles.courseTextBlock2}>
                  <span className={styles.courseTextNumber2}>2</span>
                  <div className={styles.skeletonText}>
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLineShort} />
                  </div>
                </div>
                <div className={styles.courseTextBlock3}>
                  <span className={styles.courseTextNumber3}>3</span>
                  <div className={styles.skeletonText}>
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLineShort} />
                  </div>
                </div>
              </div>
            ) : courseError ? (
              <div className={styles.courseTextBlocksContainer}>
                <p className={styles.errorText}>{courseError}</p>
              </div>
            ) : courseData &&
              courseData.fitting &&
              courseData.fitting.length > 0 ? (
              <div className={styles.courseTextBlocksContainer}>
                {courseData.fitting.slice(0, 3).map((item, index) => {
                  const blockClass =
                    index === 0
                      ? styles.courseTextBlock
                      : index === 1
                        ? styles.courseTextBlock2
                        : styles.courseTextBlock3;
                  const numberClass =
                    index === 0
                      ? styles.courseTextNumber
                      : index === 1
                        ? styles.courseTextNumber2
                        : styles.courseTextNumber3;
                  const descriptionClass =
                    index === 1
                      ? styles.courseTextDescription2
                      : styles.courseTextDescription;

                  return (
                    <div key={index} className={blockClass}>
                      <span className={numberClass}>{index + 1}</span>
                      <p className={descriptionClass}>{item}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.courseTextBlocksContainer}>
                <p className={styles.errorText}>Данные недоступны</p>
              </div>
            )}
          </div>
        )}
        {courseId && (
          <div className={styles.directionsSection}>
            <h2 className={styles.directionsTitle}>Направления</h2>
            {isLoadingCourse ? (
              <div className={styles.directionsFrame}>
                <div className={styles.directionBlock}>
                  <div className={styles.directionItem}>
                    <div className={styles.skeletonIcon} />
                    <div className={styles.skeletonDirectionText} />
                  </div>
                  <div className={styles.directionItem}>
                    <div className={styles.skeletonIcon} />
                    <div className={styles.skeletonDirectionText} />
                  </div>
                </div>
                <div className={styles.directionBlock}>
                  <div className={styles.directionItem}>
                    <div className={styles.skeletonIcon} />
                    <div className={styles.skeletonDirectionText} />
                  </div>
                  <div className={styles.directionItem}>
                    <div className={styles.skeletonIcon} />
                    <div className={styles.skeletonDirectionText} />
                  </div>
                </div>
                <div className={styles.directionBlock}>
                  <div className={styles.directionItem}>
                    <div className={styles.skeletonIcon} />
                    <div className={styles.skeletonDirectionText} />
                  </div>
                  <div className={styles.directionItem}>
                    <div className={styles.skeletonIcon} />
                    <div className={styles.skeletonDirectionText} />
                  </div>
                </div>
              </div>
            ) : courseError ? (
              <div className={styles.directionsFrame}>
                <p className={styles.errorText}>{courseError}</p>
              </div>
            ) : courseData &&
              courseData.directions &&
              courseData.directions.length > 0 ? (
              <div className={styles.directionsFrame}>
                {Array.from({
                  length: Math.ceil(courseData.directions.length / 2),
                }).map((_, blockIndex) => (
                  <div key={blockIndex} className={styles.directionBlock}>
                    {courseData.directions
                      .slice(blockIndex * 2, blockIndex * 2 + 2)
                      .map((direction, itemIndex) => (
                        <div key={itemIndex} className={styles.directionItem}>
                          <Image
                            src="/img/Sparcle.svg"
                            alt="icon"
                            width={24}
                            height={24}
                            className={styles.directionsIcon}
                          />
                          <span className={styles.directionsText}>
                            {direction}
                          </span>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.directionsFrame}>
                <p className={styles.errorText}>Данные недоступны</p>
              </div>
            )}
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
                {isAuthenticated ? (
                  <button
                    className={styles.courseContentButton}
                    onClick={handleAddCourse}
                  >
                    Добавить курс
                  </button>
                ) : (
                  <button
                    className={styles.courseContentButton}
                    onClick={handleLoginClick}
                  >
                    Войдите, чтобы добавить курс
                  </button>
                )}
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
      {isMounted && showAuthPrompt && !isAuthenticated && (
        <AuthPromptModal
          onClose={handleCloseAuthPrompt}
          onLoginClick={handleLoginClick}
        />
      )}
    </>
  );
}
