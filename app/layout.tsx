import { ClerkProvider } from "@clerk/nextjs";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata = {
  title: "Octopus RAGBot",
  description: "Octopus RAGBot IA Agent",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={GeistSans.variable}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
