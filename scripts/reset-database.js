const mongoose = require("mongoose")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/familytree"

async function resetDatabase() {
  try {
    console.log("🗑️  Resetting database...")

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log("✅ Connected to MongoDB")

    // Drop the entire database
    await mongoose.connection.db.dropDatabase()
    console.log("🧹 Database reset complete")
  } catch (error) {
    console.error("❌ Error resetting database:", error)
  } finally {
    await mongoose.disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  resetDatabase()
}

module.exports = resetDatabase
