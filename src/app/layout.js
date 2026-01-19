// This stays as a server component
import "./globals.css";
import { Inter } from "next/font/google";
import ClientProviders from "./components/ClientProviders";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "UrbanExchange",
  description: "UrbanExchange Trading Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head />
      <body className="font-sans bg-zinc-50 text-zinc-900 antialiased" suppressHydrationWarning={true}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
