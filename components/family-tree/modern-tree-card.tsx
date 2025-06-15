"use client";

import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Heart, Calendar, User, MapPin, Phone, Mail } from "lucide-react";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  gender?: string;
  profileImageUrl?: string;
  bio?: string;
  phone?: string;
  email?: string;
  location?: string;
}

interface ModernTreeCardProps {
  member: Member;
  isSelected?: boolean;
  isHovered?: boolean;
  isOwner?: boolean;
  onEdit?: (member: Member) => void;
  onClick?: (member: Member) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  relationshipCount?: number;
  gradientType?: "blue" | "purple" | "green" | "orange" | "pink" | "teal";
}

export function ModernTreeCard({
  member,
  isSelected = false,
  isHovered = false,
  isOwner = false,
  onEdit,
  onClick,
  onMouseEnter,
  onMouseLeave,
  relationshipCount = 0,
  gradientType = "blue",
}: ModernTreeCardProps) {
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

  // Gradient configurations
  const gradients = {
    blue: "from-blue-500 via-blue-600 to-blue-700",
    purple: "from-purple-500 via-purple-600 to-purple-700",
    green: "from-green-500 via-green-600 to-green-700",
    orange: "from-orange-500 via-orange-600 to-orange-700",
    pink: "from-pink-500 via-pink-600 to-pink-700",
    teal: "from-teal-500 via-teal-600 to-teal-700",
  };

  const accentColors = {
    blue: "border-blue-300",
    purple: "border-purple-300",
    green: "border-green-300",
    orange: "border-orange-300",
    pink: "border-pink-300",
    teal: "border-teal-300",
  };

  return (
    <div
      className={`
        relative w-72 h-96 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group
        ${
          isSelected
            ? "ring-4 ring-white ring-opacity-60 shadow-2xl scale-105"
            : ""
        }
        ${isHovered ? "shadow-xl scale-102" : "shadow-lg"}
        bg-gradient-to-br ${gradients[gradientType]}
      `}
      onClick={handleCardClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20 blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-white/10 blur-lg"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-white/5 blur-2xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-1 rounded-full border-2 ${accentColors[gradientType]} bg-white/20 backdrop-blur-sm`}
            >
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={
                    member.profileImageUrl ||
                    "/placeholder.svg?height=64&width=64"
                  }
                  alt={`${member.firstName} ${member.lastName}`}
                  className="object-cover"
                />
                <AvatarFallback className="bg-white/90 text-gray-800 font-bold text-lg">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
            {isLiving && (
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                <Heart className="h-3 w-3 text-red-400" fill="currentColor" />
                <span className="text-xs text-white font-medium">Living</span>
              </div>
            )}
          </div>

          {isOwner && (
            <button
              onClick={handleEditClick}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Edit className="h-4 w-4 text-white" />
            </button>
          )}
        </div>

        {/* Name and Title */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white leading-tight">
            {member.firstName}
          </h3>
          <h4 className="text-lg font-semibold text-white/90">
            {member.lastName}
          </h4>

          {member.gender && (
            <Badge className="mt-2 bg-white/20 text-white border-white/30 hover:bg-white/30">
              {member.gender}
            </Badge>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 space-y-3">
          {/* Age and Dates */}
          {getAge() && (
            <div className="flex items-center gap-2 text-white/90">
              <User className="h-4 w-4" />
              <span className="text-sm">
                {isLiving ? `${getAge()} years old` : `Lived ${getAge()} years`}
              </span>
            </div>
          )}

          {member.birthDate && (
            <div className="flex items-center gap-2 text-white/80">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                Born {new Date(member.birthDate).getFullYear()}
                {member.deathDate &&
                  ` - ${new Date(member.deathDate).getFullYear()}`}
              </span>
            </div>
          )}

          {/* Contact Info */}
          {member.phone && (
            <div className="flex items-center gap-2 text-white/80">
              <Phone className="h-4 w-4" />
              <span className="text-sm truncate">{member.phone}</span>
            </div>
          )}

          {member.email && (
            <div className="flex items-center gap-2 text-white/80">
              <Mail className="h-4 w-4" />
              <span className="text-sm truncate">{member.email}</span>
            </div>
          )}

          {member.location && (
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="h-4 w-4" />
              <span className="text-sm truncate">{member.location}</span>
            </div>
          )}
        </div>

        {/* Bio Preview */}
        {member.bio && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mt-3">
            <p className="text-sm text-white/90 line-clamp-3 leading-relaxed">
              {member.bio}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80">
              <User className="h-4 w-4" />
              <span className="text-sm">{relationshipCount} connections</span>
            </div>

            <button
              onClick={handleCardClick}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/30 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="absolute top-4 left-4 flex gap-1">
          <div
            className={`w-2 h-2 rounded-full ${
              isLiving ? "bg-green-400" : "bg-gray-400"
            }`}
          />
          <div
            className={`w-2 h-2 rounded-full ${
              member.bio ? "bg-blue-400" : "bg-white/30"
            }`}
          />
          <div
            className={`w-2 h-2 rounded-full ${
              relationshipCount > 0 ? "bg-purple-400" : "bg-white/30"
            }`}
          />
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
