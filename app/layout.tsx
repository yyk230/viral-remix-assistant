import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "爆款复刻助手",
  description: "拆解爆款短视频的结构，迁移到你自己的产品，生成可以照着拍的分镜脚本",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full bg-slate-100 font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}
