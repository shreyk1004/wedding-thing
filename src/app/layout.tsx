import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weddy - AI Wedding Planning Tool",
  description: "A modern, elegant wedding planning tool to help you organize your perfect day.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
