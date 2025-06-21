"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TreeCard } from "@/components/family-tree/tree-card";
import { CreateTreeModal } from "@/components/family-tree/create-tree-modal";

import {
  Plus,
  Search,
  Filter,
  TreePine,
  Users,
  Globe,
  Lock,
  BarChart3,
  ArrowLeft,
  Grid3X3,
  List,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useAuth } from "../../lib/auth/auth-context";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Icons } from "../../components/icons";

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

type SortOption = "name" | "created" | "updated" | "members";
type FilterOption = "all" | "public" | "private";
type ViewMode = "grid" | "list";

export default function TreesPage() {
  const [trees, setTrees] = useState<FamilyTree[]>([]);
  const [filteredTrees, setFilteredTrees] = useState<FamilyTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
      return;
    }
    if (user) {
      fetchTrees();
    }
  }, [user, authLoading]);

  useEffect(() => {
    filterAndSortTrees();
  }, [trees, searchTerm, sortBy, filterBy]);

  const fetchTrees = async () => {
    try {
      const token = user?.accessToken;
      const response = await fetch("/api/family-trees", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  const filterAndSortTrees = () => {
    const filtered = trees.filter((tree) => {
      const matchesSearch =
        tree.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tree.description &&
          tree.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "public" && tree.isPublic) ||
        (filterBy === "private" && !tree.isPublic);

      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "created":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "updated":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "members":
          return b._count.members - a._count.members;
        default:
          return 0;
      }
    });

    setFilteredTrees(filtered);
  };

  const handleDeleteTree = async (treeId: string) => {
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

  const handleShareTree = async (tree: FamilyTree) => {
    const shareUrl = `${window.location.origin}/public/${tree.shareLink}`;
    if (navigator.share) {
      await navigator.share({
        title: tree.name,
        text: `Check out this family tree: ${tree.name}`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      // You could add a toast notification here
    }
  };

  const getStatistics = () => {
    const totalMembers = trees.reduce(
      (sum, tree) => sum + tree._count.members,
      0
    );
    const totalRelationships = trees.reduce(
      (sum, tree) => sum + tree._count.relationships,
      0
    );
    const publicTrees = trees.filter((tree) => tree.isPublic).length;
    const privateTrees = trees.filter((tree) => !tree.isPublic).length;

    return { totalMembers, totalRelationships, publicTrees, privateTrees };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading your family trees...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <TreePine className="h-8 w-8 text-green-600" />
                  My Family Trees
                </h1>
                <p className="text-gray-600">
                  Manage and explore your family history
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Tree
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.photoURL || ""}
                        alt={user?.displayName || ""}
                      />
                      <AvatarFallback>
                        {user?.displayName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.displayName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <Icons.logOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Trees
                    </p>
                    <p className="text-2xl font-bold">{trees.length}</p>
                  </div>
                  <TreePine className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Family Members
                    </p>
                    <p className="text-2xl font-bold">{stats.totalMembers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Public Trees
                    </p>
                    <p className="text-2xl font-bold">{stats.publicTrees}</p>
                  </div>
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Private Trees
                    </p>
                    <p className="text-2xl font-bold">{stats.privateTrees}</p>
                  </div>
                  <Lock className="h-8 w-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search family trees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select
                  value={filterBy}
                  onValueChange={(value: FilterOption) => setFilterBy(value)}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Trees</SelectItem>
                    <SelectItem value="public">Public Only</SelectItem>
                    <SelectItem value="private">Private Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortBy}
                  onValueChange={(value: SortOption) => setSortBy(value)}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">Last Updated</SelectItem>
                    <SelectItem value="created">Date Created</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="members">Most Members</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Active Filters */}
              {(searchTerm || filterBy !== "all" || sortBy !== "updated") && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {searchTerm && (
                    <Badge variant="secondary">Search: "{searchTerm}"</Badge>
                  )}
                  {filterBy !== "all" && (
                    <Badge variant="secondary">
                      {filterBy === "public" ? "Public trees" : "Private trees"}
                    </Badge>
                  )}
                  {sortBy !== "updated" && (
                    <Badge variant="secondary">
                      Sort:{" "}
                      {sortBy === "name"
                        ? "Name"
                        : sortBy === "created"
                        ? "Created"
                        : "Members"}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterBy("all");
                      setSortBy("updated");
                    }}
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trees Grid/List */}
          {filteredTrees.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                {trees.length === 0 ? (
                  <>
                    <TreePine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No family trees yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Get started by creating your first family tree to begin
                      documenting your family history.
                    </p>
                    <Button onClick={() => setShowCreateModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Tree
                    </Button>
                  </>
                ) : (
                  <>
                    <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No trees found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      No family trees match your current search and filter
                      criteria.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setFilterBy("all");
                        setSortBy("updated");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Results Summary */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredTrees.length} of {trees.length} family trees
                </p>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {filteredTrees.reduce(
                      (sum, tree) => sum + tree._count.members,
                      0
                    )}{" "}
                    total members
                  </span>
                </div>
              </div>

              {/* Trees Display */}
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredTrees.map((tree) => (
                  <TreeCard
                    key={tree.id}
                    tree={tree}
                    onDelete={handleDeleteTree}
                    onShare={handleShareTree}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Create Tree Modal */}
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
