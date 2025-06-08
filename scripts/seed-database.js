const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// Import models
const User = require("../models/User")
const FamilyTree = require("../models/FamilyTree")
const Member = require("../models/Member")
const Relationship = require("../models/Relationship")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/familytree"

async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...")

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log("✅ Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await FamilyTree.deleteMany({})
    await Member.deleteMany({})
    await Relationship.deleteMany({})
    console.log("🧹 Cleared existing data")

    // Create demo user
    const hashedPassword = await bcrypt.hash("demo123", 12)
    const demoUser = await User.create({
      email: "demo@familytree.com",
      passwordHash: hashedPassword,
      displayName: "Demo User",
    })
    console.log("👤 Created demo user")

    // Create demo family tree
    const familyTree = await FamilyTree.create({
      name: "The Smith Family",
      description: "A demonstration family tree with multiple generations",
      userId: demoUser._id.toString(),
      isPublic: true,
    })
    console.log("🌳 Created demo family tree")

    // Create family members
    const members = await Member.insertMany([
      {
        familyTreeId: familyTree._id.toString(),
        firstName: "John",
        lastName: "Smith",
        birthDate: new Date("1920-01-15"),
        deathDate: new Date("1995-06-20"),
        gender: "Male",
        bio: "Patriarch of the Smith family, worked as a carpenter.",
      },
      {
        familyTreeId: familyTree._id.toString(),
        firstName: "Mary",
        lastName: "Smith",
        birthDate: new Date("1925-03-10"),
        deathDate: new Date("2000-12-05"),
        gender: "Female",
        bio: "Loving mother and grandmother, taught elementary school.",
      },
      {
        familyTreeId: familyTree._id.toString(),
        firstName: "Robert",
        lastName: "Smith",
        birthDate: new Date("1945-07-22"),
        gender: "Male",
        bio: "Eldest son, became a doctor.",
      },
      {
        familyTreeId: familyTree._id.toString(),
        firstName: "Susan",
        lastName: "Johnson",
        birthDate: new Date("1948-11-30"),
        gender: "Female",
        bio: "Married Robert, works as a nurse.",
      },
      {
        familyTreeId: familyTree._id.toString(),
        firstName: "Michael",
        lastName: "Smith",
        birthDate: new Date("1970-04-18"),
        gender: "Male",
        bio: "Son of Robert and Susan, software engineer.",
      },
      {
        familyTreeId: familyTree._id.toString(),
        firstName: "Jennifer",
        lastName: "Smith",
        birthDate: new Date("1972-09-25"),
        gender: "Female",
        bio: "Daughter of Robert and Susan, teacher.",
      },
    ])
    console.log("👥 Created family members")

    // Create relationships
    await Relationship.insertMany([
      {
        familyTreeId: familyTree._id.toString(),
        member1Id: members[0]._id.toString(), // John
        member2Id: members[2]._id.toString(), // Robert
        relationshipType: "parent",
      },
      {
        familyTreeId: familyTree._id.toString(),
        member1Id: members[1]._id.toString(), // Mary
        member2Id: members[2]._id.toString(), // Robert
        relationshipType: "parent",
      },
      {
        familyTreeId: familyTree._id.toString(),
        member1Id: members[2]._id.toString(), // Robert
        member2Id: members[4]._id.toString(), // Michael
        relationshipType: "parent",
      },
      {
        familyTreeId: familyTree._id.toString(),
        member1Id: members[2]._id.toString(), // Robert
        member2Id: members[5]._id.toString(), // Jennifer
        relationshipType: "parent",
      },
      {
        familyTreeId: familyTree._id.toString(),
        member1Id: members[3]._id.toString(), // Susan
        member2Id: members[4]._id.toString(), // Michael
        relationshipType: "parent",
      },
      {
        familyTreeId: familyTree._id.toString(),
        member1Id: members[3]._id.toString(), // Susan
        member2Id: members[5]._id.toString(), // Jennifer
        relationshipType: "parent",
      },
      {
        familyTreeId: familyTree._id.toString(),
        member1Id: members[0]._id.toString(), // John
        member2Id: members[1]._id.toString(), // Mary
        relationshipType: "spouse",
      },
      {
        familyTreeId: familyTree._id.toString(),
        member1Id: members[2]._id.toString(), // Robert
        member2Id: members[3]._id.toString(), // Susan
        relationshipType: "spouse",
      },
    ])
    console.log("💕 Created family relationships")

    console.log("🎉 Database seeded successfully!")
    console.log("")
    console.log("Demo credentials:")
    console.log("Email: demo@familytree.com")
    console.log("Password: demo123")
    console.log("")
    console.log("You can now login and explore the demo family tree!")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
  } finally {
    await mongoose.disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
}

module.exports = seedDatabase
