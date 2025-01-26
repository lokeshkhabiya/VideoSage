"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/components/auth-provider";
import { ChevronLeft, Menu, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/ui/sidebar";

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gray-900 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className=" flex h-14 items-center my-3 mx-6 justify-between w-full">
        <div className="flex items-center">
          <div className="mr-3 flex items-center ">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <Sidebar />
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex items-center mr-3">
            <Button
              className="border"
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Go back</span>
            </Button>
          </div>
          <div className=" flex items-center justify-center md:justify-start">
            <Link className="flex items-center space-x-2" href="/">
              <VideoSageLogo className="h-6 w-6" />
              <span className="font-bold text-2xl">VideoSage</span>
            </Link>
          </div>
        </div>
        <nav className="flex items-center space-x-4 ">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => router.push("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}

function VideoSageLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 8-6 4 6 4V8Z" />
      <rect x="2" y="6" width="14" height="12" rx="2" ry="2" />
    </svg>
  );
}
