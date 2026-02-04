/**
 * Курсы, добавленные при ответе 500 от API — сохраняем до явного удаления пользователем.
 * Сервер при 500 может не сохранять курс, поэтому храним их в sessionStorage.
 */
const KEY = "pending_courses";

export function addPendingCourse(courseId: string): void {
  if (typeof window === "undefined") return;
  const ids = getPendingCourses();
  if (!ids.includes(courseId)) {
    ids.push(courseId);
    sessionStorage.setItem(KEY, JSON.stringify(ids));
  }
}

export function removePendingCourse(courseId: string): void {
  if (typeof window === "undefined") return;
  const ids = getPendingCourses().filter((id) => id !== courseId);
  sessionStorage.setItem(KEY, JSON.stringify(ids));
}

export function getPendingCourses(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearPendingCourses(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}

/** Убрать из pending те, что уже есть в selectedCourses (сервер сохранил) */
export function prunePendingCourses(selectedCourses: string[]): void {
  const pending = getPendingCourses();
  const serverSet = new Set(selectedCourses);
  const stillPending = pending.filter((id) => !serverSet.has(id));
  if (stillPending.length !== pending.length) {
    sessionStorage.setItem(KEY, JSON.stringify(stillPending));
  }
}
