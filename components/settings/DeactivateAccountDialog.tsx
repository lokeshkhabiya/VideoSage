// components/settings/DeactivateAccountDialog.tsx
"use client";

import * as React from "react";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { DeactivateFormValues } from "./settings-page";

interface DeactivateAccountDialogProps {
  deactivateForm: UseFormReturn<DeactivateFormValues>;
  onDeactivate: (data: DeactivateFormValues) => void;
  isDeactivating: boolean;
}

export function DeactivateAccountDialog({
  deactivateForm,
  onDeactivate,
  isDeactivating,
}: DeactivateAccountDialogProps) {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Once you deactivate your account, all your data will be permanently
          removed. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Deactivate Account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <Form {...deactivateForm}>
              <form onSubmit={deactivateForm.handleSubmit(onDeactivate)}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-6">
                  <FormField
                    control={deactivateForm.control}
                    name="password"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<
                        DeactivateFormValues,
                        "password"
                      >;
                    }) => (
                      <FormItem>
                        <FormLabel>Confirm your password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={isDeactivating}
                    >
                      {isDeactivating && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Deactivate Account
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
