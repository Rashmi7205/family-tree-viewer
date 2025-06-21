import mongoose, { type Document, Schema } from "mongoose"

export interface IPasswordReset extends Document {
  _id: string
  userId: string
  resetToken: string
  expiresAt: Date
  createdAt: Date
}

const PasswordResetSchema = new Schema<IPasswordReset>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    resetToken: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.PasswordReset || mongoose.model<IPasswordReset>("PasswordReset", PasswordResetSchema)
