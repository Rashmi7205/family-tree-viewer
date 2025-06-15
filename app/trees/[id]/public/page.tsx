"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TreeViewer } from "@/components/family-tree/tree-viewer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PublicTreePage() {
  const [familyTree, setFamilyTree] = useState<FamilyTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    fetchFamilyTree();
  }, [params.id]);

  const fetchFamilyTree = async () => {
    try {
      const response = await fetch(`/api/family-trees/${params.id}/public`);
      if (response.ok) {
        const data = await response.json();
        setFamilyTree(data);
      } else {
        setError("Family tree not found or is not publicly accessible");
        setTimeout(() => router.push("/"), 3000);
      }
    } catch (error) {
      console.error("Failed to fetch family tree:", error);
      setError("Failed to load family tree");
    } finally {
      setLoading(false);
    }
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
              <Link href="/">
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
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <TreeViewer
            familyTree={familyTree}
            isOwner={false}
            onMemberUpdate={() => {}}
            onMemberDelete={() => {}}
          />
        </div>
      </main>
    </div>
  );
}
