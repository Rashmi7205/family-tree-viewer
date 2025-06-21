"use client";

import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Heart, Calendar, User } from "lucide-react";

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

interface TreeNodeCardProps {
  member: Member;
  isSelected?: boolean;
  isHovered?: boolean;
  isOwner?: boolean;
  onEdit?: (member: Member) => void;
  onClick?: (member: Member) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function TreeNodeCard({
  member,
  isSelected = false,
  isHovered = false,
  isOwner = false,
  onEdit,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: TreeNodeCardProps) {
  const getAge = () => {
    if (!member.birthDate) return null;
    const birth = new Date(member.birthDate);
    const end = member.deathDate ? new Date(member.deathDate) : new Date();
    return Math.floor(
      (end.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
  };

  const getInitials = () => {
    return `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();
  };

  const isLiving = !member.deathDate;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(member);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(member);
    }
  };

  return (
    <Card
      className={`
        w-48 cursor-pointer transition-all duration-200 hover:shadow-lg
        ${isSelected ? "ring-2 ring-blue-500 shadow-lg" : ""}
        ${isHovered ? "shadow-md scale-105" : ""}
        ${
          isLiving
            ? "border-l-4 border-l-green-500"
            : "border-l-4 border-l-gray-400"
        }
      `}
      onClick={handleCardClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Header with Avatar and Edit Button */}
          <div className="flex items-start justify-between">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={
                  member.profileImageUrl ||
                  "/placeholder.svg?height=48&width=48"
                }
                alt={`${member.firstName} ${member.lastName}`}
              />
              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleEditClick}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Name and Status */}
          <div>
            <h3 className="font-semibold text-sm leading-tight flex items-center gap-1">
              {member.firstName} {member.lastName}
              {isLiving && (
                <Heart className="h-3 w-3 text-red-500" fill="currentColor" />
              )}
            </h3>

            {member.gender && (
              <Badge variant="outline" className="text-xs mt-1">
                {member.gender}
              </Badge>
            )}
          </div>

          {/* Birth/Death Information */}
          <div className="space-y-1">
            {member.birthDate && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Calendar className="h-3 w-3" />
                <span>Born: {new Date(member.birthDate).getFullYear()}</span>
              </div>
            )}

            {member.deathDate && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Calendar className="h-3 w-3" />
                <span>Died: {new Date(member.deathDate).getFullYear()}</span>
              </div>
            )}

            {getAge() && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <User className="h-3 w-3" />
                <span>
                  {isLiving
                    ? `${getAge()} years old`
                    : `Lived ${getAge()} years`}
                </span>
              </div>
            )}
          </div>

          {/* Bio Preview */}
          {member.bio && (
            <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
              {member.bio}
            </p>
          )}

          {/* Status Indicator */}
          <div className="flex justify-center">
            <Badge
              variant={isLiving ? "default" : "secondary"}
              className="text-xs"
            >
              {isLiving ? "Living" : "Deceased"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
