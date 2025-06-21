"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import toast from "react-hot-toast";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import AddressSelector from "@/components/profile/address-selector";
import { motion } from "framer-motion";
import { educationOptions, occupationOptions } from "../../constants";

const profileSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  fullName: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  bloodGroup: z.string().min(1, { message: "Blood group is required" }),
  education: z.string().min(1, { message: "Education is required" }),
  occupation: z.string().min(1, { message: "Occupation is required" }),
  maritalStatus: z.string().min(1, { message: "Marital status is required" }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileCompletionStepProps {
  onCompleted: () => void;
}

interface AdminOption {
  _id: string;
  type: string;
  value: string;
  isActive: boolean;
}

export default function ProfileCompletionStep({
  onCompleted,
}: ProfileCompletionStepProps) {
  const { user, refreshUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const watchedDate = watch("dateOfBirth");

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !selectedAddress) {
      toast.error("Please complete all fields including address selection.");
      return;
    }

    setIsLoading(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/profile/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          profile: data,
          address: selectedAddress,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to complete profile");
      }

      toast.success("Your profile has been completed successfully.");

      await refreshUserProfile();
      onCompleted();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Profile completion failed. Please try again later.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const titleOptions = [
    { value: "mr", label: "Mr." },
    { value: "mrs", label: "Mrs." },
    { value: "ms", label: "Ms." },
    { value: "dr", label: "Dr." },
    { value: "prof", label: "Prof." },
    { value: "other", label: "Other" },
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  const bloodGroupOptions = [
    { value: "a+", label: "A+" },
    { value: "a-", label: "A-" },
    { value: "b+", label: "B+" },
    { value: "b-", label: "B-" },
    { value: "ab+", label: "AB+" },
    { value: "ab-", label: "AB-" },
    { value: "o+", label: "O+" },
    { value: "o-", label: "O-" },
  ];

  const maritalStatusOptions = [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Personal Information
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please provide your personal details to complete your profile
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor="title">Title</Label>
            <Select onValueChange={(value) => setValue("title", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select title" />
              </SelectTrigger>
              <SelectContent>
                {titleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </motion.div>

          {/* Full Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </motion.div>

          {/* Gender */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <Label htmlFor="gender">Gender</Label>
            <Select onValueChange={(value) => setValue("gender", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-sm text-red-500">{errors.gender.message}</p>
            )}
          </motion.div>

          {/* Date of Birth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <Label>Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !watchedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watchedDate ? format(watchedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={watchedDate}
                  onSelect={(date) => setValue("dateOfBirth", date!)}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.dateOfBirth && (
              <p className="text-sm text-red-500">
                {errors.dateOfBirth.message}
              </p>
            )}
          </motion.div>

          {/* Blood Group */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <Label htmlFor="bloodGroup">Blood Group</Label>
            <Select onValueChange={(value) => setValue("bloodGroup", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                {bloodGroupOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bloodGroup && (
              <p className="text-sm text-red-500">
                {errors.bloodGroup.message}
              </p>
            )}
          </motion.div>

          {/* Education */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-2"
          >
            <Label htmlFor="education">Education</Label>
            <Select onValueChange={(value) => setValue("education", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select education" />
              </SelectTrigger>
              <SelectContent>
                {educationOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.education && (
              <p className="text-sm text-red-500">{errors.education.message}</p>
            )}
          </motion.div>

          {/* Occupation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-2"
          >
            <Label htmlFor="occupation">Occupation</Label>
            <Select onValueChange={(value) => setValue("occupation", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select occupation" />
              </SelectTrigger>
              <SelectContent>
                {occupationOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.occupation && (
              <p className="text-sm text-red-500">
                {errors.occupation.message}
              </p>
            )}
          </motion.div>

          {/* Marital Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-2"
          >
            <Label htmlFor="maritalStatus">Marital Status</Label>
            <Select onValueChange={(value) => setValue("maritalStatus", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                {maritalStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.maritalStatus && (
              <p className="text-sm text-red-500">
                {errors.maritalStatus.message}
              </p>
            )}
          </motion.div>
        </div>

        {/* Address Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-2 mt-8 pt-4 border-t"
        >
          <h3 className="text-lg font-medium">Your Address</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            You can select your address using Google Maps or enter it manually
          </p>
          <AddressSelector onAddressSelect={setSelectedAddress} />
          {!selectedAddress && (
            <p className="text-sm text-red-500">Please select your address</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="flex justify-end pt-6"
        >
          <Button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 text-lg"
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
            )}
            Complete Profile
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
