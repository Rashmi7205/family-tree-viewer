import { useState, useCallback, useMemo, useEffect } from "react";
import { Edge, Node, useNodesState, useEdgesState } from "reactflow";
import { FamilyMember, FamilyMemberNode } from "./types";
import { useAuth } from "@/lib/auth/auth-context";

export const useFamilyTree = (treeId: string) => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
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
    bio: "",
    children: [],
    spouseId: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch members from API
  const refreshMembers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/family-trees/${treeId}/members`, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch members");
      const data = await res.json();
      setMembers(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [treeId, user]);

  useEffect(() => {
    if (treeId && user) {
      refreshMembers();
    }
  }, [treeId, user, refreshMembers]);

  // Add member
  const addMember = useCallback(
    async (formData: FormData) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const token = await user.getIdToken();
        const headers = new Headers();
        if (token) {
          headers.append("Authorization", `Bearer ${token}`);
        }

        const res = await fetch(`/api/family-trees/${treeId}/members`, {
          method: "POST",
          headers,
          body: formData,
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to add member");
        }
        await refreshMembers();
        setIsAddModalOpen(false);
        setNewMember({
          firstName: "",
          lastName: "",
          gender: "male",
          birthDate: "",
          parents: [],
          children: [],
          spouseId: null,
          bio: "",
        });
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [treeId, user, refreshMembers]
  );

  // Edit member
  const editMember = useCallback(
    async (memberId: string, formData: FormData) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const token = await user.getIdToken();
        const headers = new Headers();
        if (token) {
          headers.append("Authorization", `Bearer ${token}`);
        }
        const res = await fetch(
          `/api/family-trees/${treeId}/members/${memberId}`,
          {
            method: "PUT",
            headers,
            body: formData,
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to update member");
        }
        await refreshMembers();
        setIsEditModalOpen(false);
        setEditingMember(null);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [treeId, user, refreshMembers]
  );

  // Delete member
  const deleteMember = useCallback(
    async (memberId: string) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const token = await user.getIdToken();
        const res = await fetch(
          `/api/family-trees/${treeId}/members/${memberId}`,
          {
            method: "DELETE",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to delete member");
        }
        await refreshMembers();
        setSelectedNodeId(null);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [treeId, user, refreshMembers]
  );

  const openEditModal = useCallback((member: FamilyMember) => {
    setEditingMember({ ...member });
    setIsEditModalOpen(true);
  }, []);

  const onNodeClick = useCallback(
    (_: any, node: Node) => {
      setSelectedNodeId(selectedNodeId === node.id ? null : node.id);
    },
    [selectedNodeId]
  );

  const graphData = useMemo(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const couples = new Map<string, string>();
    const coupleMembers = new Map<string, string[]>();

    members.forEach((member) => {
      const coupleId = member.spouseId
        ? [member.id, member.spouseId].sort().join("-")
        : member.id;
      couples.set(member.id, coupleId);
      if (!coupleMembers.has(coupleId)) {
        coupleMembers.set(coupleId, []);
      }
      coupleMembers.get(coupleId)!.push(member.id);
    });

    const generationMap = new Map<string, number>();
    const findGeneration = (
      memberId: string,
      visited = new Set<string>()
    ): number => {
      if (visited.has(memberId)) return 0;
      visited.add(memberId);
      const member = members.find((m) => m.id === memberId);
      if (!member || !member.parents.length) return 0;
      const parentLevels = member.parents.map((pid) =>
        findGeneration(pid, visited)
      );
      return Math.max(...parentLevels) + 1;
    };

    coupleMembers.forEach((membersInCouple, coupleId) => {
      const generation = Math.min(
        ...membersInCouple.map((mid) => findGeneration(mid))
      );
      generationMap.set(coupleId, generation);
    });

    const generationGroups = new Map<number, string[]>();
    generationMap.forEach((gen, coupleId) => {
      if (!generationGroups.has(gen)) {
        generationGroups.set(gen, []);
      }
      generationGroups.get(gen)!.push(coupleId);
    });

    const spacingY = 320;
    const spacingX = 500;
    const spouseOffset = 540;

    Array.from(generationGroups.entries())
      .sort(([genA], [genB]) => genA - genB)
      .forEach(([generation, coupleIds]) => {
        const y = generation * spacingY;
        coupleIds.forEach((cid, index) => {
          const couple = coupleMembers.get(cid)!;
          const totalWidth = (couple.length - 1) * spouseOffset;

          couple.forEach((mid, spouseIndex) => {
            const x =
              index * spacingX + spouseIndex * spouseOffset - totalWidth / 2;
            const member = members.find((m) => m.id === mid)!;
            newNodes.push({
              id: mid,
              position: { x, y },
              data: { ...member, isSelected: false },
              type: "familyMember",
            });
          });
        });
      });

    members.forEach((member) => {
      member.parents.forEach((parentId) => {
        newEdges.push({
          id: `parent-${parentId}-${member.id}`,
          source: parentId,
          target: member.id,
          type: "smoothstep",
          style: { stroke: "#3b82f6", strokeWidth: 2 },
        });
      });
    });

    const spouseEdges = new Set<string>();
    members.forEach((member) => {
      if (
        member.spouseId &&
        !spouseEdges.has(`${member.id}-${member.spouseId}`)
      ) {
        newEdges.push({
          id: `spouse-${member.id}-${member.spouseId}`,
          source: member.id,
          target: member.spouseId,
          type: "straight",
          style: { stroke: "#ec4899", strokeWidth: 2, strokeDasharray: "5,5" },
        });
        spouseEdges.add(`${member.id}-${member.spouseId}`);
        spouseEdges.add(`${member.spouseId}-${member.id}`);
      }
    });

    return { nodes: newNodes, edges: newEdges };
  }, [members]);

  useEffect(() => {
    setNodes(graphData.nodes);
    setEdges(graphData.edges);
  }, [graphData, setNodes, setEdges]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, isSelected: node.id === selectedNodeId },
      }))
    );
  }, [selectedNodeId, setNodes]);

  const selectedMember = selectedNodeId
    ? members.find((m) => m.id === selectedNodeId)
    : null;

  const memberInModal = isEditModalOpen ? editingMember : newMember;

  // Validation for relationship selection
  const isValidParent = useCallback(
    (parentId: string) => {
      if (!memberInModal) return false;
      // The person being edited cannot be their own parent
      if (isEditModalOpen && parentId === editingMember?.id) return false;
      // A parent cannot already be a child or the spouse
      return (
        !memberInModal.children.includes(parentId) &&
        memberInModal.spouseId !== parentId
      );
    },
    [memberInModal, isEditModalOpen, editingMember]
  );
  const isValidChild = useCallback(
    (childId: string) => {
      if (!memberInModal) return false;
      // The person being edited cannot be their own child
      if (isEditModalOpen && childId === editingMember?.id) return false;
      // A child cannot already be a parent or the spouse
      return (
        !memberInModal.parents.includes(childId) &&
        memberInModal.spouseId !== childId
      );
    },
    [memberInModal, isEditModalOpen, editingMember]
  );
  const isValidSpouse = useCallback(
    (spouseId: string) => {
      if (!memberInModal) return true;
      // The person being edited cannot be their own spouse
      if (isEditModalOpen && spouseId === editingMember?.id) return false;

      // A spouse cannot be a parent or child
      if (
        memberInModal.parents.includes(spouseId) ||
        memberInModal.children.includes(spouseId)
      )
        return false;

      // A spouse cannot be a sibling
      const potentialSpouse = members.find((m) => m.id === spouseId);
      if (potentialSpouse && memberInModal.parents.length > 0) {
        const sharedParents = memberInModal.parents.filter((p) =>
          potentialSpouse.parents.includes(p)
        );
        if (sharedParents.length > 0) return false;
      }
      return true;
    },
    [memberInModal, members, isEditModalOpen, editingMember]
  );

  return {
    members,
    nodes,
    edges,
    selectedNodeId,
    selectedMember,
    isAddModalOpen,
    isEditModalOpen,
    editingMember,
    newMember,
    onNodesChange,
    onEdgesChange,
    onNodeClick,
    setMembers,
    setNewMember,
    setEditingMember,
    setIsAddModalOpen,
    setIsEditModalOpen,
    addMember,
    editMember,
    deleteMember,
    openEditModal,
    setSelectedNodeId,
    refreshMembers,
    loading,
    error,
    validation: { isValidParent, isValidChild, isValidSpouse },
  };
};
