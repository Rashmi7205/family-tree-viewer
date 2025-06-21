import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Users, Eye, Edit, Trash2 } from "lucide-react";
import { FamilyMember } from "./types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SidebarProps {
  isCollapsed: boolean;
  members: FamilyMember[];
  selectedMember: FamilyMember | null;
  onAddMember: () => void;
  onEditMember: (member: FamilyMember) => void;
  onDeleteMember: (id: string) => void;
  edges: any[];
}

export const Sidebar: FC<SidebarProps> = ({
  isCollapsed,
  members,
  selectedMember,
  onAddMember,
  onEditMember,
  onDeleteMember,
  edges,
}) => {
  if (isCollapsed) return null;

  return (
    <aside className="absolute top-20 left-4 z-10 w-80 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Statistics
            </div>
            <Button variant="outline" size="sm" onClick={onAddMember}>
              <Plus className="h-4 w-4" />
            </Button>
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
                  onClick={() => onEditMember(selectedMember)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteMember(selectedMember.id)}
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
                    ? new Date(selectedMember.birthDate).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Parents:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedMember.parents.length > 0 ? (
                    selectedMember.parents.map((parentId) => {
                      const parent = members.find((m) => m.id === parentId);
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
    </aside>
  );
};
