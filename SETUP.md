# Local Setup Guide for Family Tree Viewer

This guide will walk you through setting up the Family Tree Viewer application on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (version 5.0 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/downloads)
- **Code Editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

## Step 1: Clone the Repository

\`\`\`bash
# Clone the repository (replace with your actual repo URL)
git clone https://github.com/your-username/family-tree-viewer.git

# Navigate to the project directory
cd family-tree-viewer
\`\`\`

## Step 2: Install Dependencies

\`\`\`bash
# Install all required packages
npm install

# Or if you prefer yarn
yarn install
\`\`\`

## Step 3: Set Up MongoDB

### Option A: Local MongoDB Installation

1. **Install MongoDB Community Edition**
   - Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Follow the installation instructions for your operating system

2. **Start MongoDB Service**

   **On Windows:**
   \`\`\`bash
   # Start MongoDB as a service (if installed as service)
   net start MongoDB

   # Or start manually
   mongod --dbpath "C:\data\db"
   \`\`\`

   **On macOS:**
   \`\`\`bash
   # If installed via Homebrew
   brew services start mongodb-community

   # Or start manually
   mongod --config /usr/local/etc/mongod.conf
   \`\`\`

   **On Linux:**
   \`\`\`bash
   # Start MongoDB service
   sudo systemctl start mongod

   # Enable auto-start on boot
   sudo systemctl enable mongod
   \`\`\`

3. **Verify MongoDB is Running**
   \`\`\`bash
   # Connect to MongoDB shell
   mongosh

   # You should see a connection message
   # Type 'exit' to close the shell
   \`\`\`

### Option B: MongoDB Atlas (Cloud Database)

1. **Create a MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a New Cluster**
   - Click "Build a Database"
   - Choose "FREE" tier
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Set Up Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password
   - Set permissions to "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (for development)
   - Or add your specific IP address

5. **Get Connection String**
   - Go to "Databases" and click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

## Step 4: Environment Configuration

1. **Create Environment File**
   \`\`\`bash
   # Copy the example environment file
   cp .env.example .env
   \`\`\`

2. **Edit the .env file**
   \`\`\`bash
   # Open in your preferred editor
   nano .env
   # or
   code .env
   \`\`\`

3. **Configure Environment Variables**

   **For Local MongoDB:**
   \`\`\`env
   # Database
   MONGODB_URI="mongodb://localhost:27017/familytree"

   # Authentication
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

   # Next.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-change-this-too"

   # Optional: File Upload (for future image upload features)
   CLOUDINARY_CLOUD_NAME=""
   CLOUDINARY_API_KEY=""
   CLOUDINARY_API_SECRET=""
   \`\`\`

   **For MongoDB Atlas:**
   \`\`\`env
   # Database (replace with your Atlas connection string)
   MONGODB_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/familytree?retryWrites=true&w=majority"

   # Authentication
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

   # Next.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-change-this-too"
   \`\`\`

   **Important Security Notes:**
   - Replace `JWT_SECRET` with a strong, random string (at least 32 characters)
   - Replace `NEXTAUTH_SECRET` with another strong, random string
   - Never commit these secrets to version control

## Step 5: Generate Strong Secrets

You can generate secure secrets using Node.js:

\`\`\`bash
# Generate JWT secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate NextAuth secret
node -e "console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

## Step 6: Start the Development Server

\`\`\`bash
# Start the Next.js development server
npm run dev

# Or with yarn
yarn dev
\`\`\`

The application should now be running at [http://localhost:3000](http://localhost:3000)

## Step 7: Verify the Setup

1. **Open your browser** and navigate to `http://localhost:3000`
2. **Check the homepage** - you should see the Family Tree Viewer landing page
3. **Test the demo** - click "View Demo" to see the interactive family tree
4. **Try registration** - click "Get Started" to create a test account
5. **Check the console** - ensure there are no error messages

## Step 8: Create Your First Family Tree

1. **Register a new account** at `http://localhost:3000/register`
2. **Login** with your credentials
3. **Create a new family tree** from the dashboard
4. **Add family members** and relationships
5. **View your tree** in the interactive viewer

## Troubleshooting

### Common Issues and Solutions

