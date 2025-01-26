"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, FileText, ArrowRight, Link2, Mic } from "lucide-react";
import Link from "next/link";

export default function SpacePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // This would typically come from an API/database
  const space = {
    id,
    name:
      id === "web-dev"
        ? "Web Development"
        : id === "ai"
        ? "AI & Machine Learning"
        : "Default Space",
  };

  const content = [
    {
      id: "1",
      title: "MongoDB Tutorial",
      type: "video",
      date: "2 hours ago",
      thumbnail: "/placeholder.svg?height=100&width=200",
    },
    {
      id: "2",
      title: "React Fundamentals",
      type: "video",
      date: "1 day ago",
      thumbnail: "/placeholder.svg?height=100&width=200",
    },
    {
      id: "3",
      title: "TypeScript Handbook",
      type: "document",
      date: "3 days ago",
    },
  ];

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

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Handle recording logic
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
    <div className="min-h-screen bg-background">
      <main className="container py-6">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{space.name}</h1>
            <p className="text-muted-foreground">
              Add content to your space or browse existing materials
            </p>
          </div>

          <div className="w-full max-w-3xl mx-auto">
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
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`p-2 hover:bg-muted rounded-full transition-colors ${
                      isRecording ? "text-red-500" : "text-muted-foreground"
                    }`}
                  >
                    <Mic className="h-5 w-5" />
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
                  className="pl-24 pr-12 h-14 text-lg bg-background"
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

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.map((item) => (
              <Link
                key={item.id}
                href={`/content/${item.id}`}
                className="group relative rounded-lg border overflow-hidden hover:border-primary transition-colors"
              >
                {item.type === "video" ? (
                  <div className="aspect-video bg-muted relative">
                    <img
                      src={item.thumbnail || "/placeholder.svg"}
                      alt={item.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    <Video className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white" />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold tracking-tight group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.date}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
