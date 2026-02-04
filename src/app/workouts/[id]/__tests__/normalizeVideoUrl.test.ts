/**
 * Тесты для функции normalizeVideoUrl
 */
import { normalizeVideoUrl } from "@/utils/videoUtils";

describe("normalizeVideoUrl", () => {
  // Функция имеет fallback на 'http://localhost:3000', поэтому мокирование не обязательно
  // Но для предсказуемости тестов можно проверить, что функция работает корректно

  it("должна обрабатывать стандартный YouTube watch URL", () => {
    const input = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const result = normalizeVideoUrl(input);

    expect(result).toContain("youtube.com/embed/dQw4w9WgXcQ");
    expect(result).toContain("enablejsapi=1");
    expect(result).toContain("rel=0");
  });

  it("должна обрабатывать короткий YouTube URL", () => {
    const input = "https://youtu.be/dQw4w9WgXcQ";
    const result = normalizeVideoUrl(input);

    expect(result).toContain("youtube.com/embed/dQw4w9WgXcQ");
    expect(result).toContain("enablejsapi=1");
  });

  it("должна обрабатывать уже embed URL", () => {
    const input = "https://www.youtube.com/embed/dQw4w9WgXcQ";
    const result = normalizeVideoUrl(input);

    expect(result).toContain("youtube.com/embed/dQw4w9WgXcQ");
    expect(result).toContain("enablejsapi=1");
  });

  it("должна добавлять параметры к существующему embed URL", () => {
    const input = "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=1";
    const result = normalizeVideoUrl(input);

    expect(result).toContain("youtube.com/embed/dQw4w9WgXcQ");
    expect(result).toContain("enablejsapi=1");
    expect(result).toContain("rel=0"); // Должен перезаписать rel=1 на rel=0
  });

  it("должна возвращать пустую строку для пустого URL", () => {
    expect(normalizeVideoUrl("")).toBe("");
    expect(normalizeVideoUrl("   ")).toBe("");
  });

  it("должна обрабатывать URL с дополнительными параметрами", () => {
    const input = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s";
    const result = normalizeVideoUrl(input);

    expect(result).toContain("youtube.com/embed/dQw4w9WgXcQ");
    // Должна извлечь только videoId, без дополнительных параметров
    expect(result).not.toContain("t=42s");
  });

  it("должна включать origin в параметры", () => {
    const input = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const result = normalizeVideoUrl(input);

    expect(result).toContain("origin=");
  });

  it("должна возвращать пустую строку для не-YouTube URL", () => {
    const input = "https://example.com/video";
    const result = normalizeVideoUrl(input);

    expect(result).toBe("");
  });

  it("должна возвращать пустую строку для Google support URL", () => {
    const input = "https://support.google.com/";
    const result = normalizeVideoUrl(input);

    expect(result).toBe("");
  });

  it("должна возвращать пустую строку для любого не-YouTube URL", () => {
    const inputs = [
      "https://google.com",
      "https://support.google.com/help",
      "https://vimeo.com/video123",
      "https://example.com",
    ];

    inputs.forEach((input) => {
      const result = normalizeVideoUrl(input);
      expect(result).toBe("");
    });
  });
});
