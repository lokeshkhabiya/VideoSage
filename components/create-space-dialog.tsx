"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface CreateSpaceDialogProps {
  onCreateSpace: (name: string) => void;
  children?: React.ReactNode; // Allow children to be passed
}

export function CreateSpaceDialog({ onCreateSpace }: CreateSpaceDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [spaceName, setSpaceName] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (spaceName.trim()) {
      onCreateSpace(spaceName);
      setSpaceName("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="dark:bg-gray-900 border" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          New Space
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create new space</DialogTitle>
          <DialogDescription>
            Create a new space to organize your content. You can add videos,
            documents, and more.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Space name</Label>
              <Input
                id="name"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                placeholder="Enter space name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!spaceName.trim()}>
              Create space
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
