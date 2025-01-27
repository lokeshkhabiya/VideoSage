"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/hooks/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, ArrowRight } from "lucide-react";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload
      console.log("File selected:", file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // Handle content submission
      console.log("Content submitted:", inputValue);
      setInputValue("");
    }
  };
  return (
    <div className="p-8 md:p-16 dark:bg-gray-900">
      <div className="flex h-full overflow-hidden">
        <div className="flex flex-col flex-1 overflow-hidden">
          <section className="flex flex-col items-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl my-4">
              What do you want to learn today?
            </h1>
            <div className="w-full max-w-3xl">
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleFileUpload}
                      className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                      <Link2 className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="video/*,application/pdf,.doc,.docx"
                  />
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Upload file, paste YouTube video, or record a lecture"
                    className="pl-12 pr-12 h-14 border-2 text-xs md:text-sm dark:bg-gray-900"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </form>
            </div>
          </section>
          <div className="flex-1 overflow-y-auto mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
