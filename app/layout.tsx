import "./globals.css";
import { Manrope, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/auth-provider";
import { Header } from "@/components/header";
import { SpacesProvider } from "@/hooks/space-provider";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

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
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} font-sans`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SpacesProvider>
              <div className="flex h-screen overflow-hidden">
                <div className="flex flex-col flex-1 overflow-hidden dark:bg-background">
                  <Header />
                  <main className="flex-1 overflow-y-auto dark:bg-background">
                    {children}
                  </main>
                  <footer className=" mx-auto w-full px-4 py-2 text-center text-gray-600 dark:bg-background border-t dark:text-gray-400 ">
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
