import mongoose, { type Document, Schema } from "mongoose"

export interface IMember extends Document {
  _id: string
  familyTreeId: string
  firstName: string
  lastName: string
  birthDate?: Date
  deathDate?: Date
  gender?: string
  profileImageUrl?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}

const MemberSchema = new Schema<IMember>(
  {
    familyTreeId: {
      type: String,
      required: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    birthDate: {
      type: Date,
    },
    deathDate: {
      type: Date,
    },
    gender: {
      type: String,
      trim: true,
    },
    profileImageUrl: {
      type: String,
    },
    bio: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Member || mongoose.model<IMember>("Member", MemberSchema)
