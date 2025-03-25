import { Inter } from "next/font/google";

import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";
import {
  AuthProvider,
  QueryProvider,
  SocketProvider,
  ThemeProvider,
} from "@/provider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "URL Shortener",
  description: "A modern URL shortener application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <SocketProvider>
                <div className="flex min-h-screen flex-col">
                  <Navbar />
                  <main className="container mx-auto flex-1 p-4">
                    {children}
                  </main>
                  <Toaster />
                </div>
              </SocketProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
