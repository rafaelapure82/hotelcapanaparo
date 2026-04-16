import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hotel Capanaparo Suites | Luxury & Comfort",
  description: "Experience the ultimate stay at Hotel Capanaparo Suites. Luxury, comfort, and extraordinary service.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main style={{ marginTop: '80px', minHeight: 'calc(100vh - 80px)' }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
