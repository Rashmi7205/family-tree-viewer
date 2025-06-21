"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Phone, Mail, User, Heart, Edit } from "lucide-react";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  gender?: string;
  profileImageUrl?: string;
  bio?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
}

interface Relationship {
  id: string;
  member1Id: string;
  member2Id: string;
  relationshipType: string;
  member1?: Member;
  member2?: Member;
}

interface MemberDetailModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (member: Member) => void;
  relationships: Relationship[];
  isOwner?: boolean;
}

export function MemberDetailModal({
  member,
  isOpen,
  onClose,
  onEdit,
  relationships,
  isOwner = false,
}: MemberDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "relationships">("info");

  if (!member) return null;

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

  const isLiving = !member.deathDate;

  const getMemberRelationships = () => {
    if (!relationships || !Array.isArray(relationships)) return [];

    return relationships
      .filter((rel) => {
        // Ensure relationship has valid member1 and member2 objects
        return (
          rel &&
          ((rel.member1Id === member.id && rel.member2) ||
            (rel.member2Id === member.id && rel.member1))
        );
      })
      .map((rel) => {
        const otherMember =
          rel.member1Id === member.id ? rel.member2 : rel.member1;
        if (!otherMember) return null;

        let relationshipLabel = "";
        if (rel.relationshipType === "parent" && rel.member1Id === member.id) {
          relationshipLabel = "Parent of";
        } else if (
          rel.relationshipType === "parent" &&
          rel.member2Id === member.id
        ) {
          relationshipLabel = "Child of";
        } else if (
          rel.relationshipType === "child" &&
          rel.member1Id === member.id
        ) {
          relationshipLabel = "Child of";
        } else if (
          rel.relationshipType === "child" &&
          rel.member2Id === member.id
        ) {
          relationshipLabel = "Parent of";
        } else if (rel.relationshipType === "spouse") {
          relationshipLabel = "Spouse of";
        } else if (rel.relationshipType === "sibling") {
          relationshipLabel = "Sibling of";
        }

        return {
          id: rel.id,
          type: rel.relationshipType,
          label: relationshipLabel,
          member: otherMember,
        };
      })
      .filter(Boolean); // Remove null entries
  };

  const memberRelationships = getMemberRelationships();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Member Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this family member.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column - Photo and basic info */}
          <div className="md:w-1/3 flex flex-col items-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage
                src={
                  member.profileImageUrl ||
                  "/placeholder.svg?height=128&width=128"
                }
                alt={`${member.firstName} ${member.lastName}`}
              />
              <AvatarFallback className="text-3xl bg-blue-100 text-blue-700">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-xl font-bold text-center">
              {member.firstName} {member.lastName}
            </h2>

            <div className="flex items-center gap-2 mt-1 mb-4">
              {member.gender && (
                <Badge variant="outline">{member.gender}</Badge>
              )}
              {isLiving ? (
                <Badge className="bg-green-500">
                  <Heart className="h-3 w-3 mr-1" fill="currentColor" />
                  Living
                </Badge>
              ) : (
                <Badge variant="secondary">Deceased</Badge>
              )}
            </div>

            {/* Tabs */}
            <div className="flex w-full border-b mb-4">
              <button
                className={`flex-1 py-2 text-center text-sm font-medium ${
                  activeTab === "info"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("info")}
              >
                Information
              </button>
              <button
                className={`flex-1 py-2 text-center text-sm font-medium ${
                  activeTab === "relationships"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("relationships")}
              >
                Relationships ({memberRelationships.length})
              </button>
            </div>

            {/* Actions */}
            {isOwner && (
              <div className="w-full mt-auto space-y-2">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  onClick={() => onEdit?.(member)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Member
                </Button>
              </div>
            )}
          </div>

          {/* Right column - Details */}
          <div className="md:w-2/3">
            {activeTab === "info" ? (
              <div className="space-y-4">
                {/* Birth/Death Information */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">DATES</h3>
                  {member.birthDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        <span className="font-medium">Born:</span>{" "}
                        {new Date(member.birthDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {member.deathDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        <span className="font-medium">Died:</span>{" "}
                        {new Date(member.deathDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {getAge() && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>
                        <span className="font-medium">
                          {isLiving ? "Age:" : "Lived:"}
                        </span>{" "}
                        {getAge()} years
                      </span>
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">CONTACT</h3>
                  {member.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{member.phoneNumber}</span>
                    </div>
                  )}

                  {member.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{member.email}</span>
                    </div>
                  )}

                  {member.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{member.address}</span>
                    </div>
                  )}

                  {!member.phoneNumber && !member.email && !member.address && (
                    <div className="text-sm text-gray-500 italic">
                      No contact information available
                    </div>
                  )}
                </div>

                {/* Biography */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">
                    BIOGRAPHY
                  </h3>
                  {member.bio ? (
                    <p className="text-sm whitespace-pre-line">{member.bio}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No biography available
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500">
                  FAMILY RELATIONSHIPS
                </h3>

                {memberRelationships.length > 0 ? (
                  <div className="space-y-3">
                    {/* Group relationships by type */}
                    {["parent", "child", "spouse", "sibling"].map((relType) => {
                      const typeRelationships = memberRelationships.filter(
                        (rel) => rel.type === relType
                      );
                      if (typeRelationships.length === 0) return null;

                      return (
                        <div key={relType} className="space-y-2">
                          <h4 className="text-sm font-medium capitalize">
                            {relType} Relationships
                          </h4>
                          <div className="space-y-2">
                            {typeRelationships.map((rel) => (
                              <div
                                key={rel.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage
                                      src={
                                        rel.member.profileImageUrl ||
                                        "/placeholder.svg?height=32&width=32"
                                      }
                                      alt={`${rel.member.firstName} ${rel.member.lastName}`}
                                    />
                                    <AvatarFallback className="text-xs">
                                      {rel.member.firstName?.[0]}
                                      {rel.member.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-sm">
                                      {rel.member.firstName}{" "}
                                      {rel.member.lastName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {rel.label}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    No relationships found for this member
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
