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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Save, X, Users, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "../../lib/auth/auth-context";

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

interface Relationship {
  id: string;
  member1Id: string;
  member2Id: string;
  relationshipType: string;
  member1: Member;
  member2: Member;
}

interface AddRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (relationship: Relationship) => void;
  familyTreeId: string;
  members: Member[];
  existingRelationships: Relationship[];
}

const relationshipTypes = [
  {
    value: "parent",
    label: "Parent",
    description: "First person is parent of second person",
  },
  {
    value: "child",
    label: "Child",
    description: "First person is child of second person",
  },
  {
    value: "spouse",
    label: "Spouse",
    description: "Both persons are married/partners",
  },
  {
    value: "sibling",
    label: "Sibling",
    description: "Both persons are siblings",
  },
];

export function AddRelationshipModal({
  isOpen,
  onClose,
  onSuccess,
  familyTreeId,
  members,
  existingRelationships,
}: AddRelationshipModalProps) {
  const [formData, setFormData] = useState({
    member1Id: "",
    member2Id: "",
    relationshipType: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setFormData({
      member1Id: "",
      member2Id: "",
      relationshipType: "",
    });
    setError("");
  };
  const {user} = useAuth();
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.member1Id === formData.member2Id) {
      setError("Cannot create a relationship between the same person");
      return;
    }

    // Check for existing relationship
    const existingRelationship = existingRelationships.find(
      (rel) =>
        (rel.member1Id === formData.member1Id &&
          rel.member2Id === formData.member2Id) ||
        (rel.member1Id === formData.member2Id &&
          rel.member2Id === formData.member1Id)
    );

    if (existingRelationship) {
      setError("A relationship already exists between these two members");
      return;
    }

    // Validate relationship logic
    if (formData.relationshipType === "spouse") {
      // Check if either member already has a spouse
      const member1Spouses = existingRelationships.filter(
        (rel) =>
          rel.relationshipType === "spouse" &&
          (rel.member1Id === formData.member1Id ||
            rel.member2Id === formData.member1Id)
      );

      const member2Spouses = existingRelationships.filter(
        (rel) =>
          rel.relationshipType === "spouse" &&
          (rel.member1Id === formData.member2Id ||
            rel.member2Id === formData.member2Id)
      );

      if (member1Spouses.length > 0) {
        const member1 = members.find((m) => m.id === formData.member1Id);
        setError(
          `${member1?.firstName} ${member1?.lastName} already has a spouse relationship`
        );
        return;
      }

      if (member2Spouses.length > 0) {
        const member2 = members.find((m) => m.id === formData.member2Id);
        setError(
          `${member2?.firstName} ${member2?.lastName} already has a spouse relationship`
        );
        return;
      }
    }

    // Validate parent-child logic
    if (
      formData.relationshipType === "parent" ||
      formData.relationshipType === "child"
    ) {
      // Check for circular relationships
      const checkCircularRelationship = (
        startId: string,
        targetId: string,
        visited = new Set<string>()
      ): boolean => {
        if (startId === targetId) return true;
        if (visited.has(startId)) return false;

        visited.add(startId);

        // Find all parent relationships where this member is the child
        const parentRels = existingRelationships.filter(
          (rel) =>
            (rel.relationshipType === "parent" && rel.member2Id === startId) ||
            (rel.relationshipType === "child" && rel.member1Id === startId)
        );

        // Check if any parent leads to the target
        for (const rel of parentRels) {
          const parentId =
            rel.relationshipType === "parent" ? rel.member1Id : rel.member2Id;
          if (checkCircularRelationship(parentId, targetId, visited)) {
            return true;
          }
        }

        return false;
      };

      // For parent relationship, check if child is already an ancestor of the parent
      if (formData.relationshipType === "parent") {
        if (checkCircularRelationship(formData.member2Id, formData.member1Id)) {
          setError(
            "This would create a circular relationship in the family tree"
          );
          return;
        }
      } else if (formData.relationshipType === "child") {
        if (checkCircularRelationship(formData.member1Id, formData.member2Id)) {
          setError(
            "This would create a circular relationship in the family tree"
          );
          return;
        }
      }
    }

    setIsLoading(true);

    try {
      const token = user?.accessToken;
      const response = await fetch(
        `/api/family-trees/${familyTreeId}/relationships`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add relationship");
      }

      const newRelationship = await response.json();
      onSuccess(newRelationship);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add relationship"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  const getMember = (memberId: string) => {
    return members.find((m) => m.id === memberId);
  };

  const getAvailableMembers = (excludeId?: string) => {
    return members.filter((m) => m.id !== excludeId);
  };

  const getSelectedRelationshipType = () => {
    return relationshipTypes.find(
      (rt) => rt.value === formData.relationshipType
    );
  };

  const member1 = getMember(formData.member1Id);
  const member2 = getMember(formData.member2Id);
  const selectedRelType = getSelectedRelationshipType();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Add Family Relationship
          </DialogTitle>
          <DialogDescription>
            Create a relationship between two family members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {members.length < 2 && (
            <Alert>
              <AlertDescription>
                You need at least 2 family members to create a relationship. Add
                more members first.
              </AlertDescription>
            </Alert>
          )}

          {/* First Member */}
          <div>
            <Label htmlFor="member1">First Person</Label>
            <Select
              value={formData.member1Id}
              onValueChange={(value) => handleInputChange("member1Id", value)}
              disabled={isLoading || members.length < 2}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select first person" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={member.profileImageUrl || "/placeholder.svg"}
                        />
                        <AvatarFallback className="text-xs">
                          {member.firstName[0]}
                          {member.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      {member.firstName} {member.lastName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Relationship Type */}
          <div>
            <Label htmlFor="relationshipType">Relationship Type</Label>
            <Select
              value={formData.relationshipType}
              onValueChange={(value) =>
                handleInputChange("relationshipType", value)
              }
              disabled={isLoading || members.length < 2}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select relationship type" />
              </SelectTrigger>
              <SelectContent>
                {relationshipTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500">
                        {type.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Second Member */}
          <div>
            <Label htmlFor="member2">Second Person</Label>
            <Select
              value={formData.member2Id}
              onValueChange={(value) => handleInputChange("member2Id", value)}
              disabled={isLoading || members.length < 2}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select second person" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableMembers(formData.member1Id).map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={member.profileImageUrl || "/placeholder.svg"}
                        />
                        <AvatarFallback className="text-xs">
                          {member.firstName[0]}
                          {member.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      {member.firstName} {member.lastName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Relationship Preview */}
          {member1 && member2 && selectedRelType && (
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <h4 className="font-medium mb-3">Relationship Preview</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={member1.profileImageUrl || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {member1.firstName[0]}
                        {member1.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {member1.firstName} {member1.lastName}
                      </div>
                      <div className="text-sm text-gray-500">First Person</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div className="text-xs font-medium text-center">
                      {selectedRelType.label}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={member2.profileImageUrl || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {member2.firstName[0]}
                        {member2.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {member2.firstName} {member2.lastName}
                      </div>
                      <div className="text-sm text-gray-500">Second Person</div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                  {selectedRelType.description}
                </div>
              </CardContent>
            </Card>
          )}

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
              disabled={
                isLoading ||
                !formData.member1Id ||
                !formData.member2Id ||
                !formData.relationshipType ||
                members.length < 2
              }
              className="w-full sm:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Adding..." : "Add Relationship"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
