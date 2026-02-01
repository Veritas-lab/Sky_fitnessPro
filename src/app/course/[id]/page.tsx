"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import Header from "../../components/header/header";
import RegistrForm from "../../components/form/registrform";
import AuthForm from "../../components/form/authform";
import AuthPromptModal from "../../components/modal/authPromptModal";
import CourseAddModal from "../../components/modal/courseAddModal";
import {
  isAuthenticated as checkAuth,
  removeToken,
  getToken,
} from "../../services/authToken";
import { getUserData } from "../../services/auth/authApi";
import {
  getAllCourses,
  getCourseById,
  addCourseToUser,
  Course as ApiCourse,
  CourseDetail,
} from "../../services/courses/coursesApi";
import styles from "../course.module.css";
import pageStyles from "../../page.module.css";

const AuthHeader = dynamic(() => import("../../components/header/authHeader"), {
  ssr: false,
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
  const [courseId, setCourseId] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<"register" | "auth">("register");
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [courseAddModal, setCourseAddModal] = useState<{
    isOpen: boolean;
    type: "success" | "alreadyAdded" | "error";
  }>({ isOpen: false, type: "success" });
  const [courseData, setCourseData] = useState<CourseDetail | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const mountedRef = useRef(false);

  useLayoutEffect(() => {
    mountedRef.current = true;
    setIsMounted(true);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;

    const loadUserData = async () => {
      if (typeof window !== "undefined" && checkAuth()) {
        const token = getToken();
        if (token) {
          try {
            const userData = await getUserData(token);
            if (mountedRef.current) {
              setIsAuthenticated(true);
              setUserEmail(userData.email);
              const name = userData.email.split("@")[0] || "Пользователь";
              const capitalizedName =
                name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
              setUserName(capitalizedName);
            }
        } catch (error) {
          if (mountedRef.current) {
            setIsAuthenticated(false);
            removeToken();
          }
        }
        }
      }
    };

    loadUserData();
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

    const loadCourseData = async () => {
      setIsLoadingCourse(true);
      try {
        const allCourses = await getAllCourses();
        const courseNameMap: Record<string, string> = {
          yoga: "yoga",
          stretching: "stretching",
          fitness: "fitness",
          "step-aerobics": "step-aerobics",
          bodyflex: "bodyflex",
        };

        const courseNameEN =
          courseNameMap[courseId] || courseId.toLowerCase();
        const foundCourse = allCourses.find(
          (course: ApiCourse) =>
            course.nameEN.toLowerCase() === courseNameEN.toLowerCase() ||
            course.nameRU.toLowerCase() === courseNameEN.toLowerCase()
        );

        if (foundCourse) {
          const courseDetail = await getCourseById(foundCourse._id);
          if (mountedRef.current) {
            setCourseData(courseDetail);
          }
        }
      } catch (error) {
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
    if (!mountedRef.current) return;
    const wasMounted = mountedRef.current;
    mountedRef.current = false;
    requestAnimationFrame(() => {
      if (wasMounted) {
        try {
          setIsFormOpen(false);
        } catch {}
      }
    });
  };

  const handleCloseAuthPrompt = () => {
    if (!mountedRef.current) return;
    const wasMounted = mountedRef.current;
    mountedRef.current = false;
    requestAnimationFrame(() => {
      if (wasMounted) {
        try {
          setShowAuthPrompt(false);
        } catch {}
      }
    });
  };

  const handleSwitchToAuth = () => {
    setFormType("auth");
  };

  const handleSwitchToRegister = () => {
    setFormType("register");
  };

  const handleAuthSuccess = async (name: string, email: string) => {
    if (!mountedRef.current) return;
    const wasMounted = mountedRef.current;
    setUserName(name);
    setUserEmail(email);
    setIsAuthenticated(true);
    setIsFormOpen(false);
    if (typeof window !== "undefined" && wasMounted) {
      const token = getToken();
      if (token) {
        try {
          const userData = await getUserData(token);
          if (mountedRef.current) {
            setUserEmail(userData.email);
            const newName = userData.email.split("@")[0] || "Пользователь";
            const capitalizedName =
              newName.charAt(0).toUpperCase() + newName.slice(1).toLowerCase();
            setUserName(capitalizedName);
          }
        } catch (error) {
          if (mountedRef.current) {
            setIsAuthenticated(false);
            removeToken();
          }
        }
      }
    }
  };

  const handleLogout = () => {
    if (!mountedRef.current) return;
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      removeToken();
      router.push("/");
    }
  };

  const handleAddCourse = async () => {
    if (
      !mountedRef.current ||
      !courseId ||
      typeof window === "undefined" ||
      !isAuthenticated
    ) {
      setCourseAddModal({ isOpen: true, type: "error" });
      return;
    }

    const token = getToken();
    if (!token) {
      setCourseAddModal({ isOpen: true, type: "error" });
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

      const courseNameEN =
        courseNameMap[courseId] || courseId.toLowerCase();
      const foundCourse = allCourses.find(
        (course: ApiCourse) =>
          course.nameEN.toLowerCase() === courseNameEN.toLowerCase() ||
          course.nameRU.toLowerCase() === courseNameEN.toLowerCase()
      );

      if (!foundCourse) {
        setCourseAddModal({ isOpen: true, type: "error" });
        return;
      }

      const userData = await getUserData(token);
      const courseExists = userData.selectedCourses.includes(foundCourse._id);

      if (courseExists) {
        setCourseAddModal({ isOpen: true, type: "alreadyAdded" });
        return;
      }

      await addCourseToUser(foundCourse._id);
      if (mountedRef.current) {
        setCourseAddModal({ isOpen: true, type: "success" });
      }
    } catch (error) {
      if (mountedRef.current) {
        setCourseAddModal({ isOpen: true, type: "error" });
      }
    }
  };

  const handleCloseCourseAddModal = () => {
    if (!mountedRef.current) return;
    const wasMounted = mountedRef.current;
    mountedRef.current = false;
    requestAnimationFrame(() => {
      if (wasMounted) {
        try {
          setCourseAddModal({ isOpen: false, type: "success" });
        } catch {}
      }
    });
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
            ) : courseData && courseData.fitting && courseData.fitting.length > 0 ? (
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
            ) : null}
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
            ) : courseData && courseData.directions && courseData.directions.length > 0 ? (
              <div className={styles.directionsFrame}>
                {Array.from({ length: Math.ceil(courseData.directions.length / 2) }).map(
                  (_, blockIndex) => (
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
                  )
                )}
              </div>
            ) : null}
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
      {isMounted && courseAddModal.isOpen && (
        <CourseAddModal
          type={courseAddModal.type}
          onClose={handleCloseCourseAddModal}
        />
      )}
    </>
  );
}
