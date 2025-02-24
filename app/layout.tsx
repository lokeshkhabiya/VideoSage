import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/auth-provider";
import { Header } from "@/components/header";
import { SpacesProvider } from "@/hooks/space-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "VideoSage - AI-Powered Video Learning",
  description:
    "Transform your YouTube learning experience with AI-powered tools for better understanding and interaction.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SpacesProvider>
              <div className="flex h-screen overflow-hidden">
                <div className="flex flex-col flex-1 overflow-hidden dark:bg-gray-900">
                  <Header />
                  <main className="flex-1 overflow-y-auto dark:bg-gray-900">
                    {children}
                  </main>
                  <footer className=" mx-auto w-full px-4 py-2 text-center text-gray-600 dark:bg-gray-900 border-t dark:text-gray-400 ">
                    <p>
                      &copy; {new Date().getFullYear()} VideoSage. All rights
                      reserved.
                    </p>
                  </footer>
                </div>
              </div>
            </SpacesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