#### 1. MongoDB Connection Issues

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**
- Ensure MongoDB is running: `mongosh` should connect successfully
- Check if the MongoDB service is started
- Verify the connection string in `.env`
- For Atlas: check network access settings and credentials

#### 2. Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions:**
\`\`\`bash
# Find what's using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or use a different port
npm run dev -- -p 3001
\`\`\`

#### 3. Environment Variables Not Loading

**Error:** `JWT_SECRET is not defined`

**Solutions:**
- Ensure `.env` file is in the root directory
- Check that variable names match exactly (no extra spaces)
- Restart the development server after changing `.env`

#### 4. Module Not Found Errors

**Error:** `Module not found: Can't resolve '@/components/...'`

**Solutions:**
\`\`\`bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or clear Next.js cache
rm -rf .next
npm run dev
\`\`\`

#### 5. TypeScript Errors

**Error:** Various TypeScript compilation errors

**Solutions:**
\`\`\`bash
# Install TypeScript globally
npm install -g typescript

# Check TypeScript configuration
npx tsc --noEmit

# Restart TypeScript server in VS Code
# Ctrl+Shift+P -> "TypeScript: Restart TS Server"
\`\`\`

## Development Tools

### Recommended VS Code Extensions

\`\`\`json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "mongodb.mongodb-vscode",
    "ms-vscode.vscode-json"
  ]
}
\`\`\`

### MongoDB GUI Tools

- **MongoDB Compass** (Official GUI) - [Download](https://www.mongodb.com/products/compass)
- **Studio 3T** (Advanced features) - [Download](https://studio3t.com/)
- **Robo 3T** (Lightweight) - [Download](https://robomongo.org/)

### Useful Commands

\`\`\`bash
# View MongoDB databases
mongosh --eval "show dbs"

# Connect to your database
mongosh familytree

# View collections
mongosh familytree --eval "show collections"

# View users collection
mongosh familytree --eval "db.users.find().pretty()"

# Clear all data (be careful!)
mongosh familytree --eval "db.dropDatabase()"
\`\`\`

## Project Structure

\`\`\`
family-tree-viewer/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── family-trees/  # Family tree CRUD
│   │   └── public/        # Public sharing endpoints
│   ├── dashboard/         # Dashboard page
│   ├── demo/             # Demo walkthrough
│   ├── login/            # Authentication pages
│   ├── register/         # Registration page
│   ├── trees/            # Tree management pages
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── family-tree/      # Tree visualization
│   └── ui/               # shadcn/ui components
├── contexts/             # React contexts
│   └── auth-context.tsx  # Authentication context
├── lib/                  # Utility functions
│   ├── mongodb.ts        # Database connection
│   ├── auth.ts           # Authentication utilities
│   └── audit.ts          # Audit logging
├── models/               # Mongoose models
│   ├── User.ts           # User model
│   ├── FamilyTree.ts     # Family tree model
│   ├── Member.ts         # Member model
│   ├── Relationship.ts   # Relationship model
│   ├── PasswordReset.ts  # Password reset model
│   └── AuditLog.ts       # Audit log model
├── public/               # Static assets
├── .env                  # Environment variables (create this)
├── .env.example          # Environment template
├── package.json          # Dependencies
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
\`\`\`

## Next Steps

Once you have the application running locally:

1. **Explore the Demo** - Visit `/demo` to see all features
2. **Create Test Data** - Add sample family members and relationships
3. **Test API Endpoints** - Use tools like Postman or curl to test the API
4. **Customize the UI** - Modify components and styling to your needs
5. **Add Features** - Implement additional functionality as needed

## Getting Help

If you encounter issues:

1. **Check the Console** - Look for error messages in browser dev tools
2. **Check Server Logs** - Look at the terminal where you ran `npm run dev`
3. **Review MongoDB Logs** - Check MongoDB logs for database issues
4. **Search Issues** - Look for similar problems in the project's GitHub issues
5. **Create an Issue** - If you find a bug, please report it

## Production Deployment

For production deployment, see the separate deployment guide or check:
- [Vercel Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas Production Setup](https://docs.atlas.mongodb.com/)
- [Environment Security Best Practices](https://nextjs.org/docs/basic-features/environment-variables)
