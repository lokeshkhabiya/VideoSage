"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/auth-provider";
import { useSpaces } from "@/hooks/space-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, ArrowRight, Loader2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { setSpaces, setLoading, loading, addContentToSpace } = useSpaces();

  const router = useRouter();

  // -------------------------------
  // 1) If not authenticated, redirect; otherwise fetch user’s spaces once
  // -------------------------------
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/signin");
      return;
    }

    async function fetchSpaces() {
      setLoading(true);
      try {
        const res = await fetch("/api/spaces", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch spaces");
        const data = await res.json();
        setSpaces(data.spaces);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSpaces();
  }, [isAuthenticated, user?.token, router, setSpaces, setLoading]);

  if (!isAuthenticated || loading) {
    return <p>Loading...</p>;
  }

  // -------------------------------
  // 2) Handle file uploads
  // -------------------------------
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // handle your upload logic here if needed
    }
  };

  // -------------------------------
  // 3) Submit a new content link
  // -------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // If user is on /dashboard/spaces/:spaceId
    const matched = pathname.match(/spaces\/([^/]+)/);
    const space_id = matched ? matched[1] : undefined;

    try {
      setIsLoading(true)
      const res = await fetch("/api/contents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
          user: JSON.stringify({ user_id: user?.user_id }),
        },
        body: JSON.stringify({
          youtube_url: inputValue.trim(),
          space_id, // pass the space from URL if it exists
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to create content");
      }

      const json = await res.json();
      const { data } = json;

      // 3A) Update local store
      addContentToSpace(data.space_id, {
        id: data.content_id,
        youtube_id: data.youtube_id,
        type: data.type,
        title: data.title,
        thumbnailUrl: data.thumbnail_url,
      });

      // 3B) If user is in a specific space route, refresh so SpacePage sees the new item

      router.replace(`/dashboard/spaces/${data.space_id}`);
    } catch (err) {
      console.error("Error creating content:", err);
    } finally {
      setIsLoading(false)
      setInputValue("");
    }
  };

  // -------------------------------
  // 4) Render
  // -------------------------------
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
                  {/* Left icon: file upload */}
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleFileUpload}
                      disabled={isLoading}
                      className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : <Link2 className="h-5 w-5 text-muted-foreground" />}
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

                  {/* Right icon: submit */}
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
