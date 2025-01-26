"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Link2,
  Mic,
  Plus,
  Upload,
  Video,
  FileText,
  ArrowRight,
  Box,
} from "lucide-react";
import Link from "next/link";
import { CreateSpaceDialog } from "@/components/create-space-dialog";

export default function Dashboard() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [activeSpace, setActiveSpace] = useState("default");
  const [spaces, setSpaces] = useState([
    { id: "default", name: "Default Space", count: 3 },
    { id: "web-dev", name: "Web Development", count: 5 },
    { id: "ai", name: "AI & Machine Learning", count: 2 },
  ]);
  const [content, setContent] = useState([
    {
      id: "1",
      title: "MongoDB Tutorial",
      type: "video",
      space: "default",
      date: "2 hours ago",
      thumbnail: "/placeholder.svg?height=100&width=200",
    },
    {
      id: "2",
      title: "React Fundamentals",
      type: "video",
      space: "web-dev",
      date: "1 day ago",
      thumbnail: "/placeholder.svg?height=100&width=200",
    },
    {
      id: "3",
      title: "TypeScript Handbook",
      type: "document",
      space: "ai",
      date: "3 days ago",
    },
  ]);

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
          <section className="flex flex-col items-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl">
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
          </section>

          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold tracking-tight">My spaces</h2>
              <CreateSpaceDialog
                onCreateSpace={(name) => {
                  const newSpace = {
                    id: name.toLowerCase().replace(/\s+/g, "-"),
                    name,
                    count: 0,
                  };
                  setSpaces([...spaces, newSpace]);
                }}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {spaces.map((space) => (
                <Link
                  key={space.id}
                  href={`/spaces/${space.id}`}
                  className="group relative rounded-lg border p-6 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold tracking-tight">
                        {space.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {space.count} items
                      </p>
                    </div>
                    <Box className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              ))}
              <CreateSpaceDialog
                onCreateSpace={(name) => {
                  const newSpace = {
                    id: name.toLowerCase().replace(/\s+/g, "-"),
                    name,
                    count: 0,
                  };
                  setSpaces([...spaces, newSpace]);
                }}
              >
                <Button
                  variant="outline"
                  className="h-[116px] justify-center rounded-lg border border-dashed w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add space
                </Button>
              </CreateSpaceDialog>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
