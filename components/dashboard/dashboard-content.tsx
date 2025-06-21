"use client";

import { useState } from "react";
import type { User } from "firebase/auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { motion } from "framer-motion";
import UserProfileCard from "@/components/dashboard/user-profile-card";
import ProfileEditModal from "@/components/dashboard/profile-edit-modal";
import { IUser } from "../../models/User";

interface DashboardContentProps {
  user: User;
  userProfile: IUser;
}

export default function DashboardContent({
  user,
  userProfile,
}: DashboardContentProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  const stats = [
    {
      title: "Account Status",
      value: "Active",
      description: "Your account is fully verified",
      icon: Icons.user,
      color: "text-green-600",
    },
    {
      title: "Profile Completion",
      value: "100%",
      description: "All profile fields completed",
      icon: Icons.check,
      color: "text-blue-600",
    },
    {
      title: "Security Level",
      value: "High",
      description: "Email and phone verified",
      icon: Icons.shield,
      color: "text-purple-600",
    },
    {
      title: "Member Since",
      value: new Date(userProfile.createdAt).getFullYear().toString(),
      description: "Years of membership",
      icon: Icons.calendar,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, {userProfile.profile?.fullName || user.displayName}! 👋
        </h2>
        <p className="text-muted-foreground">
          Here's an overview of your account and profile information.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* User Profile Card */}
      <UserProfileCard
        user={user}
        userProfile={userProfile}
        onEdit={() => setShowEditModal(true)}
      />

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your account and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <Icons.user className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Update Profile</p>
                  <p className="text-sm text-muted-foreground">
                    Edit your personal information
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <Icons.shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Security Settings</p>
                  <p className="text-sm text-muted-foreground">
                    Manage your account security
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <Icons.mail className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Configure your preferences
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        userProfile={userProfile}
      />
    </div>
  );
}
