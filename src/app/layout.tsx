import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta"
});

export const metadata: Metadata = {
  title: "Cireng Anu - Juaranya Cireng & Cemilan Gurih",
  description: "Aplikasi pemesanan cireng isi, cimol kuah keju lumer, pempek, cheese roll, dan dimsum creamy lezat langsung ke WhatsApp.",
  icons: {
    icon: "/logo.jpg",
    apple: "/apple-touch-icon.png",
    shortcut: "/logo.jpg"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#D92228"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${jakarta.variable} font-sans`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caacupe+One&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-neutral-950 text-neutral-900 antialiased selection:bg-red-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
