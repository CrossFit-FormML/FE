import "./globals.css";

export const metadata = {
  title: "크로스핏 자세 교정 시스템",
  description:
    "실시간으로 크로스핏 자세를 분석하고 피드백을 제공하는 웹 애플리케이션",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
