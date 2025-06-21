"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Eye,
  Edit,
  Share2,
  Trash2,
  MoreVertical,
  Users,
  GitBranch,
  Calendar,
  Globe,
  Lock,
  TreePine,
} from "lucide-react";

interface FamilyTree {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  shareLink: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    members: number;
    relationships: number;
  };
}

interface TreeCardProps {
  tree: FamilyTree;
  onEdit?: (tree: FamilyTree) => void;
  onDelete?: (treeId: string) => void;
  onShare?: (tree: FamilyTree) => void;
}

export function TreeCard({ tree, onEdit, onDelete, onShare }: TreeCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(tree.id);
    }
    setShowDeleteDialog(false);
  };

  const handleShare = async () => {
    if (onShare) {
      onShare(tree);
    } else {
      const shareUrl = `${window.location.origin}/public/${tree.shareLink}`;
      if (navigator.share) {
        await navigator.share({
          title: tree.name,
          text: `Check out this family tree: ${tree.name}`,
          url: shareUrl,
        });
      } else {
        navigator.clipboard.writeText(shareUrl);
      }
    }
  };

  const getTreeInitials = () => {
    return tree.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    if (diffInHours < 720) return `${Math.floor(diffInHours / 168)}w ago`;
    return `${Math.floor(diffInHours / 720)}mo ago`;
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                  {getTreeInitials()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg flex items-center gap-2 truncate">
                  <TreePine className="h-4 w-4 text-green-600 flex-shrink-0" />
                  {tree.name}
                </CardTitle>
                {tree.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {tree.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={tree.isPublic ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {tree.isPublic ? (
                      <>
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </>
                    )}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {tree._count.members} members
                  </Badge>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/trees/${tree.id}`}
                    className="flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Tree
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(tree)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Tree
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Tree
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Statistics */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{tree._count.members}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitBranch className="h-4 w-4" />
                <span>{tree._count.relationships}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{getTimeAgo(tree.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href={`/trees/${tree.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Tree
              </Button>
            </Link>
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Metadata */}
          <div className="mt-4 pt-4 border-t text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Created: {formatDate(tree.createdAt)}</span>
              <span>Updated: {formatDate(tree.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

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
