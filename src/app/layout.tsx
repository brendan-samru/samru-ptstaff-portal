import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SAMRU Staff Portal",
  description: "Students' Association of Mount Royal University - Staff Resources & Training Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
