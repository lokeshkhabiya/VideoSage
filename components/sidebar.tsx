"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/auth-provider";
import { Home, Settings, LogOut, Plus } from "lucide-react";
import { CreateSpaceDialog } from "@/components/create-space-dialog";
import Image from "next/image";
import { useSpaces } from "@/hooks/space-provider";

export function Sidebar() {
  const { user, logout } = useAuth();
  const { spaces, addSpace } = useSpaces();
  const router = useRouter();

  const onCreateSpace = (name: string) => {
    const newSpace = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
    };
    addSpace(newSpace);
  };

  return (
    <div className="flex flex-col h-full w-full dark:bg-gray-900">
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center space-x-2">
          <VideoSageLogo />
          <span className="font-bold">VideoSage</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>

          {user && (
            <div className="pt-4 space-y-2">
              <div className="mb-2 space-y-2">
                <h2 className="mb-3 px-2 text-lg font-semibold tracking-tight">
                  Spaces
                </h2>
                {spaces.map((space) => (
                  <Button
                    key={space.id}
                    variant="ghost"
                    className="w-full justify-start border"
                    asChild
                  >
                    <Link href={`/dashboard/spaces/${space.id}`}>
                      {space.name}
                    </Link>
                  </Button>
                ))}
              </div>

              <CreateSpaceDialog onCreateSpace={onCreateSpace}>
                <Button variant="ghost" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Space
                </Button>
              </CreateSpaceDialog>
            </div>
          )}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => router.push("/settings")}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
        {user && (
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500"
            onClick={() => logout()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        )}
      </div>
    </div>
  );
}

function VideoSageLogo() {
  return <Image alt="Logo" src={"/logo.png"} width="55" height="55" />;
}
