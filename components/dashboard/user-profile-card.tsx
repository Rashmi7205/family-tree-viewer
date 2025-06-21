"use client";

import type { User } from "firebase/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/icons";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { IUser } from "../../models/User";

interface UserProfileCardProps {
  user: User;
  userProfile: IUser;
  onEdit: () => void;
}

export default function UserProfileCard({
  user,
  userProfile,
  onEdit,
}: UserProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-24"></div>
        <CardHeader className="relative pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-4 border-white -mt-10 relative z-10">
                <AvatarImage
                  src={user.photoURL || ""}
                  alt={user.displayName || ""}
                />
                <AvatarFallback className="text-lg font-semibold">
                  {userProfile.profile?.fullName?.charAt(0).toUpperCase() ||
                    user.displayName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="pt-2">
                <CardTitle className="text-2xl">
                  {userProfile.profile?.title}{" "}
                  {userProfile.profile?.fullName || user.displayName}
                </CardTitle>
                <CardDescription className="text-base">
                  {userProfile.profile?.occupation} •{" "}
                  {userProfile.address?.city}
                </CardDescription>
              </div>
            </div>
            <Button onClick={onEdit} variant="outline" size="sm">
              <Icons.user className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <div className="flex items-center space-x-2">
                <p className="text-sm">{user.email}</p>
                <Badge
                  variant={user.emailVerified ? "default" : "secondary"}
                  className="text-xs"
                >
                  {user.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <div className="flex items-center space-x-2">
                <p className="text-sm">
                  {userProfile.phoneNumber || "Not provided"}
                </p>
                {userProfile.phoneNumber && (
                  <Badge variant="default" className="text-xs">
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Gender
              </p>
              <p className="text-sm capitalize">
                {userProfile.profile?.gender || "Not specified"}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Date of Birth
              </p>
              <p className="text-sm">
                {userProfile.profile?.dateOfBirth
                  ? format(new Date(userProfile.profile.dateOfBirth), "PPP")
                  : "Not provided"}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Blood Group
              </p>
              <p className="text-sm uppercase">
                {userProfile.profile?.bloodGroup || "Not provided"}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Marital Status
              </p>
              <p className="text-sm capitalize">
                {userProfile.profile?.maritalStatus || "Not specified"}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Education
              </p>
              <p className="text-sm">
                {userProfile.profile?.education || "Not provided"}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Address
              </p>
              <p className="text-sm">
                {userProfile.address?.street &&
                  `${userProfile.address.street}, `}
                {userProfile.address?.city}
                {userProfile.address?.state && `, ${userProfile.address.state}`}
                {userProfile.address?.country &&
                  `, ${userProfile.address.country}`}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Account Type
              </p>
              <Badge variant="outline" className="capitalize">
                {userProfile.provider}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
