// components/settings/ProfileSettingsForm.tsx
"use client";

import * as React from "react";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { ProfileFormValues } from "./settings-page";

interface ProfileSettingsFormProps {
  form: UseFormReturn<ProfileFormValues>;
  onSubmit: (data: ProfileFormValues) => void;
  isLoading: boolean;
}

export function ProfileSettingsForm({
  form,
  onSubmit,
  isLoading,
}: ProfileSettingsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl mb-4">Profile Settings</CardTitle>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="you@example.com" />
                  </FormControl>
                  <FormDescription>
                    This is your primary email address.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* First & Last Name */}
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<ProfileFormValues, "firstName">;
                }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<ProfileFormValues, "lastName">;
                }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Current Password */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  ProfileFormValues,
                  "currentPassword"
                >;
              }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Only needed if changing your password"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your existing password if you wish to change it.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password & Confirm */}
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="newPassword"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<
                    ProfileFormValues,
                    "newPassword"
                  >;
                }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Only if changing password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<
                    ProfileFormValues,
                    "confirmNewPassword"
                  >;
                }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Must match new password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
