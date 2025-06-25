import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "文件存储分享网站",
  description: "安全、便捷的文件存储和分享平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
