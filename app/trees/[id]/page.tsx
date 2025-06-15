"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TreeViewer } from "@/components/family-tree/tree-viewer";
import { AddMemberModal } from "@/components/family-tree/add-member-modal";
import { AddRelationshipModal } from "@/components/family-tree/add-relationship-modal";
import { TreeEditModal } from "@/components/family-tree/tree-edit-modal";

import {
  ArrowLeft,
  Plus,
  Users,
  Settings,
  Share2,
  Download,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "../../../lib/auth/auth-context";
import { toast } from "@/components/ui/use-toast";

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

interface FamilyTree {
  id: string;
  name: string;
  description?: string;
  members: Member[];
  relationships: Relationship[];
  shareLink: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function FamilyTreePage() {
  const [familyTree, setFamilyTree] = useState<FamilyTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddRelationship, setShowAddRelationship] = useState(false);
  const [showEditTree, setShowEditTree] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }
    fetchFamilyTree();
  }, [user, params.id, router]);

  const fetchFamilyTree = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/family-trees/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFamilyTree(data);
      } else {
        setError(
          "Family tree not found or you don't have permission to view it"
        );
        setTimeout(() => router.push("/trees"), 3000);
      }
    } catch (error) {
      console.error("Failed to fetch family tree:", error);
      setError("Failed to load family tree");
    } finally {
      setLoading(false);
    }
  };

  const handleMemberUpdate = async (
    member: Member & { formData?: FormData }
  ) => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch(
        `/api/family-trees/${params.id}/members/${member.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: member.formData || new FormData(),
        }
      );

      if (response.ok) {
        await fetchFamilyTree();
      } else {
        throw new Error("Failed to update member");
      }
    } catch (error) {
      console.error("Error updating member:", error);
      throw error;
    }
  };

  const handleMemberDelete = async (memberId: string) => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch(
        `/api/family-trees/${params.id}/members/${memberId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        await fetchFamilyTree();
      } else {
        throw new Error("Failed to delete member");
      }
    } catch (error) {
      console.error("Error deleting member:", error);
      throw error;
    }
  };

  const handleMemberAdded = (newMember: Member) => {
    if (familyTree) {
      setFamilyTree({
        ...familyTree,
        members: [...familyTree.members, newMember],
      });
    }
  };

  const handleRelationshipAdded = (newRelationship: Relationship) => {
    if (familyTree) {
      setFamilyTree({
        ...familyTree,
        relationships: [...familyTree.relationships, newRelationship],
      });
    }
  };

  const handleTreeUpdated = (updatedTree: FamilyTree) => {
    if (familyTree) {
      setFamilyTree({
        ...familyTree,
        name: updatedTree.name,
        description: updatedTree.description,
        isPublic: updatedTree.isPublic,
      });
    }
  };

  const handleTreeDeleted = () => {
    router.push("/trees");
  };

  const handleShare = async () => {
    try {
      const response = await fetch(`/api/family-trees/${params.id}/share`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate share link");
      }

      const { shareLink } = await response.json();
      const publicUrl = `${window.location.origin}/public/trees/${shareLink}`;

      // Try to use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: familyTree?.name,
          text: `Check out this family tree: ${familyTree?.name}`,
          url: publicUrl,
        });
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(publicUrl);
        toast({
          title: "Link copied!",
          description: "The public link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error("Error sharing tree:", error);
      toast({
        title: "Error",
        description: "Failed to generate share link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewPublic = async () => {
    try {
      const response = await fetch(`/api/family-trees/${params.id}/share`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate share link");
      }

      const { shareLink } = await response.json();
      window.open(`/public/trees/${shareLink}`, "_blank");
    } catch (error) {
      console.error("Error opening public view:", error);
      toast({
        title: "Error",
        description: "Failed to open public view. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    // Placeholder for export functionality
    alert("Export functionality coming soon!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading family tree...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!familyTree) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Family tree not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4">
            <div className="flex items-center gap-4">
              <Link href="/trees">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {familyTree.name}
                </h1>
                {familyTree.description && (
                  <p className="text-gray-600">{familyTree.description}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddMember(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddRelationship(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Add Relationship
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditTree(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewPublic}
                className="bg-white/90 backdrop-blur-sm hover:bg-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Public
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="bg-white/90 backdrop-blur-sm hover:bg-white"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <TreeViewer
            familyTree={familyTree}
            isOwner={true}
            onMemberUpdate={handleMemberUpdate}
            onMemberDelete={handleMemberDelete}
          />
        </div>
      </main>

      {/* Modals */}
      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onSuccess={handleMemberAdded}
        familyTreeId={familyTree.id}
        existingMembers={familyTree.members}
      />

      <AddRelationshipModal
        isOpen={showAddRelationship}
        onClose={() => setShowAddRelationship(false)}
        onSuccess={handleRelationshipAdded}
        familyTreeId={familyTree.id}
        members={familyTree.members}
        existingRelationships={familyTree.relationships}
      />

      <TreeEditModal
        isOpen={showEditTree}
        onClose={() => setShowEditTree(false)}
        onSuccess={handleTreeUpdated}
        onDelete={handleTreeDeleted}
        tree={familyTree}
      />
    </div>
  );
}
