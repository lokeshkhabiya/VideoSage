"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import { useAuth } from "@/hooks/auth-provider";

interface DecodedToken {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
}

export default function SignIn() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const pathname = usePathname();

  useEffect(() => {
    if (user) {
      if (pathname === "/signin") {
        router.replace("/dashboard");
      }
    } else if (!user && pathname !== "/signin") {
      router.replace("/signin");
    }
  }, [user, pathname, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/users/signin", {
        username: formData.username,
        password: formData.password,
      });

      if (
        response?.data &&
        typeof response.data === "object" &&
        "token" in response.data &&
        response.status === 200
      ) {
        const token = response.data.token as string;
        const decodedToken: DecodedToken = JSON.parse(
          atob(token.split(".")[1])
        );

        login({
          user_id: decodedToken.user_id,
          username: decodedToken.username,
          first_name: decodedToken.first_name,
          last_name: decodedToken.last_name,
          email: formData.username, // Assuming username is the email
          name: `${decodedToken.first_name} ${decodedToken.last_name}`, // Construct the name
          token,
        });

        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="flex-col md:flex-row flex w-full max-w-6xl gap-8 h-[80vh]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 rounded-2xl bg-black dark:bg-white text-white dark:text-black p-8 flex flex-col justify-center h-full"
        >
          <blockquote className="text-2xl font-serif italic mb-4">
            &ldquo;Education is not the filling of a pail, but the lighting of a
            fire.&rdquo;
          </blockquote>
          <p className="text-lg">- W.B. Yeats</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex justify-center items-center"
        >
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Sign In to VideoSage
              </CardTitle>
              <CardDescription>
                Welcome back! Please enter your details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Username / Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="username"
                      name="username"
                      type="username"
                      placeholder="you@example.com"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-blue-600 hover:underline">
                  Sign Up
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
