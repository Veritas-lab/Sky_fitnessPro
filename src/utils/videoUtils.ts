/**
 * Нормализует URL видео YouTube для использования в iframe
 * Преобразует обычный YouTube URL в embed формат, если необходимо
 * Добавляет необходимые параметры для обхода ограничений безопасности
 */
export function normalizeVideoUrl(url: string): string {
  if (!url || !url.trim()) {
    return "";
  }

  const trimmedUrl = url.trim();

  // Извлекаем ID видео из различных форматов YouTube URL
  let videoId: string | null = null;

  // Формат: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmedUrl.match(/[?&]v=([^&]+)/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }

  // Формат: https://youtu.be/VIDEO_ID
  if (!videoId) {
    const shortMatch = trimmedUrl.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) {
      videoId = shortMatch[1];
    }
  }

  // Формат: https://www.youtube.com/embed/VIDEO_ID
  if (!videoId) {
    const embedMatch = trimmedUrl.match(/embed\/([^?&]+)/);
    if (embedMatch) {
      videoId = embedMatch[1];
    }
  }

  // Если нашли ID, создаем embed URL с необходимыми параметрами
  if (videoId) {
    // Очищаем videoId от лишних символов
    const cleanVideoId = videoId.split("&")[0].split("?")[0].trim();

    if (!cleanVideoId) {
      return trimmedUrl;
    }

    // Получаем origin для параметра origin
    const origin =
      typeof window !== "undefined" && window.location
        ? window.location.origin
        : "http://localhost:3000";

    // Добавляем параметры для обхода ограничений безопасности
    const params = new URLSearchParams({
      enablejsapi: "1",
      origin: origin,
      rel: "0", // Отключаем показ связанных видео
      modestbranding: "1", // Уменьшаем брендинг YouTube
      playsinline: "1", // Воспроизведение встроенного видео
    });

    return `https://www.youtube.com/embed/${cleanVideoId}?${params.toString()}`;
  }

  // Если уже embed URL, добавляем параметры если их нет
  if (trimmedUrl.includes("youtube.com/embed/")) {
    try {
      const urlObj = new URL(trimmedUrl);
      const origin =
        typeof window !== "undefined" && window.location
          ? window.location.origin
          : "http://localhost:3000";

      urlObj.searchParams.set("enablejsapi", "1");
      urlObj.searchParams.set("origin", origin);
      urlObj.searchParams.set("rel", "0");
      urlObj.searchParams.set("modestbranding", "1");
      urlObj.searchParams.set("playsinline", "1");

      return urlObj.toString();
    } catch (e) {
      // Если не удалось распарсить URL, просто добавляем параметры вручную
      const separator = trimmedUrl.includes("?") ? "&" : "?";
      const origin =
        typeof window !== "undefined" && window.location
          ? window.location.origin
          : "http://localhost:3000";
      return `${trimmedUrl}${separator}enablejsapi=1&origin=${encodeURIComponent(origin)}&rel=0&modestbranding=1&playsinline=1`;
    }
  }

  // Если не удалось распознать формат как YouTube URL, возвращаем пустую строку
  // Это предотвращает попытки загрузить не-YouTube страницы в iframe
  if (trimmedUrl.includes("youtube.com") || trimmedUrl.includes("youtu.be")) {
    // Если это похоже на YouTube URL, но не удалось извлечь ID, возвращаем как есть
    // (может быть это уже правильный embed URL, который мы не распознали)
    return trimmedUrl;
  }

  // Если это точно не YouTube URL, возвращаем пустую строку
  return "";
}
