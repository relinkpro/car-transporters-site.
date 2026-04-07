import { Analytics } from '@vercel/analytics/next'; 
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Wexford Trailer Hire | Car Transporter Hire Bunclody",
  description:
    "Car transporter trailer hire in Bunclody, Co. Wexford. Cars, jeeps, vintage vehicles and machinery. Message on WhatsApp for price and availability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics /> {/* 👈 THIS IS THE IMPORTANT PART */}
      </body>
    </html>
  );
}