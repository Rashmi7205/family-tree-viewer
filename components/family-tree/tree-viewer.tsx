"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Tree from "react-d3-tree";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Share2,
  Search,
  Filter,
  Eye,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { MemberDetailModal } from "./member-detail-modal";
import { MemberEditModal } from "./member-edit-modal";
import { ModernTreeCard } from "./modern-tree-card";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  gender?: string;
  profileImageUrl?: string;
  bio?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
}

interface Relationship {
  id: string;
  member1Id: string;
  member2Id: string;
  relationshipType: string;
  member1?: Member;
  member2?: Member;
}

interface FamilyTree {
  id: string;
  name: string;
  description?: string;
  members: Member[];
  relationships: Relationship[];
  shareLink: string;
  isPublic: boolean;
}

interface TreeNode {
  name: string;
  attributes?: Record<string, string>;
  children?: TreeNode[];
  member?: Member;
}

interface TreeViewerProps {
  familyTree: FamilyTree;
  isPublic?: boolean;
  isOwner?: boolean;
  onMemberUpdate?: (member: Member) => void;
  onMemberDelete?: (memberId: string) => void;
}

export function TreeViewer({
  familyTree,
  isPublic = false,
  isOwner = false,
  onMemberUpdate,
  onMemberDelete,
}: TreeViewerProps) {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<Member | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.8);
  const [searchTerm, setSearchTerm] = useState("");
  const [interactionHint, setInteractionHint] = useState(
    "Click on member cards to view details"
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [memberForEdit, setMemberForEdit] = useState<Member | null>(null);
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (treeContainerRef.current) {
      const dimensions = treeContainerRef.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
        y: 100,
      });
    }
  }, []);

  useEffect(() => {
    if (familyTree.members.length > 0) {
      const tree = buildHierarchicalTreeStructure(
        familyTree.members,
        familyTree.relationships
      );
      setTreeData(tree);
    }
  }, [familyTree]);

  const buildHierarchicalTreeStructure = (
    members: Member[],
    relationships: Relationship[]
  ): TreeNode => {
    // Create a map of all members
    const memberMap = new Map<string, Member>();
    members.forEach((member) => memberMap.set(member.id, member));

    // Find all parent-child relationships
    const parentChildRels = relationships.filter(
      (rel) => rel.relationshipType === "parent"
    );
    const childParentRels = relationships.filter(
      (rel) => rel.relationshipType === "child"
    );

    // Combine both types of parent-child relationships
    const allParentChildRels = [
      ...parentChildRels.map((rel) => ({
        parentId: rel.member1Id,
        childId: rel.member2Id,
      })),
      ...childParentRels.map((rel) => ({
        parentId: rel.member2Id,
        childId: rel.member1Id,
      })),
    ];

    // Find spouse relationships
    const spouseRels = relationships.filter(
      (rel) => rel.relationshipType === "spouse"
    );
    const spouseMap = new Map<string, string[]>();
    spouseRels.forEach((rel) => {
      if (!spouseMap.has(rel.member1Id)) spouseMap.set(rel.member1Id, []);
      if (!spouseMap.has(rel.member2Id)) spouseMap.set(rel.member2Id, []);
      spouseMap.get(rel.member1Id)!.push(rel.member2Id);
      spouseMap.get(rel.member2Id)!.push(rel.member1Id);
    });

    // Find sibling relationships
    const siblingRels = relationships.filter(
      (rel) => rel.relationshipType === "sibling"
    );
    const siblingMap = new Map<string, string[]>();
    siblingRels.forEach((rel) => {
      if (!siblingMap.has(rel.member1Id)) siblingMap.set(rel.member1Id, []);
      if (!siblingMap.has(rel.member2Id)) siblingMap.set(rel.member2Id, []);
      siblingMap.get(rel.member1Id)!.push(rel.member2Id);
      siblingMap.get(rel.member2Id)!.push(rel.member1Id);
    });

    // Find children for each member
    const childrenMap = new Map<string, string[]>();
    allParentChildRels.forEach((rel) => {
      if (!childrenMap.has(rel.parentId)) {
        childrenMap.set(rel.parentId, []);
      }
      childrenMap.get(rel.parentId)!.push(rel.childId);
    });

    // Find parents for each member
    const parentsMap = new Map<string, string[]>();
    allParentChildRels.forEach((rel) => {
      if (!parentsMap.has(rel.childId)) {
        parentsMap.set(rel.childId, []);
      }
      parentsMap.get(rel.childId)!.push(rel.parentId);
    });

    // Find root members (those with no parents)
    const rootMembers = members.filter((member) => !parentsMap.has(member.id));

    // If no clear root, pick the oldest member or first one
    let rootMember = rootMembers.length > 0 ? rootMembers[0] : members[0];

    // Try to find the oldest member as root
    if (rootMembers.length > 1) {
      rootMember = rootMembers.reduce((oldest, current) => {
        const oldestBirth = oldest.birthDate
          ? new Date(oldest.birthDate).getFullYear()
          : 9999;
        const currentBirth = current.birthDate
          ? new Date(current.birthDate).getFullYear()
          : 9999;
        return currentBirth < oldestBirth ? current : oldest;
      });
    }

    const buildNode = (
      member: Member,
      visited = new Set<string>()
    ): TreeNode => {
      if (visited.has(member.id)) {
        return {
          name: `${member.firstName} ${member.lastName}`,
          member,
          attributes: { id: member.id },
        };
      }

      visited.add(member.id);

      // Get children of this member
      const childIds = childrenMap.get(member.id) || [];
      const children: TreeNode[] = [];

      // Group children with their spouses
      const processedChildren = new Set<string>();

      childIds.forEach((childId) => {
        if (processedChildren.has(childId)) return;

        const child = memberMap.get(childId);
        if (!child) return;

        processedChildren.add(childId);

        // Create child node
        const childNode = buildNode(child, visited);
        children.push(childNode);

        // Add spouse as a sibling node if they exist and have children together
        const spouseIds = spouseMap.get(childId) || [];
        spouseIds.forEach((spouseId) => {
          if (processedChildren.has(spouseId)) return;

          const spouse = memberMap.get(spouseId);
          if (!spouse) return;

          // Check if this spouse also has children (indicating they should be shown)
          const spouseChildren = childrenMap.get(spouseId) || [];
          const sharedChildren = spouseChildren.filter((id) =>
            childIds.includes(id)
          );

          if (sharedChildren.length > 0 || spouseChildren.length > 0) {
            processedChildren.add(spouseId);
            const spouseNode = buildNode(spouse, visited);
            children.push(spouseNode);
          }
        });
      });

      // Add spouse as sibling if no children but still married
      const spouseIds = spouseMap.get(member.id) || [];
      spouseIds.forEach((spouseId) => {
        if (visited.has(spouseId)) return;

        const spouse = memberMap.get(spouseId);
        if (!spouse) return;

        // Only add spouse if they don't have their own parent-child relationship that would place them elsewhere
        const spouseParents = parentsMap.get(spouseId) || [];
        if (spouseParents.length === 0 || spouseParents.includes(member.id)) {
          const spouseNode = buildNode(spouse, visited);
          children.push(spouseNode);
        }
      });

      return {
        name: `${member.firstName} ${member.lastName}`,
        member,
        attributes: { id: member.id },
        children: children.length > 0 ? children : undefined,
      };
    };

    return buildNode(rootMember);
  };

  const handleNodeClick = (nodeData: any) => {
    const member = nodeData.data.member;
    if (member) {
      setSelectedNode(member);
      setShowDetailModal(true);
      setInteractionHint(
        `Viewing details for ${member.firstName} ${member.lastName}`
      );
    }
  };

  const handleNodeEdit = (member: Member) => {
    setMemberForEdit(member);
    setShowEditModal(true);
    setInteractionHint(`Editing ${member.firstName} ${member.lastName}`);
  };

  const handleNodeMouseOver = (nodeData: any) => {
    const memberId = nodeData.data.attributes?.id;
    setHoveredNode(memberId);
    const member = nodeData.data.member;
    if (member) {
      setInteractionHint(
        `Hover: ${member.firstName} ${member.lastName} - Click for details`
      );
    }
  };

  const handleNodeMouseOut = () => {
    setHoveredNode(null);
    setInteractionHint("Click on member cards to view details");
  };

  const handleMemberSave = async (updatedMember: Member) => {
    try {
      if (onMemberUpdate) {
        await onMemberUpdate(updatedMember);
      }
      setInteractionHint(
        `Successfully updated ${updatedMember.firstName} ${updatedMember.lastName}`
      );
      setShowEditModal(false);
      setMemberForEdit(null);
    } catch (error) {
      setInteractionHint("Failed to update member");
    }
  };

  const handleMemberDelete = async (memberId: string) => {
    try {
      if (onMemberDelete) {
        await onMemberDelete(memberId);
      }
      const member = familyTree.members.find((m) => m.id === memberId);
      setInteractionHint(
        `Successfully deleted ${member?.firstName} ${member?.lastName}`
      );
      setShowEditModal(false);
      setMemberForEdit(null);
    } catch (error) {
      setInteractionHint("Failed to delete member");
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/public/${familyTree.shareLink}`;
    if (navigator.share) {
      await navigator.share({
        title: familyTree.name,
        text: `Check out this family tree: ${familyTree.name}`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      setInteractionHint("Share link copied to clipboard!");
      setTimeout(
        () => setInteractionHint("Click on member cards to view details"),
        3000
      );
    }
  };

  const resetView = () => {
    setZoom(0.8);
    if (treeContainerRef.current) {
      const dimensions = treeContainerRef.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
        y: 100,
      });
    }
    setInteractionHint("View reset to center");
    setTimeout(
      () => setInteractionHint("Click on member cards to view details"),
      2000
    );
  };

  const filteredMembers = familyTree.members.filter(
    (member) =>
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCustomNode = ({ nodeDatum }: any) => {
    const member = nodeDatum.member;
    if (!member) return null;

    const isHovered = hoveredNode === member.id;
    const isSelected = selectedNode?.id === member.id;

    // Assign gradient based on generation level or member ID
    const gradientTypes = [
      "blue",
      "purple",
      "green",
      "orange",
      "pink",
      "teal",
    ] as const;
    const gradientIndex =
      Math.abs(member.id.split("").reduce((a, b) => a + b.charCodeAt(0), 0)) %
      gradientTypes.length;
    const gradientType = gradientTypes[gradientIndex];

    // Count relationships for this member
    const memberRelationships = familyTree.relationships.filter(
      (rel) => rel.member1Id === member.id || rel.member2Id === member.id
    ).length;

    return (
      <g>
        <foreignObject x="-144" y="-198" width="288" height="396">
          <div className="group">
            <ModernTreeCard
              member={member}
              isSelected={isSelected}
              isHovered={isHovered}
              isOwner={isOwner}
              onEdit={handleNodeEdit}
              onClick={() => handleNodeClick({ data: nodeDatum })}
              onMouseEnter={() => handleNodeMouseOver({ data: nodeDatum })}
              onMouseLeave={handleNodeMouseOut}
              relationshipCount={memberRelationships}
              gradientType={gradientType}
            />
          </div>
        </foreignObject>
      </g>
    );
  };

  const handleExport = async () => {
    if (!treeContainerRef.current) return;

    try {
      toast({
        title: "Exporting tree...",
        description: "Please wait while we generate the image.",
      });

      // Use html2canvas to capture the tree
      const canvas = await html2canvas(treeContainerRef.current, {
        scale: 2, // Higher quality
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `family-tree-${
          new Date().toISOString().split("T")[0]
        }.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, "image/png");

      toast({
        title: "Export successful",
        description: "Your family tree has been exported as an image.",
      });
    } catch (error) {
      console.error("Error exporting tree:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the tree. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!treeData) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No family tree data available</p>
          <p className="text-sm text-gray-500">
            Add family members to see the tree visualization
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{familyTree.name}</h2>
          {familyTree.description && (
            <p className="text-gray-600">{familyTree.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{familyTree.members.length} members</Badge>
            <Badge variant="outline">
              {familyTree.relationships.length} relationships
            </Badge>
            {isPublic && <Badge variant="secondary">Public View</Badge>}
            {isOwner && <Badge variant="default">Owner</Badge>}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom((z) => Math.min(z + 0.1, 2))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom((z) => Math.max(z - 0.1, 0.3))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={resetView}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          {!isPublic && (
            <>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="bg-white/90 backdrop-blur-sm hover:bg-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Tree
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Interaction hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-blue-800">
          <Eye className="h-4 w-4" />
          <span className="text-sm font-medium">{interactionHint}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main tree visualization */}
        <div className="lg:col-span-3">
          <Card className="w-full h-full">
            <CardContent className="p-0 relative">
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Tree
                </Button>
              </div>
              <div
                ref={treeContainerRef}
                className="w-full h-[calc(100vh-200px)]"
              >
                <Tree
                  data={treeData}
                  translate={translate}
                  zoom={zoom}
                  onNodeClick={handleNodeClick}
                  onNodeMouseOver={handleNodeMouseOver}
                  onNodeMouseOut={handleNodeMouseOut}
                  renderCustomNodeElement={renderCustomNode}
                  orientation="vertical"
                  pathFunc="diagonal"
                  separation={{ siblings: 1.8, nonSiblings: 2.0 }}
                  nodeSize={{ x: 320, y: 450 }}
                  enableLegacyTransitions={true}
                  transitionDuration={500}
                />

                {/* Zoom level indicator */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-medium">
                  Zoom: {Math.round(zoom * 100)}%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with details and controls */}
        <div className="space-y-4">
          {/* Search */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-4 w-4" />
                Find Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-3"
              />
              {searchTerm && (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-2 hover:bg-gray-100 rounded cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedNode(member);
                        setShowDetailModal(true);
                      }}
                    >
                      {member.firstName} {member.lastName}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Family Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Family Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Total Members:</span>
                <Badge variant="secondary">{familyTree.members.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Relationships:</span>
                <Badge variant="secondary">
                  {familyTree.relationships.length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Generations:</span>
                <Badge variant="secondary">
                  {Math.max(
                    ...familyTree.members.map(
                      (m) =>
                        familyTree.relationships.filter(
                          (r) =>
                            (r.relationshipType === "parent" &&
                              r.member2Id === m.id) ||
                            (r.relationshipType === "child" &&
                              r.member1Id === m.id)
                        ).length
                    )
                  ) + 1}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Living Members:</span>
                <Badge variant="secondary">
                  {familyTree.members.filter((m) => !m.deathDate).length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={resetView}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset View
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter Members
              </Button>
              {!isPublic && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Tree
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <MemberDetailModal
        member={selectedNode}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedNode(null);
        }}
        onEdit={(member) => {
          setShowDetailModal(false);
          handleNodeEdit(member);
        }}
        relationships={familyTree.relationships}
        isOwner={isOwner}
      />

      <MemberEditModal
        member={memberForEdit}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setMemberForEdit(null);
        }}
        onSave={handleMemberSave}
        onDelete={handleMemberDelete}
        isCreating={false}
      />
    </div>
  );
}
