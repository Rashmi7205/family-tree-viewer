"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { Plus, Users, GitBranch, Eye, Trash2 } from "lucide-react";
import { CreateTreeModal } from "@/components/family-tree/create-tree-modal";

interface FamilyTree {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  shareLink: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    members: number;
    relationships: number;
  };
}

export default function DashboardPage() {
  const [trees, setTrees] = useState<FamilyTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (isAuthenticated) {
      fetchTrees();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchTrees = async () => {
    try {
      const response = await fetch("/api/family-trees", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setTrees(data);
      }
    } catch (error) {
      console.error("Failed to fetch trees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTree = async (treeId: string) => {
    if (!confirm("Are you sure you want to delete this family tree?")) return;

    try {
      const response = await fetch(`/api/family-trees/${treeId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        setTrees(trees.filter((tree) => tree.id !== treeId));
      }
    } catch (error) {
      console.error("Failed to delete tree:", error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Family Trees</h1>
              <p className="text-gray-600">Welcome back, {user?.displayName}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/trees">
                <Button>Manage Trees</Button>
              </Link>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Quick Create
              </Button>
              <Button variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {trees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No family trees
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first family tree.
              </p>
              <div className="mt-6">
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Family Tree
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trees.map((tree) => (
                <Card
                  key={tree.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{tree.name}</CardTitle>
                        {tree.description && (
                          <CardDescription className="mt-1">
                            {tree.description}
                          </CardDescription>
                        )}
                      </div>
                      {tree.isPublic && (
                        <Badge variant="secondary">Public</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {tree._count.members}
                        </div>
                        <div className="flex items-center gap-1">
                          <GitBranch className="h-4 w-4" />
                          {tree._count.relationships}
                        </div>
                      </div>
                      <div>{new Date(tree.updatedAt).toLocaleDateString()}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/trees/${tree.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteTree(tree.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateTreeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(treeId) => {
          console.log("Tree created successfully with ID:", treeId);
          fetchTrees(); // Refresh the tree list
          setShowCreateModal(false); // Close the modal
          router.push(`/trees/${treeId}`); // Navigate to the new tree
        }}
      />
    </div>
  );
}
