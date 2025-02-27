"use client";

import { useParams } from "next/navigation";
import { Video, FileText } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/auth-provider";
import { useSpaces } from "@/hooks/space-provider";
import Image from "next/image";

/** Shape of each content item in the space. */

export default function SpacePage() {
  const { id } = useParams();
  const { spaces, loading } = useSpaces();
  const { isAuthenticated } = useAuth();

  // Show loading state if not authenticated or still loading spaces
  if (!isAuthenticated || loading) {
    return <p>Loading...</p>;
  }

  // Find the specific space by ID from the global store
  const spaceData = spaces.find((space) => space.id === id) || null;

  if (!spaceData) {
    return <p>Space not found</p>;
  }

  return (
    <div className="min-h-full dark:bg-gray-900">
      <main className="container py-6">
        <div className="flex flex-col space-y-8">
          {/* Space Name */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {spaceData.name}
            </h1>
          </div>

          {/* Contents Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {spaceData.contents?.map((item) => (
              <Link
                key={item.id}
                href={`/content/${item.id}`}
                className="group relative rounded-lg border overflow-hidden hover:border-primary transition-colors"
              >
                {/* Render content type */}
                {item.type === "YOUTUBE_CONTENT" ? (
                  <div className="aspect-video bg-muted relative">
                    <Image
                      src={item.thumbnailUrl || "/placeholder.svg"}
                      alt={item.title || "No title"}
                      width={640}
                      height={360}
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
                {/* Content Details */}
                <div className="p-4">
                  <h3 className="font-semibold tracking-tight group-hover:text-primary transition-colors">
                    {item.title || "Untitled"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : ""}
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
