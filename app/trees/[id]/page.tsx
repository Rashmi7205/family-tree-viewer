"use client";

import { useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";

import { useFamilyTree } from "@/components/family-tree-viewer/hooks";
import { Header } from "@/components/family-tree-viewer/Header";
import { Sidebar } from "@/components/family-tree-viewer/Sidebar";
import { TreeCanvas } from "@/components/family-tree-viewer/TreeCanvas";
import { AddEditMemberModal } from "@/components/family-tree-viewer/AddEditMemberModal";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ReactFlowProvider, useReactFlow } from "reactflow";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

function MemberDetailSheet({
  open,
  member,
  onClose,
  onEdit,
  onDelete,
}: {
  open: boolean;
  member: any;
  onClose: () => void;
  onEdit: (member: any) => void;
  onDelete: (memberId: string) => void;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  if (!member) return null;
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="max-w-[90vw] w-[400px] sm:w-[400px] p-0"
      >
        <div className="p-6 flex flex-col h-full">
          <SheetHeader>
            <SheetTitle className="text-xl sm:text-2xl font-bold mb-2">
              {member.firstName} {member.lastName}
            </SheetTitle>
            <SheetDescription className="text-xs sm:text-sm text-gray-500 mb-4">
              {member.gender}{" "}
              {member.birthDate && (
                <>| {new Date(member.birthDate).toLocaleDateString()}</>
              )}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col items-center gap-4 flex-1">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center text-4xl text-white font-bold overflow-hidden">
              {member.profileImageUrl ? (
                <img
                  src={member.profileImageUrl}
                  alt={`${member.firstName} ${member.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{member.firstName?.[0]}</span>
              )}
            </div>
            <div className="w-full">
              <div className="mb-2">
                <span className="font-semibold">Parents:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {member.parents && member.parents.length > 0 ? (
                    member.parents.map((pid: string) => {
                      const parent = member.allMembers?.find(
                        (m: any) => m.id === pid
                      );
                      return parent ? (
                        <span
                          key={pid}
                          className="bg-gray-100 text-gray-700 rounded px-2 py-0.5 text-xs"
                        >
                          {parent.firstName} {parent.lastName}
                        </span>
                      ) : null;
                    })
                  ) : (
                    <span className="text-gray-400 text-xs ml-2">None</span>
                  )}
                </div>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Children:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {member.children && member.children.length > 0 ? (
                    member.children.map((cid: string) => {
                      const child = member.allMembers?.find(
                        (m: any) => m.id === cid
                      );
                      return child ? (
                        <span
                          key={cid}
                          className="bg-gray-100 text-gray-700 rounded px-2 py-0.5 text-xs"
                        >
                          {child.firstName} {child.lastName}
                        </span>
                      ) : null;
                    })
                  ) : (
                    <span className="text-gray-400 text-xs ml-2">None</span>
                  )}
                </div>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Spouse:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {member.spouseId ? (
                    (() => {
                      const spouse = member.allMembers?.find(
                        (m: any) => m.id === member.spouseId
                      );
                      return spouse ? (
                        <span className="bg-gray-100 text-gray-700 rounded px-2 py-0.5 text-xs">
                          {spouse.firstName} {spouse.lastName}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs ml-2">None</span>
                      );
                    })()
                  ) : (
                    <span className="text-gray-400 text-xs ml-2">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2 w-full">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onEdit(member)}
            >
              Edit Member
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Member
            </Button>
          </div>
          <SheetClose asChild>
            <Button className="mt-6 w-full">Close</Button>
          </SheetClose>
        </div>
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Family Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {member.firstName}{" "}
                {member.lastName}? This action cannot be undone and will also
                remove all relationships associated with this member.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onDelete(member.id);
                  setShowDeleteDialog(false);
                  onClose();
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Member
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
}

function DemotreeContent() {
  const params = useParams();
  const treeId = params?.id as string;
  const {
    members,
    nodes,
    edges,
    selectedMember,
    isAddModalOpen,
    isEditModalOpen,
    editingMember,
    newMember,
    onNodesChange,
    onEdgesChange,
    onNodeClick,
    setNewMember,
    setEditingMember,
    setIsAddModalOpen,
    setIsEditModalOpen,
    addMember,
    editMember,
    deleteMember,
    openEditModal,
    setSelectedNodeId,
    validation,
    loading,
    error,
  } = useFamilyTree(treeId);

  const reactFlowRef = useRef<HTMLDivElement>(null);
  const { setViewport } = useReactFlow();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMember, setSheetMember] = useState<any>(null);

  // Custom node click handler to open sheet
  const handleNodeClick = useCallback(
    (_: any, node: any) => {
      const member = members.find((m) => m.id === node.id);
      if (member) {
        setSheetMember({ ...member, allMembers: members });
        setSheetOpen(true);
      }
    },
    [members]
  );

  // Inject onShowDetails into each node's data
  const nodesWithHandler = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onShowDetails: () => {
        const member = members.find((m) => m.id === node.id);
        if (member) {
          setSheetMember({ ...member, allMembers: members });
          setSheetOpen(true);
        }
      },
    },
  }));

  const resetView = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 500 });
    setSelectedNodeId(null);
  }, [setViewport, setSelectedNodeId]);

  return (
    <div className="w-screen h-screen bg-gray-50 overflow-hidden relative">
      <Header onResetView={resetView} />

      <Button
        variant="outline"
        size="icon"
        className="absolute top-20 left-4 z-20"
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      >
        {isSidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
      </Button>

      <Sidebar
        isCollapsed={isSidebarCollapsed}
        members={members}
        selectedMember={selectedMember ?? null}
        onAddMember={() => setIsAddModalOpen(true)}
        onEditMember={openEditModal}
        onDeleteMember={deleteMember}
        edges={edges}
      />

      <TreeCanvas
        nodes={nodesWithHandler}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        reactFlowRef={reactFlowRef}
        showInfo={showInfo}
      />

      <MemberDetailSheet
        open={sheetOpen}
        member={sheetMember}
        onClose={() => setSheetOpen(false)}
        onEdit={(member) => {
          setEditingMember(member);
          setIsEditModalOpen(true);
          setSheetOpen(false);
        }}
        onDelete={(memberId) => {
          deleteMember(memberId);
          setSheetOpen(false);
        }}
      />

      <AddEditMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (formData: FormData) => {
          await addMember(formData);
        }}
        memberData={newMember}
        setMemberData={setNewMember}
        allMembers={members}
        validation={validation}
        isEditMode={false}
      />

      <AddEditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async (formData: FormData) => {
          if (editingMember) {
            await editMember(editingMember.id, formData);
          }
        }}
        memberData={editingMember}
        setMemberData={setEditingMember}
        allMembers={members}
        validation={validation}
        isEditMode={true}
      />
    </div>
  );
}

export default function DemotreePage() {
  return (
    <ReactFlowProvider>
      <DemotreeContent />
    </ReactFlowProvider>
  );
}
