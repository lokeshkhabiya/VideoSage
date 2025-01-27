"use client";

import { useParams } from "next/navigation";
import { Video, FileText, ArrowRight, Link2, Mic } from "lucide-react";
import Link from "next/link";

export default function SpacePage() {
  const { id } = useParams();

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

  return (
    <div className="min-h-full dark:bg-gray-900">
      <main className="container py-6">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{space.name}</h1>
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
