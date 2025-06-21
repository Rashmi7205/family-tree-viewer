"use client";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Connection,
  addEdge,
  Panel,
  Handle,
  Position,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import domtoimage from "dom-to-image-more";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  GitBranch,
  Network,
  RotateCcw,
  Info,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Download,
} from "lucide-react";

// Type definition for family member
interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  birthDate: string;
  familyTreeId: string;
  parents: string[];
  children: string[];
  spouseId: string | null;
}

// Simple family member node component
const FamilyMemberNode = ({ data }: { data: any }) => {
  const { firstName, lastName, gender, isSelected } = data;
  const fullName = `${firstName} ${lastName}`;

  const genderColors: Record<string, string> = {
    male: "bg-blue-100 border-blue-300 text-blue-800",
    female: "bg-pink-100 border-pink-300 text-pink-800",
    other: "bg-purple-100 border-purple-300 text-purple-800",
  };

  const genderIcons: Record<string, string> = {
    male: "👨",
    female: "👩",
    other: "👤",
  };

  return (
    <div
      className={`p-3 rounded-lg border-2 shadow-md ${
        genderColors[gender] || genderColors.other
      } ${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
    >
      {/* Connection handle for incoming parent-child relationships */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-blue-500 border border-white"
        style={{ top: -4 }}
      />

      <div className="flex flex-col items-center space-y-1 min-w-[100px]">
        <div className="text-2xl">
          {genderIcons[gender] || genderIcons.other}
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-sm">{fullName}</h3>
          <p className="text-xs opacity-75 capitalize">{gender}</p>
        </div>
      </div>

      {/* Connection handle for outgoing parent-child relationships */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-green-500 border border-white"
        style={{ bottom: -4 }}
      />
    </div>
  );
};

const nodeTypes = {
  familyMember: FamilyMemberNode,
};

export default function DemotreePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const reactFlowRef = useRef<HTMLDivElement>(null);

  // Member management state
  const [members, setMembers] = useState<FamilyMember[]>(mockTreeData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [newMember, setNewMember] = useState<
    Omit<FamilyMember, "id" | "familyTreeId">
  >({
    firstName: "",
    lastName: "",
    gender: "male",
    birthDate: "",
    parents: [],
    children: [],
    spouseId: null,
  });

  // Member management functions
  const addMember = useCallback(() => {
    if (!newMember.firstName || !newMember.lastName) return;

    const id = Date.now().toString();
    const member: FamilyMember = {
      id,
      ...newMember,
      familyTreeId: "demo-tree",
    };

    // Update relationships in existing members
    const updatedMembers = [...members];

    // Add this member as a child to selected parents
    newMember.parents.forEach((parentId) => {
      const parentIndex = updatedMembers.findIndex((m) => m.id === parentId);
      if (parentIndex !== -1) {
        updatedMembers[parentIndex] = {
          ...updatedMembers[parentIndex],
          children: [...updatedMembers[parentIndex].children, id],
        };
      }
    });

    // Add this member as a parent to selected children
    newMember.children.forEach((childId) => {
      const childIndex = updatedMembers.findIndex((m) => m.id === childId);
      if (childIndex !== -1) {
        updatedMembers[childIndex] = {
          ...updatedMembers[childIndex],
          parents: [...updatedMembers[childIndex].parents, id],
        };
      }
    });

    // Update spouse relationship if selected
    if (newMember.spouseId) {
      const spouseIndex = updatedMembers.findIndex(
        (m) => m.id === newMember.spouseId
      );
      if (spouseIndex !== -1) {
        updatedMembers[spouseIndex] = {
          ...updatedMembers[spouseIndex],
          spouseId: id,
        };
      }
    }

    setMembers([...updatedMembers, member]);
    setIsAddModalOpen(false);
    setNewMember({
      firstName: "",
      lastName: "",
      gender: "male",
      birthDate: "",
      parents: [],
      children: [],
      spouseId: null,
    });
  }, [newMember, members]);

  // Validation functions
  const isParent = useCallback(
    (memberId: string, potentialChildId: string): boolean => {
      const member = members.find((m) => m.id === memberId);
      if (!member) return false;

      // Direct parent check
      if (member.children.includes(potentialChildId)) return true;

      // Recursive parent check through children
      return member.children.some((childId) =>
        isParent(childId, potentialChildId)
      );
    },
    [members]
  );

  const isChild = useCallback(
    (memberId: string, potentialParentId: string): boolean => {
      const member = members.find((m) => m.id === memberId);
      if (!member) return false;

      // Direct child check
      if (member.parents.includes(potentialParentId)) return true;

      // Recursive child check through parents
      return member.parents.some((parentId) =>
        isChild(parentId, potentialParentId)
      );
    },
    [members]
  );

  const isSibling = useCallback(
    (memberId1: string, memberId2: string): boolean => {
      const member1 = members.find((m) => m.id === memberId1);
      const member2 = members.find((m) => m.id === memberId2);
      if (!member1 || !member2) return false;

      // Check if they share any parents
      return member1.parents.some((parentId) =>
        member2.parents.includes(parentId)
      );
    },
    [members]
  );

  const isSpouse = useCallback(
    (memberId1: string, memberId2: string): boolean => {
      const member1 = members.find((m) => m.id === memberId1);
      const member2 = members.find((m) => m.id === memberId2);
      if (!member1 || !member2) return false;

      return member1.spouseId === memberId2 || member2.spouseId === memberId1;
    },
    [members]
  );

  // Validation functions for new member relationships
  const isValidParent = useCallback(
    (parentId: string): boolean => {
      // Can't be a child of the new member (check if parent is in children list)
      if (newMember.children.includes(parentId)) return false;

      // Can't be a spouse of the new member
      if (newMember.spouseId === parentId) return false;

      return true;
    },
    [newMember]
  );

  const isValidChild = useCallback(
    (childId: string): boolean => {
      // Can't be a parent of the new member (check if child is in parents list)
      if (newMember.parents.includes(childId)) return false;

      // Can't be a spouse of the new member
      if (newMember.spouseId === childId) return false;

      return true;
    },
    [newMember]
  );

  const isValidSpouse = useCallback(
    (spouseId: string): boolean => {
      // Can't be a parent of the new member
      if (newMember.parents.includes(spouseId)) return false;

      // Can't be a child of the new member
      if (newMember.children.includes(spouseId)) return false;

      // Can't be a sibling (check if they share any parents)
      const potentialSibling = members.find((m) => m.id === spouseId);
      if (potentialSibling) {
        const sharedParents = newMember.parents.filter((parentId) =>
          potentialSibling.parents.includes(parentId)
        );
        if (sharedParents.length > 0) return false;
      }

      return true;
    },
    [newMember, members]
  );

  const editMember = useCallback(() => {
    if (!editingMember || !editingMember.firstName || !editingMember.lastName)
      return;

    setMembers((prev) =>
      prev.map((m) => (m.id === editingMember.id ? editingMember : m))
    );
    setIsEditModalOpen(false);
    setEditingMember(null);
  }, [editingMember]);

  const deleteMember = useCallback(
    (memberId: string) => {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      if (selectedNode === memberId) {
        setSelectedNode(null);
      }
    },
    [selectedNode]
  );

  const openEditModal = useCallback((member: FamilyMember) => {
    setEditingMember({ ...member });
    setIsEditModalOpen(true);
  }, []);

  // Transform flat data into nodes and edges with automatic positioning
  const graphData = useMemo(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Create a map to track node positions
    const nodePositions = new Map<string, { x: number; y: number }>();
    const generationMap = new Map<string, number>();

    // First pass: determine generation levels (0 = oldest generation)
    const findGeneration = (
      memberId: string,
      visited = new Set<string>()
    ): number => {
      if (visited.has(memberId)) return 0;
      visited.add(memberId);

      const member = members.find((m) => m.id === memberId);
      if (!member || member.parents.length === 0) return 0;

      const parentGenerations = member.parents.map((parentId) =>
        findGeneration(parentId, visited)
      );
      return Math.max(...parentGenerations) + 1;
    };

    // Calculate generations for all members
    members.forEach((member) => {
      const generation = findGeneration(member.id);
      generationMap.set(member.id, generation);
    });

    // Find the maximum generation
    const maxGeneration = Math.max(...Array.from(generationMap.values()));

    // Second pass: group members by generation (0 = top, maxGeneration = bottom)
    const generationGroups = new Map<number, string[]>();
    members.forEach((member) => {
      const generation = generationMap.get(member.id) || 0;

      if (!generationGroups.has(generation)) {
        generationGroups.set(generation, []);
      }
      generationGroups.get(generation)!.push(member.id);
    });

    // Position nodes in hierarchical structure from top to bottom
    generationGroups.forEach((memberIds, generation) => {
      const y = generation * 200; // Vertical spacing between generations
      const spacing = 300; // Horizontal spacing between nodes

      // Group spouses together and position them side by side
      const positionedMembers: string[] = [];
      const processedSpouses = new Set<string>();

      memberIds.forEach((memberId) => {
        if (processedSpouses.has(memberId)) return;

        const member = members.find((m) => m.id === memberId)!;

        if (member.spouseId && !processedSpouses.has(member.spouseId)) {
          // Position spouses next to each other
          const spouse = members.find((m) => m.id === member.spouseId)!;
          const spouseIndex = memberIds.indexOf(member.spouseId);

          // Add both spouses to positioned list
          positionedMembers.push(memberId);
          positionedMembers.push(member.spouseId);
          processedSpouses.add(memberId);
          processedSpouses.add(member.spouseId);
        } else if (!member.spouseId || processedSpouses.has(member.spouseId)) {
          // Single member or spouse already processed
          positionedMembers.push(memberId);
          processedSpouses.add(memberId);
        }
      });

      // Calculate positions for the positioned members
      const totalWidth = (positionedMembers.length - 1) * spacing;
      const startX = -totalWidth / 2;

      positionedMembers.forEach((memberId, index) => {
        const currentMember = members.find((m) => m.id === memberId);
        if (!currentMember) return; // Skip if member not found

        let x = startX + index * spacing;

        // If this member has a spouse, adjust position to be closer
        if (currentMember.spouseId && index % 2 === 1) {
          // Second spouse in pair - position closer to first spouse
          x = startX + (index - 1) * spacing + 100; // 100px offset for spouse
        }

        nodePositions.set(memberId, { x, y });

        newNodes.push({
          id: currentMember.id,
          type: "familyMember",
          position: { x, y },
          data: {
            ...currentMember,
            isSelected: false,
          },
        });
      });
    });

    // Create edges for parent-child relationships
    members.forEach((member) => {
      // Create edges from parents to this member
      member.parents.forEach((parentId) => {
        newEdges.push({
          id: `parent-${parentId}-${member.id}`,
          source: parentId,
          target: member.id,
          type: "smoothstep",
          style: {
            stroke: "#3b82f6",
            strokeWidth: 2,
          },
          animated: false,
        });
      });

      // Create edges from this member to their children
      member.children.forEach((childId) => {
        newEdges.push({
          id: `parent-${member.id}-${childId}`,
          source: member.id,
          target: childId,
          type: "smoothstep",
          style: {
            stroke: "#3b82f6",
            strokeWidth: 2,
          },
          animated: false,
        });
      });
    });

    // Create edges for spouse relationships (avoid duplicates)
    const spouseEdges = new Set<string>();
    members.forEach((member) => {
      if (
        member.spouseId &&
        !spouseEdges.has(`${member.id}-${member.spouseId}`) &&
        !spouseEdges.has(`${member.spouseId}-${member.id}`)
      ) {
        // Create spouse edge with straight line
        newEdges.push({
          id: `spouse-${member.id}-${member.spouseId}`,
          source: member.id,
          target: member.spouseId,
          type: "straight", // Straight line for spouses
          style: {
            stroke: "#ec4899",
            strokeWidth: 2,
            strokeDasharray: "5,5", // Dashed line for spouses
          },
          animated: false,
        });

        // Mark this spouse pair as processed
        spouseEdges.add(`${member.id}-${member.spouseId}`);
        spouseEdges.add(`${member.spouseId}-${member.id}`);
      }
    });

    // Remove duplicate edges (same source-target pairs)
    const uniqueEdges = newEdges.filter(
      (edge, index, self) =>
        index ===
        self.findIndex(
          (e) => e.source === edge.source && e.target === edge.target
        )
    );

    return { nodes: newNodes, edges: uniqueEdges };
  }, [members]); // Use members state instead of mockTreeData

  // Initialize graph data with useEffect for side effects
  useEffect(() => {
    setNodes(graphData.nodes);
    setEdges(graphData.edges);
  }, [graphData, setNodes, setEdges]);

  // Update node selection state separately
  useEffect(() => {
    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isSelected: node.id === selectedNode,
        },
      }))
    );
  }, [selectedNode, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        const newEdge = {
          ...params,
          id: `edge-${params.source}-${params.target}`,
          type: "smoothstep" as const,
          style: {
            stroke: "#3b82f6",
            strokeWidth: 2,
          },
          animated: false,
        };

        setEdges((eds) => addEdge(newEdge, eds));
        console.log("New connection created:", params);
      }
    },
    [setEdges]
  );

  const onNodeClick = useCallback(
    (event: any, node: Node) => {
      setSelectedNode(selectedNode === node.id ? null : node.id);
    },
    [selectedNode]
  );

  const resetView = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const selectedMember = selectedNode
    ? members.find((m) => m.id === selectedNode)
    : null;

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showExportMenu &&
        !(event.target as Element).closest(".export-menu")
      ) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showExportMenu]);

  // Enhanced PNG export using dom-to-image-more
  const exportAsPNG = useCallback(async () => {
    if (!reactFlowRef.current) return;

    try {
      // Get the React Flow viewport element
      const reactFlowViewport = reactFlowRef.current.querySelector(
        ".react-flow__viewport"
      );
      if (!reactFlowViewport) return;

      // Temporarily hide controls and panels
      const controls = reactFlowRef.current.querySelector(
        ".react-flow__controls"
      );
      const minimap = reactFlowRef.current.querySelector(
        ".react-flow__minimap"
      );
      const panel = reactFlowRef.current.querySelector(".react-flow__panel");

      const originalControlsStyle = controls?.getAttribute("style") || "";
      const originalMinimapStyle = minimap?.getAttribute("style") || "";
      const originalPanelStyle = panel?.getAttribute("style") || "";

      if (controls) controls.setAttribute("style", "display: none !important");
      if (minimap) minimap.setAttribute("style", "display: none !important");
      if (panel) panel.setAttribute("style", "display: none !important");

      // Wait for DOM update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Use dom-to-image-more for better React Flow support
      const dataUrl = await (domtoimage as any).toPng(
        reactFlowViewport as HTMLElement,
        {
          quality: 1.0,
          bgcolor: "#f9fafb",
          width: reactFlowViewport.scrollWidth,
          height: reactFlowViewport.scrollHeight,
          style: {
            transform: "scale(1)",
            "transform-origin": "top left",
          },
          filter: (node: any) => {
            // Filter out controls and other UI elements
            const className = node.className || "";
            return (
              typeof className === "string" &&
              !className.includes("react-flow__controls") &&
              !className.includes("react-flow__minimap") &&
              !className.includes("react-flow__panel")
            );
          },
        }
      );

      // Restore original styles
      if (controls) controls.setAttribute("style", originalControlsStyle);
      if (minimap) minimap.setAttribute("style", originalMinimapStyle);
      if (panel) panel.setAttribute("style", originalPanelStyle);

      // Download the image
      const link = document.createElement("a");
      link.download = `family-tree-${
        new Date().toISOString().split("T")[0]
      }.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting PNG:", error);
    }
  }, [reactFlowRef]);

  // Enhanced SVG export
  const exportAsSVG = useCallback(async () => {
    if (!reactFlowRef.current) return;

    try {
      // Get the React Flow viewport element
      const reactFlowViewport = reactFlowRef.current.querySelector(
        ".react-flow__viewport"
      );
      if (!reactFlowViewport) return;

      // Temporarily hide controls and panels
      const controls = reactFlowRef.current.querySelector(
        ".react-flow__controls"
      );
      const minimap = reactFlowRef.current.querySelector(
        ".react-flow__minimap"
      );
      const panel = reactFlowRef.current.querySelector(".react-flow__panel");

      const originalControlsStyle = controls?.getAttribute("style") || "";
      const originalMinimapStyle = minimap?.getAttribute("style") || "";
      const originalPanelStyle = panel?.getAttribute("style") || "";

      if (controls) controls.setAttribute("style", "display: none !important");
      if (minimap) minimap.setAttribute("style", "display: none !important");
      if (panel) panel.setAttribute("style", "display: none !important");

      // Wait for DOM update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Use dom-to-image-more for SVG export
      const dataUrl = await (domtoimage as any).toSvg(
        reactFlowViewport as HTMLElement,
        {
          quality: 1.0,
          bgcolor: "#f9fafb",
          width: reactFlowViewport.scrollWidth,
          height: reactFlowViewport.scrollHeight,
          style: {
            transform: "scale(1)",
            "transform-origin": "top left",
          },
          filter: (node: any) => {
            // Filter out controls and other UI elements
            const className = node.className || "";
            return (
              typeof className === "string" &&
              !className.includes("react-flow__controls") &&
              !className.includes("react-flow__minimap") &&
              !className.includes("react-flow__panel")
            );
          },
        }
      );

      // Restore original styles
      if (controls) controls.setAttribute("style", originalControlsStyle);
      if (minimap) minimap.setAttribute("style", originalMinimapStyle);
      if (panel) panel.setAttribute("style", originalPanelStyle);

      // Download the SVG
      const link = document.createElement("a");
      link.download = `family-tree-${
        new Date().toISOString().split("T")[0]
      }.svg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting SVG:", error);
    }
  }, [reactFlowRef]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Family Tree Graph
          </h1>
          <p className="text-gray-600">
            Converting flat member data to nodes and edges with automatic
            positioning
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Graph Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Family Tree Visualization
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowInfo(!showInfo)}
                    >
                      {showInfo ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Info className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetView}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <div className="relative export-menu">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        title="Export diagram"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                      {showExportMenu && (
                        <div className="absolute right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-50 min-w-[120px]">
                          <button
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                            onClick={() => {
                              exportAsPNG();
                              setShowExportMenu(false);
                            }}
                          >
                            <Download className="h-3 w-3" />
                            PNG Image
                          </button>
                          <button
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                            onClick={() => {
                              exportAsSVG();
                              setShowExportMenu(false);
                            }}
                          >
                            <Download className="h-3 w-3" />
                            SVG Vector
                          </button>
                        </div>
                      )}
                    </div>
                    <Dialog
                      open={isAddModalOpen}
                      onOpenChange={setIsAddModalOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4" />
                          Add Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Family Member</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                value={newMember.firstName}
                                onChange={(e) =>
                                  setNewMember((prev) => ({
                                    ...prev,
                                    firstName: e.target.value,
                                  }))
                                }
                                placeholder="Enter first name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                value={newMember.lastName}
                                onChange={(e) =>
                                  setNewMember((prev) => ({
                                    ...prev,
                                    lastName: e.target.value,
                                  }))
                                }
                                placeholder="Enter last name"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="gender">Gender</Label>
                              <Select
                                value={newMember.gender}
                                onValueChange={(value) =>
                                  setNewMember((prev) => ({
                                    ...prev,
                                    gender: value as
                                      | "male"
                                      | "female"
                                      | "other",
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="birthDate">Birth Date</Label>
                              <Input
                                id="birthDate"
                                type="date"
                                value={newMember.birthDate}
                                onChange={(e) =>
                                  setNewMember((prev) => ({
                                    ...prev,
                                    birthDate: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>

                          {/* Relationship Selection */}
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="parents">Parents</Label>
                              <Select
                                value=""
                                onValueChange={(value) => {
                                  if (
                                    value &&
                                    !newMember.parents.includes(value)
                                  ) {
                                    setNewMember((prev) => ({
                                      ...prev,
                                      parents: [...prev.parents, value],
                                    }));
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select parent..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {members
                                    .filter(
                                      (m) =>
                                        !newMember.parents.includes(m.id) &&
                                        isValidParent(m.id)
                                    )
                                    .map((member) => (
                                      <SelectItem
                                        key={member.id}
                                        value={member.id}
                                      >
                                        {member.firstName} {member.lastName}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              {newMember.parents.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {newMember.parents.map((parentId) => {
                                    const parent = members.find(
                                      (m) => m.id === parentId
                                    );
                                    return parent ? (
                                      <Badge
                                        key={parentId}
                                        variant="outline"
                                        className="text-xs cursor-pointer"
                                        onClick={() =>
                                          setNewMember((prev) => ({
                                            ...prev,
                                            parents: prev.parents.filter(
                                              (id) => id !== parentId
                                            ),
                                          }))
                                        }
                                      >
                                        {parent.firstName} {parent.lastName} ×
                                      </Badge>
                                    ) : null;
                                  })}
                                </div>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="children">Children</Label>
                              <Select
                                value=""
                                onValueChange={(value) => {
                                  if (
                                    value &&
                                    !newMember.children.includes(value)
                                  ) {
                                    setNewMember((prev) => ({
                                      ...prev,
                                      children: [...prev.children, value],
                                    }));
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select child..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {members
                                    .filter(
                                      (m) =>
                                        !newMember.children.includes(m.id) &&
                                        isValidChild(m.id)
                                    )
                                    .map((member) => (
                                      <SelectItem
                                        key={member.id}
                                        value={member.id}
                                      >
                                        {member.firstName} {member.lastName}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              {newMember.children.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {newMember.children.map((childId) => {
                                    const child = members.find(
                                      (m) => m.id === childId
                                    );
                                    return child ? (
                                      <Badge
                                        key={childId}
                                        variant="outline"
                                        className="text-xs cursor-pointer"
                                        onClick={() =>
                                          setNewMember((prev) => ({
                                            ...prev,
                                            children: prev.children.filter(
                                              (id) => id !== childId
                                            ),
                                          }))
                                        }
                                      >
                                        {child.firstName} {child.lastName} ×
                                      </Badge>
                                    ) : null;
                                  })}
                                </div>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="spouse">Spouse</Label>
                              <Select
                                value={newMember.spouseId || "none"}
                                onValueChange={(value) =>
                                  setNewMember((prev) => ({
                                    ...prev,
                                    spouseId: value === "none" ? null : value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select spouse..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">
                                    No spouse
                                  </SelectItem>
                                  {members
                                    .filter(
                                      (m) =>
                                        m.id !== newMember.spouseId &&
                                        !m.spouseId && // Not already married
                                        isValidSpouse(m.id)
                                    )
                                    .map((member) => (
                                      <SelectItem
                                        key={member.id}
                                        value={member.id}
                                      >
                                        {member.firstName} {member.lastName}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsAddModalOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={addMember}>Add Member</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <div className="w-full h-full">
                  <ReactFlowProvider>
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onConnect={onConnect}
                      onNodeClick={onNodeClick}
                      nodeTypes={nodeTypes}
                      fitView
                      fitViewOptions={{
                        padding: 0.4,
                        includeHiddenNodes: false,
                        minZoom: 0.5,
                        maxZoom: 1.5,
                      }}
                      minZoom={0.3}
                      maxZoom={2}
                      connectOnClick={true}
                      defaultEdgeOptions={{
                        type: "smoothstep",
                        style: { stroke: "#3b82f6", strokeWidth: 2 },
                      }}
                      ref={reactFlowRef}
                    >
                      <Background />
                      <Controls />
                      <MiniMap />

                      {/* Info Panel */}
                      {showInfo && (
                        <Panel
                          position="top-left"
                          className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg"
                        >
                          <div className="space-y-3">
                            <h3 className="font-semibold text-sm">
                              Graph Features
                            </h3>
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span>Parent → Child relationships</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                                <span>Spouse relationships (dashed)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
                                <span>Male members</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-pink-100 rounded-full"></div>
                                <span>Female members</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Incoming connections</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Outgoing connections</span>
                              </div>
                            </div>
                          </div>
                        </Panel>
                      )}
                    </ReactFlow>
                  </ReactFlowProvider>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Members:</span>
                  <Badge variant="secondary">{members.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Male:</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {members.filter((m) => m.gender === "male").length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Female:</span>
                  <Badge variant="outline" className="bg-pink-50 text-pink-700">
                    {members.filter((m) => m.gender === "female").length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Relationships:</span>
                  <Badge variant="outline">{edges.length}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Selected Member Details */}
            {selectedMember && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Selected Member
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {selectedMember.firstName} {selectedMember.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {selectedMember.gender}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(selectedMember)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMember(selectedMember.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Birth Date:</span>
                      <p className="text-sm">
                        {selectedMember.birthDate
                          ? new Date(
                              selectedMember.birthDate
                            ).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs text-gray-500">Parents:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedMember.parents.length > 0 ? (
                          selectedMember.parents.map((parentId) => {
                            const parent = members.find(
                              (m) => m.id === parentId
                            );
                            return parent ? (
                              <Badge
                                key={parentId}
                                variant="outline"
                                className="text-xs"
                              >
                                {parent.firstName} {parent.lastName}
                              </Badge>
                            ) : null;
                          })
                        ) : (
                          <span className="text-sm text-gray-400">None</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-gray-500">Children:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedMember.children.length > 0 ? (
                          selectedMember.children.map((childId) => {
                            const child = members.find((m) => m.id === childId);
                            return child ? (
                              <Badge
                                key={childId}
                                variant="outline"
                                className="text-xs"
                              >
                                {child.firstName} {child.lastName}
                              </Badge>
                            ) : null;
                          })
                        ) : (
                          <span className="text-sm text-gray-400">None</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Edit Member Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Family Member</DialogTitle>
                </DialogHeader>
                {editingMember && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="editFirstName">First Name</Label>
                        <Input
                          id="editFirstName"
                          value={editingMember.firstName}
                          onChange={(e) =>
                            setEditingMember((prev) =>
                              prev
                                ? { ...prev, firstName: e.target.value }
                                : null
                            )
                          }
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="editLastName">Last Name</Label>
                        <Input
                          id="editLastName"
                          value={editingMember.lastName}
                          onChange={(e) =>
                            setEditingMember((prev) =>
                              prev
                                ? { ...prev, lastName: e.target.value }
                                : null
                            )
                          }
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="editGender">Gender</Label>
                        <Select
                          value={editingMember.gender}
                          onValueChange={(value) =>
                            setEditingMember((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    gender: value as
                                      | "male"
                                      | "female"
                                      | "other",
                                  }
                                : null
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="editBirthDate">Birth Date</Label>
                        <Input
                          id="editBirthDate"
                          type="date"
                          value={editingMember.birthDate}
                          onChange={(e) =>
                            setEditingMember((prev) =>
                              prev
                                ? { ...prev, birthDate: e.target.value }
                                : null
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={editMember}>Save Changes</Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Data Structure Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Data Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    Flat member data converted to graph structure:
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li>
                      • <strong>Nodes:</strong> Family members with full names
                      and gender
                    </li>
                    <li>
                      • <strong>Edges:</strong> Parent-child relationships only
                    </li>
                    <li>
                      • <strong>Positioning:</strong> Automatic generation-based
                      layout
                    </li>
                    <li>
                      • <strong>Fit View:</strong> Automatically centers all
                      content
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
