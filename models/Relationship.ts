import mongoose, { type Document, Schema } from "mongoose"

export interface IRelationship extends Document {
  _id: string
  familyTreeId: string
  member1Id: string
  member2Id: string
  relationshipType: string
  createdAt: Date
  updatedAt: Date
}

const RelationshipSchema = new Schema<IRelationship>(
  {
    familyTreeId: {
      type: String,
      required: true,
      index: true,
    },
    member1Id: {
      type: String,
      required: true,
    },
    member2Id: {
      type: String,
      required: true,
    },
    relationshipType: {
      type: String,
      required: true,
      enum: ["parent", "child", "spouse", "sibling", "grandparent", "grandchild", "cousin"],
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to prevent duplicate relationships
RelationshipSchema.index({ member1Id: 1, member2Id: 1, relationshipType: 1 }, { unique: true })

export default mongoose.models.Relationship || mongoose.model<IRelationship>("Relationship", RelationshipSchema)
