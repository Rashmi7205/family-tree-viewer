"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Heart,
  MoreVertical,
} from "lucide-react";
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

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  gender?: string;
  profileImageUrl?: string;
  bio?: string;
}

interface MemberCardProps {
  member: Member;
  isOwner?: boolean;
  onEdit?: (member: Member) => void;
  onDelete?: (memberId: string) => void;
  onViewDetails?: (member: Member) => void;
  relationships?: Array<{
    id: string;
    relationshipType: string;
    member1: Member;
    member2: Member;
  }>;
}

export function MemberCard({
  member,
  isOwner = false,
  onEdit,
  onDelete,
  onViewDetails,
  relationships = [],
}: MemberCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getAge = () => {
    if (!member.birthDate) return null;

    const birth = new Date(member.birthDate);
    const end = member.deathDate ? new Date(member.deathDate) : new Date();
    const age = Math.floor(
      (end.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );

    return age;
  };

  const getInitials = () => {
    return `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();
  };

  const getRelationshipCount = () => {
    return relationships.filter(
      (rel) => rel.member1.id === member.id || rel.member2.id === member.id
    ).length;
  };

  const isLiving = !member.deathDate;

  const handleDelete = () => {
    if (onDelete) {
      onDelete(member.id);
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={member.profileImageUrl || "/placeholder.svg"}
                  alt={`${member.firstName} ${member.lastName}`}
                />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {member.firstName} {member.lastName}
                  {isLiving && (
                    <Heart
                      className="h-4 w-4 text-red-500"
                      fill="currentColor"
                    />
                  )}
                </CardTitle>

                <div className="flex items-center gap-2 mt-1">
                  {member.gender && (
                    <Badge variant="outline" className="text-xs">
                      {member.gender}
                    </Badge>
                  )}
                  {getAge() && (
                    <Badge variant="secondary" className="text-xs">
                      {isLiving
                        ? `${getAge()} years old`
                        : `Lived ${getAge()} years`}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {isOwner && (
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
                  <DropdownMenuItem onClick={() => onViewDetails?.(member)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(member)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Member
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0" onClick={() => onViewDetails?.(member)}>
          {/* Birth/Death Information */}
          <div className="space-y-2 mb-4">
            {member.birthDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  Born: {new Date(member.birthDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {member.deathDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  Died: {new Date(member.deathDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Bio Preview */}
          {member.bio && (
            <div className="mb-4">
              <p className="text-sm text-gray-700 line-clamp-3">{member.bio}</p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{getRelationshipCount()} connections</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(member);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Family Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {member.firstName}{" "}
              {member.lastName}? This action cannot be undone and will also
              remove all relationships associated with this member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
