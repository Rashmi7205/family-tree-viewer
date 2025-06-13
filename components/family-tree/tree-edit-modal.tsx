"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { Save, X, TreePine, Globe, Lock, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "../../lib/auth/auth-context";
import { headers } from "next/headers";

interface FamilyTree {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  shareLink: string;
  createdAt: string;
  updatedAt: string;
}

interface TreeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tree: FamilyTree) => void;
  onDelete?: (treeId: string) => void;
  tree: FamilyTree | null;
}

export function TreeEditModal({
  isOpen,
  onClose,
  onSuccess,
  onDelete,
  tree,
}: TreeEditModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const {user} = useAuth();

  useEffect(() => {
    if (tree && isOpen) {
      setFormData({
        name: tree.name,
        description: tree.description || "",
        isPublic: tree.isPublic,
      });
      setError("");
    }
  }, [tree, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tree) return;

    setError("");
    setIsLoading(true);

    try {
      const token = user?.getIdToken();
      const response = await fetch(`/api/family-trees/${tree.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update family tree");
      }

      const updatedTree = { ...tree, ...formData };
      onSuccess(updatedTree);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update family tree"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!tree || !onDelete) return;

    try {
      const token = user?.getIdToken();
      const response = await fetch(`/api/family-trees/${tree.id}`, {
        method: "DELETE",
        headers: {
          Authorization:`Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete family tree");
      }

      onDelete(tree.id);
      setShowDeleteDialog(false);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete family tree"
      );
      setShowDeleteDialog(false);
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
      setError("");
      onClose();
    }
  };

  if (!tree) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="w-[95vw] max-w-lg md:max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TreePine className="h-5 w-5 text-green-600" />
              Edit Family Tree
            </DialogTitle>
            <DialogDescription>
              Update your family tree information and settings.
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
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
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

            {/* Share Link */}
            {formData.isPublic && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <Label className="font-medium">Share Link</Label>
                <div className="mt-1 p-2 bg-white border rounded text-sm font-mono break-all">
                  {`${window.location.origin}/public/${tree.shareLink}`}
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Anyone with this link can view your family tree
                </p>
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-4">
              <div className="flex gap-2">
                {onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Tree
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
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
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Family Tree</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{tree.name}"? This action cannot
              be undone and will permanently remove all family members,
              relationships, and data associated with this tree.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Tree
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
