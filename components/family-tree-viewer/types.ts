import { Node } from "reactflow";

// Type definition for family member
export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  birthDate: string;
  familyTreeId: string;
  bio?:string;
  parents: string[];
  children: string[];
  spouseId: string | null;
}

export type FamilyMemberNode = Node<FamilyMember & { isSelected: boolean }>;
