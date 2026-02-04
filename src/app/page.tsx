"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "./components/header/header";
import AuthHeader from "./components/header/authHeader";
import Main from "./components/main/main";
import RegistrForm from "./components/form/registrform";
import AuthForm from "./components/form/authform";
import AuthPromptModal from "./components/modal/authPromptModal";
import CourseAddModal from "./components/modal/courseAddModal";
import { useAuth } from "@/context/AuthContext";
import {
  getCourses as getAllCourses,
  addUserCourse,
} from "./services/courses/coursesApi";
import { Course as ApiCourse } from "@/types/shared";
import styles from "./page.module.css";

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

const courseImages: Record<string, string> = {
  yoga: "/img/yoga.png",
  stretching: "/img/stretching.png",
  fitness: "/img/fitness.png",
  "step-aerobics": "/img/step_aerobics.png",
  bodyflex: "/img/bodyflex.png",
};

const courseNameMap: Record<string, string> = {
  Yoga: "yoga",
  Stretching: "stretching",
  Fitness: "fitness",
  "Step Aerobics": "step-aerobics",
  StepAerobics: "step-aerobics",
  Bodyflex: "bodyflex",
};

const courseNameRUMap: Record<string, string> = {
  Йога: "yoga",
  Стретчинг: "stretching",
  Фитнес: "fitness",
  "Степ-аэробика": "step-aerobics",
  Бодифлекс: "bodyflex",
};

const courseOrder = [
  "yoga",
  "stretching",
  "fitness",
  "step-aerobics",
  "bodyflex",
];

