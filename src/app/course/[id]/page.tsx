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
import { useAuth } from "@/context/AuthContext";
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
  stepairobic: "/img/step_aerobics_card.png",
  stepairobics: "/img/step_aerobics_card.png",
  stepaerobics: "/img/step_aerobics_card.png",
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
  const [courseAddModalOpen, setCourseAddModalOpen] = useState(false);
  const [courseAddModalType, setCourseAddModalType] = useState<
    "success" | "alreadyAdded" | "error"
  >("success");
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
          requestAnimationFrame(() => {
            if (mountedRef.current) {
              try {
                setShowAuthPrompt(true);
              } catch (error) {
                console.error("Ошибка при установке showAuthPrompt:", error);
              }
            }
          });
        }
      }, 500);

      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }
  }, [isAuthenticated, courseId]);

  useEffect(() => {
    if (!mountedRef.current) return;
    if (params?.id && typeof params.id === "string") {
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          try {
            setCourseId(params.id as string);
          } catch (error) {
            console.error("Ошибка при установке courseId:", error);
          }
        }
      });
    }
  }, [params]);

  useEffect(() => {
    if (!mountedRef.current || !courseId) return;

    const loadCourseData = async (): Promise<void> => {
      if (!mountedRef.current) return;
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          setIsLoadingCourse(true);
          setCourseError(null);
        }
      });
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
            requestAnimationFrame(() => {
              if (mountedRef.current) {
                setCourseError("Курс не найден");
                setCourseData(null);
                setIsLoadingCourse(false);
              }
            });
          }
          return;
        }

        const courseDetail = await getCourseById(foundCourse._id);
        if (mountedRef.current) {
          requestAnimationFrame(() => {
            if (mountedRef.current) {
              try {
                setCourseData(courseDetail as CourseDetail);
                setCourseError(null);
              } catch (error) {
                console.error(
                  "[COURSE PAGE] Ошибка при установке courseData:",
                  error
                );
              }
            }
          });
        }
      } catch (error) {
        if (mountedRef.current) {
          requestAnimationFrame(() => {
            if (mountedRef.current) {
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              setCourseError(errorMessage || "Ошибка загрузки данных курса");
              setCourseData(null);
            }
          });
        }
      } finally {
        if (mountedRef.current) {
          requestAnimationFrame(() => {
            if (mountedRef.current) {
              try {
                setIsLoadingCourse(false);
              } catch (error) {
                console.error(
                  "[COURSE PAGE] Ошибка при установке isLoadingCourse:",
                  error
                );
              }
            }
          });
        }
      }
    };

    loadCourseData();
  }, [courseId]);


  const normalizeCourseId = (id: string): string => {
    if (!id) return "";
    const normalized = id.toLowerCase().trim();

   
    if (
      normalized.includes("step") &&
      (normalized.includes("aero") || normalized.includes("airob"))
    ) {
      return "step-aerobics";
    }

 
    if (courseCardImages[normalized]) {
      return normalized;
    }

    return normalized;
  };

  const normalizedCourseId = courseId ? normalizeCourseId(courseId) : "";

  const courseImage = normalizedCourseId
    ? courseImages[normalizedCourseId] || "/img/fitness.png"
    : "/img/fitness.png";

  const courseCardImage = normalizedCourseId
    ? courseCardImages[normalizedCourseId] || "/img/fitness_card.png"
    : "/img/fitness_card.png";

  const handleLoginClick = () => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        setFormType("register");
        setIsFormOpen(true);
      }
    });
  };

  const handleCloseForm = () => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        setIsFormOpen(false);
      }
    });
  };

  const handleCloseAuthPrompt = () => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        setShowAuthPrompt(false);
      }
    });
  };

  const handleSwitchToAuth = () => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        setFormType("auth");
      }
    });
  };

  const handleSwitchToRegister = () => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        setFormType("register");
      }
    });
  };

  const handleAuthSuccess = async (): Promise<void> => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        setIsFormOpen(false);
      }
    });
    try {
      await refreshUserData();
    } catch (error) {
      console.error("Ошибка при обновлении данных пользователя:", error);
    }
  };

  const handleLogout = () => {
    if (!mountedRef.current || typeof window === "undefined") return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        try {
          logout();
          setTimeout(() => {
            if (mountedRef.current && typeof window !== "undefined") {
              try {
                router.push("/");
              } catch (error) {
                console.error("Ошибка при навигации:", error);
              }
            }
          }, 100);
        } catch (error) {
          console.error("Ошибка при выходе:", error);
        }
      }
    });
  };

  const handleAddCourse = async (): Promise<void> => {
    if (!mountedRef.current || !courseId || typeof window === "undefined") {
      return;
    }

    if (!isAuthenticated) {
      if (mountedRef.current) {
        requestAnimationFrame(() => {
          if (mountedRef.current) {
            setShowAuthPrompt(true);
          }
        });
      }
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
        if (mountedRef.current) {
          requestAnimationFrame(() => {
            if (mountedRef.current) {
              setCourseAddModalType("alreadyAdded");
              setCourseAddModalOpen(true);
            }
          });
        }
        return;
      }

      try {
        await addUserCourse(foundCourse._id);

        await new Promise((resolve) => setTimeout(resolve, 500));

        await refreshUserData();

        // Курс успешно добавлен - показываем модальное окно успеха
        if (mountedRef.current) {
          requestAnimationFrame(() => {
            if (mountedRef.current) {
              setCourseAddModalType("success");
              setCourseAddModalOpen(true);
            }
          });
        }
      } catch (addError) {
        // Ошибка при добавлении курса - показываем модальное окно ошибки
        console.error("Ошибка при добавлении курса:", addError);
        if (mountedRef.current) {
          requestAnimationFrame(() => {
            if (mountedRef.current) {
              setCourseAddModalType("error");
              setCourseAddModalOpen(true);
            }
          });
        }
      }
    } catch (error) {
      // Ошибка при загрузке курсов или другой ошибке
      console.error("Ошибка при загрузке курсов:", error);
      if (mountedRef.current) {
        requestAnimationFrame(() => {
          if (mountedRef.current) {
            setCourseAddModalType("error");
            setCourseAddModalOpen(true);
          }
        });
      }
    }
  };

  const handleCloseCourseAddModal = () => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        try {
          setCourseAddModalOpen(false);
        } catch (error) {
          console.error(
            "[COURSE PAGE] Ошибка при закрытии модального окна добавления курса:",
            error
          );
        }
      }
    });
  };

  if (!isMounted) {
    return null;
  }

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
          {isLoadingCourse ? (
            <div className={styles.skeletonImage} />
          ) : courseId ? (
            <>
              <Image
                src={courseCardImage}
                alt={courseId}
                fill
                sizes="(max-width: 768px) 100vw, 1440px"
                className={styles.courseImage}
                priority
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
            <div className={styles.skeletonImage} />
          )}
        </div>
        {courseId && (
          <section className={styles.courseFrame}>
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
          </section>
        )}
        {courseId && (
          <section className={styles.directionsSection}>
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
          </section>
        )}
        {courseId && (
          <>
            <Image
              key="runner-mobile"
              src="/img/runner.png"
              alt="runner"
              width={360}
              height={400}
              className={styles.courseRunnerImageMobile}
            />
            <Image
              key="vector-mobile"
              src="/img/vector_mob.png"
              alt="vector"
              width={343}
              height={412}
              className={styles.courseVectorImageMobile}
            />
            <section className={styles.courseContentBlock}>
              <Image
                key="runner-desktop"
                src="/img/runner.png"
                alt="runner"
                width={360}
                height={400}
                className={styles.courseRunnerImage}
                priority
              />
              {isLoadingCourse ? (
                <div className={styles.courseContentRight}>
                  <div className={styles.skeletonTitle} />
                  <div className={styles.skeletonContentList}>
                    <div className={styles.skeletonContentItem} />
                    <div className={styles.skeletonContentItem} />
                    <div className={styles.skeletonContentItem} />
                    <div className={styles.skeletonContentItem} />
                    <div className={styles.skeletonContentItem} />
                  </div>
                  <div className={styles.skeletonButton} />
                </div>
              ) : (
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
              )}
            </section>
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
      {isMounted && courseAddModalOpen && (
        <CourseAddModal
          type={courseAddModalType}
          onClose={handleCloseCourseAddModal}
          autoCloseDelay={courseAddModalType === "error" ? 0 : 3000}
        />
      )}
    </>
  );
}
