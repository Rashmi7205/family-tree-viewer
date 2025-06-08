import connectDB from "./mongodb"
import AuditLog from "@/models/AuditLog"

export async function logAudit(userId: string, action: string, targetType: string, targetId: string, details?: any) {
  await connectDB()

  await AuditLog.create({
    userId,
    action,
    targetType,
    targetId,
    details,
  })
}
