// components/settings/SettingsPage.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { ProfileSettingsForm } from "./ProfileSettingsForm";
import { DeactivateAccountDialog } from "./DeactivateAccountDialog";

const profileFormSchema = z
  .object({
    email: z
      .string()
      .email("Invalid email address")
      .min(1, "Email is required"),
    firstName: z
      .string()
      .min(1, { message: "First name is required" })
      .max(50, { message: "First name cannot exceed 50 characters" }),
    lastName: z
      .string()
      .min(1, { message: "Last name is required" })
      .max(50, { message: "Last name cannot exceed 50 characters" }),

    // Make password fields optional
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const { currentPassword, newPassword, confirmNewPassword } = data;

    // If user enters newPassword or confirmNewPassword, they must provide currentPassword.
    const wantsToChangePassword =
      Boolean(newPassword) || Boolean(confirmNewPassword);

    if (wantsToChangePassword) {
      // Must provide current password
      if (!currentPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["currentPassword"],
          message:
            "Please enter your current password to change your password.",
        });
      }

      // newPassword is required if user is changing password
      if (!newPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["newPassword"],
          message: "New password is required if you want to change it.",
        });
      } else if (newPassword.length < 8) {
        ctx.addIssue({
          code: "custom",
          path: ["newPassword"],
          message: "New password must be at least 8 characters.",
        });
      }

      // confirmNewPassword is required if user is changing password
      if (!confirmNewPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmNewPassword"],
          message: "Please confirm your new password.",
        });
      }

      // newPassword and confirmNewPassword must match
      if (
        newPassword &&
        confirmNewPassword &&
        newPassword !== confirmNewPassword
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmNewPassword"],
          message: "New passwords do not match.",
        });
      }
    }
  });

const deactivateFormSchema = z.object({
  password: z.string().min(1, { message: "Password is required" }),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type DeactivateFormValues = z.infer<typeof deactivateFormSchema>;

export function SettingsPage() {
  const router = useRouter();

  // State for Profile form submission
  const [isLoading, setIsLoading] = React.useState(false);

  // State for Deactivate form submission
  const [isDeactivating, setIsDeactivating] = React.useState(false);

  // -- Profile Form Setup --
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // -- Deactivate Form Setup --
  const deactivateForm = useForm<DeactivateFormValues>({
    resolver: zodResolver(deactivateFormSchema),
    defaultValues: {
      password: "",
    },
  });

  // -- Update Profile Submit Handler --
  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);
    try {
      const wantsToChangePassword = data.newPassword!.length > 0;

      if (wantsToChangePassword) {
        // Validate current password on your backend, update to newPassword, etc.
      }

      // Simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Profile updated successfully");

      // Clear password fields after success
      form.reset({
        ...data,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  }

  // -- Deactivate Account Submit Handler --
  async function onDeactivate(data: DeactivateFormValues) {
    setIsDeactivating(true);
    try {
      // Here you would verify the password and deactivate the account
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Account deactivated successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to deactivate account");
    } finally {
      setIsDeactivating(false);
    }
  }

  return (
    <div className=" max-w-full p-6 space-y-8">
      {/* ---- PROFILE SETTINGS ---- */}
      <ProfileSettingsForm
        form={form}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />

      {/* ---- DANGER ZONE ---- */}
      <DeactivateAccountDialog
        deactivateForm={deactivateForm}
        onDeactivate={onDeactivate}
        isDeactivating={isDeactivating}
      />
    </div>
  );
}
