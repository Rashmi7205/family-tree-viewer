import { FC, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FamilyMember } from "./types";
import { Badge } from "@/components/ui/badge";

interface AddEditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void | Promise<void>;
  memberData: Omit<FamilyMember, "id" | "familyTreeId"> | FamilyMember | null;
  setMemberData: (data: any) => void;
  allMembers: FamilyMember[];
  validation: {
    isValidParent: (id: string) => boolean;
    isValidChild: (id: string) => boolean;
    isValidSpouse: (id: string) => boolean;
  };
  isEditMode: boolean;
}

export const AddEditMemberModal: FC<AddEditMemberModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  memberData,
  setMemberData,
  allMembers,
  validation,
  isEditMode,
}) => {
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && memberData?.profileImageUrl) {
        setProfileImagePreview(memberData.profileImageUrl);
      } else {
        setProfileImagePreview(null);
      }
      setProfileImageFile(null);
    }
  }, [isOpen, isEditMode, (memberData as FamilyMember)?.id]);

  if (!memberData) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImageFile(null);
      setProfileImagePreview(
        isEditMode ? memberData?.profileImageUrl ?? null : null
      );
    }
  };

  const handleSelectChange = (field: "parents" | "children", value: string) => {
    if (value && !memberData[field]?.includes(value)) {
      setMemberData((prev: any) => ({
        ...prev,
        [field]: [...(prev[field] || []), value],
      }));
    }
  };

  const handleBadgeRemove = (field: "parents" | "children", value: string) => {
    setMemberData((prev: any) => ({
      ...prev,
      [field]: (prev[field] || []).filter((id: string) => id !== value),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit" : "Add"} Family Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {profileImagePreview ? (
                <img
                  src={profileImagePreview}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500 text-sm">No Image</span>
              )}
            </div>
            <div>
              <Label htmlFor="profileImage" className="sr-only">
                Profile Image
              </Label>
              <Input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={memberData.firstName}
                onChange={(e) =>
                  setMemberData((prev: any) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                placeholder="Enter first name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={memberData.lastName}
                onChange={(e) =>
                  setMemberData((prev: any) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                placeholder="Enter last name"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={memberData.gender}
                onValueChange={(value) =>
                  setMemberData((prev: any) => ({ ...prev, gender: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                value={memberData.birthDate}
                onChange={(e) =>
                  setMemberData((prev: any) => ({
                    ...prev,
                    birthDate: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="parents">Parents</Label>
              <Select
                onValueChange={(val) => handleSelectChange("parents", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent..." />
                </SelectTrigger>
                <SelectContent>
                  {allMembers
                    .filter(
                      (m) =>
                        validation.isValidParent(m.id) &&
                        !memberData.parents.includes(m.id)
                    )
                    .map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.firstName} {m.lastName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1 mt-2">
                {memberData.parents.map((pId) => {
                  const parent = allMembers.find((m) => m.id === pId);
                  return parent ? (
                    <Badge
                      key={pId}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => handleBadgeRemove("parents", pId)}
                    >
                      {parent.firstName} {parent.lastName} ×
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="children">Children</Label>
              <Select
                onValueChange={(val) => handleSelectChange("children", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select child..." />
                </SelectTrigger>
                <SelectContent>
                  {allMembers
                    .filter(
                      (m) =>
                        validation.isValidChild(m.id) &&
                        !memberData.children.includes(m.id)
                    )
                    .map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.firstName} {m.lastName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1 mt-2">
                {memberData.children.map((cId) => {
                  const child = allMembers.find((m) => m.id === cId);
                  return child ? (
                    <Badge
                      key={cId}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => handleBadgeRemove("children", cId)}
                    >
                      {child.firstName} {child.lastName} ×
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="spouse">Spouse</Label>
              <Select
                value={memberData.spouseId || "none"}
                onValueChange={(val) =>
                  setMemberData((prev: any) => ({
                    ...prev,
                    spouseId: val === "none" ? null : val,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select spouse..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No spouse</SelectItem>
                  {allMembers
                    .filter((m) => {
                      if (
                        isEditMode &&
                        (memberData as FamilyMember)?.id === m.id
                      ) {
                        return false;
                      }

                      const isAvailable =
                        !m.spouseId ||
                        m.spouseId === (memberData as FamilyMember)?.id;

                      return isAvailable && validation.isValidSpouse(m.id);
                    })
                    .map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.firstName} {m.lastName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const formData = new FormData();
                if (memberData) {
                  Object.entries(memberData).forEach(([key, value]) => {
                    if (key === "profileImageUrl") return; // Don't send the old URL
                    if (Array.isArray(value)) {
                      value.forEach((v) => formData.append(key, v));
                    } else if (value !== undefined && value !== null) {
                      formData.append(key, value as string);
                    }
                  });
                }
                if (profileImageFile) {
                  formData.append("profileImage", profileImageFile);
                }
                onSubmit(formData);
              }}
            >
              {isEditMode ? "Save Changes" : "Add Member"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
