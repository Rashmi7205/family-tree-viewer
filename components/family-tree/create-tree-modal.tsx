"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, X, TreePine, Globe, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "../../lib/auth/auth-context";

interface CreateTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (treeId: string) => void;
}

export function CreateTreeModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTreeModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: false,
  });
  const {user} = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const token = await user?.getIdToken();
      const response = await fetch("/api/family-trees", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        throw new Error(errorData.error || "Failed to create family tree");
      }

      const newTree = await response.json();
      console.log("New tree created:", newTree);

      // Reset form
      setFormData({
        name: "",
        description: "",
        isPublic: false,
      });

      if (onSuccess) {
        onSuccess(newTree.id);
      } else {
        router.push(`/trees/${newTree.id}`);
      }

      onClose();
    } catch (err) {
      console.error("Form submission error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create family tree"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: "",
        description: "",
        isPublic: false,
      });
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-lg md:max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TreePine className="h-5 w-5 text-green-600" />
            Create New Family Tree
          </DialogTitle>
          <DialogDescription>
            Start building your family history by creating a new family tree.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Tree Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Family Tree Name *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., The Smith Family"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Choose a name for your family tree
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your family tree..."
              disabled={isLoading}
            />
          </div>

          {/* Privacy Settings */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {formData.isPublic ? (
                    <Globe className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-600" />
                  )}
                  <Label htmlFor="isPublic" className="font-medium">
                    {formData.isPublic ? "Public Tree" : "Private Tree"}
                  </Label>
                </div>
                <p className="text-sm text-gray-600">
                  {formData.isPublic
                    ? "Anyone with the link can view this tree"
                    : "Only you can view this tree"}
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  handleInputChange("isPublic", checked)
                }
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="w-full sm:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Creating..." : "Create Family Tree"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
