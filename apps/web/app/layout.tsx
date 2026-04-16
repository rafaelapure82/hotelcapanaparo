import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { AuthProvider } from "@/context/AuthContext";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hotel Capanaparo Suites | Luxury & Comfort",
  description: "Experience the ultimate stay at Hotel Capanaparo Suites. Luxury, comfort, and extraordinary service.",
};

import { LanguageProvider } from "@/context/LanguageContext";
import { ChatProvider } from "@/context/ChatContext";
import ChatBubble from "./components/ChatBubble";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            <ChatProvider>
              <Navbar />
              <main style={{ marginTop: '80px', minHeight: 'calc(100vh - 80px)' }}>
                {children}
              </main>
              {/* Note: In a real app, receiverId would come from current context/support logic */}
              <ChatBubble receiverId={1} /> 
            </ChatProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


