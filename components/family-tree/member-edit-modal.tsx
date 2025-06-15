"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Camera, Save, X, Trash2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
import toast from "react-hot-toast";
import { Icons } from "@/components/icons";

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

interface MemberEditModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Member) => void;
  onDelete?: (memberId: string) => void;
  isCreating?: boolean;
}

export function MemberEditModal({
  member,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isCreating = false,
}: MemberEditModalProps) {
  const [formData, setFormData] = useState<Partial<Member>>({});
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [deathDate, setDeathDate] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (member) {
      setFormData({
        ...member,
      });
      setBirthDate(member.birthDate ? new Date(member.birthDate) : undefined);
      setDeathDate(member.deathDate ? new Date(member.deathDate) : undefined);
      setPreviewUrl(member.profileImageUrl || "");
    } else if (isCreating) {
      setFormData({
        firstName: "",
        lastName: "",
        gender: "",
        profileImageUrl: "",
        bio: "",
      });
      setBirthDate(undefined);
      setDeathDate(undefined);
      setPreviewUrl("");
    }
  }, [member, isCreating, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const memberFormData = new FormData();
      memberFormData.append("firstName", formData.firstName || "");
      memberFormData.append("lastName", formData.lastName || "");
      if (birthDate) {
        memberFormData.append("birthDate", birthDate.toISOString());
      }
      if (deathDate) {
        memberFormData.append("deathDate", deathDate.toISOString());
      }
      if (formData.gender) {
        memberFormData.append("gender", formData.gender);
      }
      if (formData.bio) {
        memberFormData.append("bio", formData.bio);
      }
      if (selectedImage) {
        memberFormData.append("profileImage", selectedImage);
      } else if (formData.profileImageUrl) {
        memberFormData.append("profileImageUrl", formData.profileImageUrl);
      }

      const memberData: Member = {
        id: member?.id || "",
        firstName: formData.firstName || "",
        lastName: formData.lastName || "",
        birthDate: birthDate ? birthDate.toISOString() : undefined,
        deathDate: deathDate ? deathDate.toISOString() : undefined,
        gender: formData.gender || undefined,
        profileImageUrl: formData.profileImageUrl || undefined,
        bio: formData.bio || undefined,
      };

      onSave({ ...memberData, formData: memberFormData });
    } catch (error) {
      console.error("Error saving member:", error);
      toast.error("Failed to save member. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (member && onDelete) {
      onDelete(member.id);
    }
    setShowDeleteDialog(false);
  };

  const handleInputChange = (field: keyof Member, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getInitials = () => {
    const firstName = formData.firstName || "";
    const lastName = formData.lastName || "";
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      setSelectedImage(file);
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
      setFormData((prev) => ({
        ...prev,
        profileImageUrl: imageUrl,
      }));
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreating
                ? "Add New Family Member"
                : `Edit ${member?.firstName} ${member?.lastName}`}
            </DialogTitle>
            <DialogDescription>
              {isCreating
                ? "Fill in the details for the new family member."
                : "Update the information for this family member."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={
                        previewUrl ||
                        formData.profileImageUrl ||
                        "/placeholder.svg?height=80&width=80"
                      }
                      alt="Profile"
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-lg">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <Label htmlFor="profileImageUrl">Profile Photo</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="profileImageUrl"
                        placeholder="https://example.com/photo.jpg"
                        value={formData.profileImageUrl || ""}
                        onChange={(e) =>
                          handleInputChange("profileImageUrl", e.target.value)
                        }
                        disabled={isLoading}
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={isLoading}
                        onClick={handleImageClick}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload an image (max 5MB) or enter a URL
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName || ""}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName || ""}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender || ""}
                onValueChange={(value) => handleInputChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dates with Calendar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Birth Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !birthDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {birthDate ? (
                        format(birthDate, "PPP")
                      ) : (
                        <span>Pick a birth date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={birthDate}
                      onSelect={setBirthDate}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      captionLayout="dropdown"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Death Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deathDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deathDate ? (
                        format(deathDate, "PPP")
                      ) : (
                        <span>Pick a death date (optional)</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deathDate}
                      onSelect={setDeathDate}
                      disabled={(date) => {
                        const today = new Date();
                        const minDate = birthDate || new Date("1900-01-01");
                        return date > today || date < minDate;
                      }}
                      initialFocus
                      captionLayout="dropdown"
                      fromYear={birthDate ? birthDate.getFullYear() : 1900}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty if the person is still living
                </p>
              </div>
            </div>

            {/* Biography */}
            <div>
              <Label htmlFor="bio">Biography</Label>
              <Textarea
                id="bio"
                rows={4}
                value={formData.bio || ""}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about this person's life, achievements, personality, or any other details you'd like to remember..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Share stories, achievements, personality traits, or any
                memorable details
              </p>
            </div>

            <DialogFooter className="flex justify-between">
              <div>
                {!isCreating && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Member
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isLoading
                    ? "Saving..."
                    : isCreating
                    ? "Add Member"
                    : "Save Changes"}
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
            <AlertDialogTitle>Delete Family Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {member?.firstName}{" "}
              {member?.lastName}? This action cannot be undone and will also
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
