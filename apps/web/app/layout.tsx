import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ChatProvider } from "@/context/ChatContext";
import FloatingConcierge from "@/components/FloatingConcierge";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hotelcapanaparo.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Hotel Capanaparo Suites | Luxury & Comfort",
    template: "%s | Hotel Capanaparo Suites",
  },
  description: "Reserva tu estadía de lujo en Hotel Capanaparo Suites. Suites premium con servicio excepcional en Venezuela. Booking directo, mejor precio garantizado.",
  keywords: ["hotel", "suites", "luxury", "capanaparo", "venezuela", "booking", "reservas", "hospedaje"],
  authors: [{ name: "Hotel Capanaparo Suites" }],
  creator: "Hotel Capanaparo Suites",
  openGraph: {
    type: "website",
    locale: "es_VE",
    url: SITE_URL,
    siteName: "Hotel Capanaparo Suites",
    title: "Hotel Capanaparo Suites | Luxury & Comfort",
    description: "Reserva tu estadía de lujo en Hotel Capanaparo Suites. Suites premium con servicio excepcional.",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Hotel Capanaparo Suites",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hotel Capanaparo Suites | Luxury & Comfort",
    description: "Reserva tu estadía de lujo. Suites premium con servicio excepcional.",
    images: [`${SITE_URL}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD structured data for the hotel
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: "Hotel Capanaparo Suites",
    description: "Suites de lujo con servicio excepcional en Venezuela.",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressCountry: "VE",
    },
    starRating: {
      "@type": "Rating",
      ratingValue: "4.8",
    },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Air Conditioning", value: true },
      { "@type": "LocationFeatureSpecification", name: "Parking", value: true },
    ],
  };

  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#2EC4B6" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            <ChatProvider>
              <Navbar />
              <main style={{ marginTop: '80px', minHeight: 'calc(100vh - 80px)' }}>
                {children}
              </main>
              <Footer />
              <FloatingConcierge />
            </ChatProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
