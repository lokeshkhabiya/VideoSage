"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CustomThemeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/hooks/auth-provider";
import { ChevronLeft, Menu, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar";
import Image from "next/image";
import { DialogTitle } from "@radix-ui/react-dialog";

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
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 backdrop-blur">
      <div className=" flex h-14 items-center my-3 px-2 md:px-12 justify-between w-full">
        <div className="flex items-center">
          <div className=" flex items-center ">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                {/* Add DialogTitle here */}
                <DialogTitle className="sr-only">
                  Sidebar Navigation
                </DialogTitle>
                <Sidebar />
              </SheetContent>
            </Sheet>
          </div>
          <div className="md:flex items-center w-6 h-6 hidden ">
            <Button
              className=" h-8 w-8"
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-3 w-3" />
              <span className="sr-only">Go back</span>
            </Button>
          </div>
          <div className=" flex items-center justify-center md:justify-start">
            <Link className="flex items-center space-x-1" href="/">
              <VideoSageLogo />
              <span className="font-bold text-md md:text-2xl">VideoSage</span>
            </Link>
          </div>
        </div>
        <div className="flex justify-center items-center space-x-4">
          <nav className="md:flex items-center space-x-4 justify-end hidden">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-10 w-10 cursor-pointer">
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-6 dark:bg-gray-900" align="end">
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
                <Button className="border" variant="ghost" asChild>
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button
                  className="bg-gray-900 border text-white"
                  variant="ghost"
                  asChild
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
          <CustomThemeToggle />
        </div>
      </div>
    </header>
  );
}

function VideoSageLogo() {
  return <Image src={"/logo.png"} alt="Logo" width="55" height="55"></Image>;
}
