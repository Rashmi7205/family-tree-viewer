"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import {
  ArrowLeft,
  Save,
  TreePine,
  Users,
  Globe,
  Lock,
  Lightbulb,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default function NewTreePage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/family-trees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create family tree");
      }

      const newTree = await response.json();
      router.push(`/trees/${newTree.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create family tree"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link href="/trees">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Trees
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <TreePine className="h-8 w-8 text-green-600" />
                  Create New Family Tree
                </h1>
                <p className="text-gray-600">
                  Start documenting your family history
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tree Information</CardTitle>
                  <CardDescription>
                    Provide basic information about your family tree. You can
                    always edit these details later.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* Tree Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Family Tree Name *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="e.g., The Smith Family, Johnson Family Tree, Our Heritage"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500">
                        Choose a meaningful name that represents your family
                        lineage
                      </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description (Optional)
                      </Label>
                      <Textarea
                        id="description"
                        rows={4}
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="Describe your family tree, its origins, or any special notes..."
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500">
                        Add context about your family history, geographical
                        origins, or time period
                      </p>
                    </div>

                    {/* Privacy Settings */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {formData.isPublic ? (
                                <Globe className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Lock className="h-4 w-4 text-gray-600" />
                              )}
                              <Label htmlFor="isPublic" className="font-medium">
                                {formData.isPublic
                                  ? "Public Tree"
                                  : "Private Tree"}
                              </Label>
                            </div>
                            <p className="text-sm text-gray-600">
                              {formData.isPublic
                                ? "Anyone with the link can view this family tree"
                                : "Only you can view and edit this family tree"}
                            </p>
                          </div>
                          <Switch
                            id="isPublic"
                            checked={formData.isPublic}
                            onCheckedChange={(checked) =>
                              handleInputChange("isPublic", checked)
                            }
                            disabled={isLoading}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                      <Link href="/trees" className="flex-1">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                      </Link>
                      <Button
                        type="submit"
                        disabled={isLoading || !formData.name.trim()}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? "Creating..." : "Create Family Tree"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Name: </span>
                    <span className="text-sm text-gray-600">
                      {formData.name || "Your family tree name"}
                    </span>
                  </div>
                  {formData.description && (
                    <div>
                      <span className="text-sm font-medium">Description: </span>
                      <span className="text-sm text-gray-600">
                        {formData.description}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium">Visibility: </span>
                    <span className="text-sm text-gray-600">
                      {formData.isPublic
                        ? "Public (shareable)"
                        : "Private (personal)"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <p className="font-medium">Getting Started:</p>
                    <ul className="text-gray-600 space-y-1 text-xs">
                      <li>
                        • Start with yourself or the oldest known ancestor
                      </li>
                      <li>• Add family members one at a time</li>
                      <li>• Include birth/death dates when known</li>
                      <li>• Add photos and stories to bring history to life</li>
                    </ul>
                  </div>

                  <div className="text-sm space-y-2">
                    <p className="font-medium">Privacy Options:</p>
                    <ul className="text-gray-600 space-y-1 text-xs">
                      <li>• Private: Only you can see and edit</li>
                      <li>• Public: Shareable link for family viewing</li>
                      <li>• You can change privacy settings anytime</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>After Creation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>Once your tree is created, you'll be able to:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Add family members with detailed profiles</li>
                      <li>• Create relationships between family members</li>
                      <li>• Upload photos and write biographies</li>
                      <li>• Share your tree with family members</li>
                      <li>• Export your tree as PDF or image</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
