const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"]

const optionalEnvVars = ["NEXT_PUBLIC_APP_URL"]

console.log("🔍 Validating Environment Variables...\n")

let hasErrors = false

// Check required variables
console.log("✅ Required Variables:")
requiredEnvVars.forEach((varName) => {
  const value = process.env[varName]
  if (!value) {
    console.log(`❌ ${varName}: Missing`)
    hasErrors = true
  } else if (varName === "JWT_SECRET" && value.length < 32) {
    console.log(`❌ ${varName}: Too short (minimum 32 characters)`)
    hasErrors = true
  } else {
    console.log(`✅ ${varName}: Set`)
  }
})

// Check optional variables
console.log("\n🔧 Optional Variables:")
optionalEnvVars.forEach((varName) => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: Set`)
  } else {
    console.log(`⚠️  ${varName}: Not set (using default)`)
  }
})

// MongoDB URI validation
if (process.env.MONGODB_URI) {
  const uri = process.env.MONGODB_URI
  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    console.log("\n❌ MONGODB_URI: Invalid format (must start with mongodb:// or mongodb+srv://)")
    hasErrors = true
  } else {
    console.log("✅ MONGODB_URI: Valid format")
  }
}

console.log("\n" + "=".repeat(50))
if (hasErrors) {
  console.log("❌ Environment validation failed!")
  console.log("Please fix the issues above before starting the application.")
  process.exit(1)
} else {
  console.log("✅ Environment validation passed!")
  console.log("Your application is ready to start.")
}
