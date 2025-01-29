"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth-provider";
import { useSpaces } from "@/hooks/space-provider";
import { CreateSpaceDialog } from "@/components/create-space-dialog";
import { Box, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Now we rely on the spaces fetched in RootLayout.
 * We do NOT do another fetch here to avoid duplication.
 */
export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const { spaces, loading, addSpace } = useSpaces();
  const router = useRouter();

  // If not authenticated, redirect.
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/signin");
    }
  }, [isAuthenticated, router]);

  // Show a loading state until we have spaces from the store.
  if (!isAuthenticated || loading) {
    return <p>Loading...</p>;
  }

  // Handler for creating a new space
  async function handleCreateSpace(name: string) {
    if (!user?.token) return;
    try {
      // Call POST /api/spaces
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create space");
      const created = await res.json(); // { id, name, createdAt }
      addSpace({
        id: created.id,
        name: created.name,
        createdAt: created.createdAt,
        contents: [], // new space has empty content
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="min-h-full dark:bg-gray-900">
      <main className="container py-6">
        <div className="flex flex-col space-y-8">
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold tracking-tight">My spaces</h2>
              <CreateSpaceDialog onCreateSpace={handleCreateSpace} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {spaces.map((space) => (
                <Link
                  key={space.id}
                  href={`/dashboard/spaces/${space.id}`}
                  className="group relative rounded-lg border p-6 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold tracking-tight">
                        {space.name}
                      </h3>
                      {/* 
                      If you track item count: 
                      <p className="text-sm text-muted-foreground">
                        {space.contents?.length || 0} items
                      </p>
                      */}
                    </div>
                    <Box className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              ))}

              {/* "Add space" button card, if you prefer this style */}
              <CreateSpaceDialog onCreateSpace={handleCreateSpace}>
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