export default function Home() {
  const router = useRouter();
  const {
    isAuthenticated,
    userName,
    userEmail,
    userData,
    refreshUserData,
    logout,
  } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<"register" | "auth">("register");
  const [authPromptModalOpen, setAuthPromptModalOpen] = useState(false);
  const [courseAddModalOpen, setCourseAddModalOpen] = useState(false);
  const [courseAddModalType, setCourseAddModalType] = useState<
    "success" | "alreadyAdded" | "error"
  >("success");
  const [courses, setCourses] = useState<DisplayCourse[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mountedRef.current || typeof window === "undefined") return;

    const loadData = async (): Promise<void> => {
      try {
        const allCourses = await getAllCourses();

        const displayCourses: DisplayCourse[] = allCourses.map(
          (course: ApiCourse) => {
            let courseId = courseNameMap[course.nameEN];
            if (!courseId) {
              courseId = courseNameRUMap[course.nameRU];
            }
            if (!courseId) {
              const normalizedName = course.nameEN
                .toLowerCase()
                .replace(/\s+/g, "-");
              courseId = normalizedName;
            }

            const imageKey = courseId;
            let image = courseImages[imageKey];

            if (!image) {
              const normalizedKey = course.nameEN
                .toLowerCase()
                .replace(/\s+/g, "-");
              image = courseImages[normalizedKey];
            }

            if (!image || image === "") {
              image = "/img/fitness.png";
            }

            return {
              _id: course._id,
              nameRU: course.nameRU,
              nameEN: course.nameEN,
              image: image,
              duration: 25,
              dailyDuration: { from: 20, to: 50 },
              difficulty: "Сложность",
              courseId: courseId,
            };
          }
        );

        const sortedCourses = displayCourses.sort((a, b) => {
          const indexA = courseOrder.indexOf(a.courseId);
          const indexB = courseOrder.indexOf(b.courseId);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        if (mountedRef.current) {
          requestAnimationFrame(() => {
            if (mountedRef.current) {
              try {
                setCourses(sortedCourses);
                setIsLoadingCourses(false);
              } catch (error) {
                console.error(
                  "[HOME PAGE] Ошибка при установке курсов:",
                  error
                );
              }
            }
          });
        }
      } catch {
        if (mountedRef.current) {
          requestAnimationFrame(() => {
            if (mountedRef.current) {
              try {
                setIsLoadingCourses(false);
              } catch (error) {
                console.error(
                  "[HOME PAGE] Ошибка при установке isLoadingCourses:",
                  error
                );
              }
            }
          });
        }
      }
    };

    loadData();
  }, []);

  const handleLoginClick = () => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        try {
          setAuthPromptModalOpen(false);
          setFormType("register");
          setIsFormOpen(true);
        } catch (error) {
          console.error("[HOME PAGE] Ошибка в handleLoginClick:", error);
        }
      }
    });
  };

  const handleCloseAuthPrompt = () => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        try {
          setAuthPromptModalOpen(false);
        } catch (error) {
          console.error("[HOME PAGE] Ошибка в handleCloseAuthPrompt:", error);
        }
      }
    });
  };

  const handleCloseForm = () => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        try {
          setIsFormOpen(false);
        } catch {}
      }
    });
  };

  const handleSwitchToAuth = () => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        try {
          setFormType("auth");
        } catch (error) {
          console.error("[HOME PAGE] Ошибка в handleSwitchToAuth:", error);
        }
      }
    });
  };

  const handleSwitchToRegister = () => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        try {
          setFormType("register");
        } catch (error) {
          console.error("[HOME PAGE] Ошибка в handleSwitchToRegister:", error);
        }
      }
    });
  };

  const handleAuthSuccess = async (): Promise<void> => {
    if (!mountedRef.current) return;
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        try {
          setIsFormOpen(false);
        } catch (error) {
          console.error("[HOME PAGE] Ошибка в handleAuthSuccess:", error);
        }
      }
    });
    try {
      await refreshUserData();
    } catch (error) {
      console.error(
        "[HOME PAGE] Ошибка при обновлении данных пользователя:",
        error
      );
    }
  };

  const handleLogout = () => {
    if (!mountedRef.current) return;
    logout();
    router.push("/");
  };

  const handleAddCourse = async (courseId: string): Promise<void> => {
    if (typeof window === "undefined" || !mountedRef.current) {
      return;
    }

    if (!isAuthenticated) {
      if (mountedRef.current) {
        requestAnimationFrame(() => {
          if (mountedRef.current) {
            try {
              setAuthPromptModalOpen(true);
            } catch (error) {
              console.error(
                "[HOME PAGE] Ошибка при установке authPromptModalOpen:",
                error
              );
            }
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
      const courseNameEN =
        Object.entries(courseNameMap).find(([, id]) => id === courseId)?.[0] ||
        courseId;

      const foundCourse = allCourses.find(
        (course: ApiCourse) =>
          course.nameEN.toLowerCase() === courseNameEN.toLowerCase() ||
          course.nameRU.toLowerCase() === courseNameEN.toLowerCase()
      );

      if (!foundCourse) {
        return;
      }

      // Проверяем, не был ли курс уже добавлен
      const courseExists = userData.selectedCourses.includes(foundCourse._id);

      if (courseExists) {
        // Курс уже добавлен - показываем соответствующее модальное окно
        if (mountedRef.current) {
          requestAnimationFrame(() => {
            if (mountedRef.current) {
              try {
                setCourseAddModalType("alreadyAdded");
                setCourseAddModalOpen(true);
              } catch (error) {
                console.error(
                  "[HOME PAGE] Ошибка при установке модального окна:",
                  error
                );
              }
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
              try {
                setCourseAddModalType("success");
                setCourseAddModalOpen(true);
              } catch (error) {
                console.error(
                  "[HOME PAGE] Ошибка при установке модального окна успеха:",
                  error
                );
              }
            }
          });
        }
      } catch (addError) {
        // Ошибка при добавлении курса - показываем модальное окно ошибки
        if (mountedRef.current) {
          requestAnimationFrame(() => {
            if (mountedRef.current) {
              try {
                setCourseAddModalType("error");
                setCourseAddModalOpen(true);
              } catch (error) {
                console.error(
                  "[HOME PAGE] Ошибка при установке модального окна ошибки:",
                  error
                );
              }
            }
          });
        }
      }
    } catch (error) {
      // Ошибка при добавлении курса - показываем модальное окно ошибки
      if (mountedRef.current) {
        requestAnimationFrame(() => {
          if (mountedRef.current) {
            try {
              setCourseAddModalType("error");
              setCourseAddModalOpen(true);
            } catch (error) {
              console.error(
                "[HOME PAGE] Ошибка при установке модального окна ошибки:",
                error
              );
            }
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
            "[HOME PAGE] Ошибка при закрытии модального окна:",
            error
          );
        }
      }
    });
  };

  return (
    <>
      {isAuthenticated ? (
        <AuthHeader
          userName={userName}
          userEmail={userEmail}
          onLogout={handleLogout}
        />
      ) : (
        <Header onLoginClick={handleLoginClick} />
      )}
      <main>
        <Main
          courses={courses}
          isLoadingCourses={isLoadingCourses}
          isAuthenticated={isAuthenticated}
          onAddCourse={handleAddCourse}
        />
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
      {authPromptModalOpen && (
        <AuthPromptModal
          onClose={handleCloseAuthPrompt}
          onLoginClick={handleLoginClick}
        />
      )}
      {courseAddModalOpen && (
        <CourseAddModal
          type={courseAddModalType}
          onClose={handleCloseCourseAddModal}
          autoCloseDelay={courseAddModalType === "error" ? 0 : 3000}
        />
      )}
    </>
  );
}
