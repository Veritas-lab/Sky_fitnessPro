import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sky Fitness Pro",
  description: "Сайт для фитнеса, который позволяет выбирать курсы и отслеживать прогресс тренировок.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
