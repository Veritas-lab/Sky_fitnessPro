import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const roboto = Roboto({
  weight: ["400", "600", "700"],
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sky Fitness Pro",
  description:
    "Сайт для фитнеса, который позволяет выбирать курсы и отслеживать прогресс тренировок.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={roboto.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
