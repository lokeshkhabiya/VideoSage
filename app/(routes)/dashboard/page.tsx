"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Box } from "lucide-react";
import Link from "next/link";
import { CreateSpaceDialog } from "@/components/create-space-dialog";

export default function Dashboard() {
  const [spaces, setSpaces] = useState([
    { id: "default", name: "Default Space", count: 3 },
    { id: "web-dev", name: "Web Development", count: 5 },
    { id: "ai", name: "AI & Machine Learning", count: 2 },
  ]);

  return (
    <div className="min-h-screen dark:bg-gray-900">
      <main className="container py-6">
        <div className="flex flex-col space-y-8">
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
                  href={`dashboard/spaces/${space.id}`}
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
