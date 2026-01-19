// This stays as a server component
import "./globals.css";
import ClientProviders from "./components/ClientProviders";

export const metadata = {
  title: "User Trading Panel",
  description: "User Trading Panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body className="bg-gray-100 text-gray-900" suppressHydrationWarning={true}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
