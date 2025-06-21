# Family Tree Viewer

A comprehensive Next.js application for building, visualizing, and sharing family trees with interactive features and secure authentication.

## Features

- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Family Tree Management**: Create, edit, and delete family trees
- **Member Profiles**: Rich member profiles with photos, dates, and biographies
- **Interactive Visualization**: Zoomable, pannable tree interface using react-d3-tree
- **Relationship Management**: Support for various relationship types (parent, child, spouse, sibling, etc.)
- **Public Sharing**: Share family trees via unique links
- **Export Functionality**: Export trees as PDF or images (stub implementation)
- **Audit Logging**: Comprehensive logging of user actions
- **Responsive Design**: Mobile-friendly interface
- **Demo Mode**: Interactive walkthrough of features

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Mongoose ODM
- **Database**: MongoDB
- **Authentication**: JWT with bcrypt
- **Visualization**: react-d3-tree
- **UI Components**: shadcn/ui, Radix UI
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (local or cloud)
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd family-tree-viewer
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` with your MongoDB URI and JWT secret:
\`\`\`env
MONGODB_URI="mongodb://localhost:27017/familytree"
JWT_SECRET="your-super-secret-jwt-key-here"
\`\`\`

4. Start MongoDB (if running locally):
\`\`\`bash
mongod
\`\`\`

5. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

The application uses Mongoose with MongoDB. The models include:

- **Users**: Authentication and user management
- **Family Trees**: Tree metadata and ownership
- **Members**: Individual family member profiles
- **Relationships**: Connections between family members
- **Password Resets**: Secure password reset functionality
- **Audit Logs**: Activity tracking and logging

MongoDB will automatically create the database and collections when you first run the application.

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### Family Trees
- `GET /api/family-trees` - List user's family trees
- `POST /api/family-trees` - Create new family tree
- `GET /api/family-trees/[id]` - Get family tree details
- `PUT /api/family-trees/[id]` - Update family tree
- `DELETE /api/family-trees/[id]` - Delete family tree

#### Members & Relationships
- `POST /api/family-trees/[id]/members` - Add family member
- `POST /api/family-trees/[id]/relationships` - Create relationship

#### Public Access
- `GET /api/public/family-trees/[shareLink]` - View public family tree

## Usage

### Creating Your First Family Tree

1. **Register/Login**: Create an account or sign in
2. **Create Tree**: Click "New Tree" on the dashboard
3. **Add Members**: Add family members with their details
4. **Build Relationships**: Connect members with appropriate relationships
5. **Visualize**: View your interactive family tree
6. **Share**: Make your tree public and share the link

### Demo Mode

Visit `/demo` to see an interactive walkthrough of all features with sample data.

### Tree Visualization

The tree viewer provides:
- **Interactive Navigation**: Zoom, pan, and click on nodes
- **Member Details**: Click any member to see their information
- **Family Statistics**: View counts and insights
- **Export Options**: Download as PDF or image
- **Sharing Controls**: Generate public links

## Project Structure

\`\`\`
family-tree-viewer/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── demo/             # Demo walkthrough
│   ├── login/            # Authentication pages
│   └── trees/            # Tree management pages
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── family-tree/      # Tree visualization components
│   └── ui/               # shadcn/ui components
├── contexts/             # React contexts
├── lib/                  # Utility functions
├── models/              # Mongoose models
└── public/              # Static assets
\`\`\`

## Development

### MongoDB Commands

\`\`\`bash
# Start MongoDB locally
mongod

# Connect to MongoDB shell
mongosh

# View databases
show dbs

# Use the familytree database
use familytree

# View collections
show collections
\`\`\`

### Adding New Features

1. **Database Changes**: Update models in `models/` directory
2. **API Routes**: Add endpoints in `app/api/`
3. **Components**: Create React components in `components/`
4. **Pages**: Add pages in `app/`
5. **Types**: Update TypeScript interfaces

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Zod schema validation
- **NoSQL Injection Protection**: Mongoose built-in sanitization
- **CORS Protection**: Next.js built-in security
- **Audit Logging**: Track all user actions

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Self-Hosting

1. Build the application:
\`\`\`bash
npm run build
\`\`\`

2. Start the production server:
\`\`\`bash
npm start
\`\`\`

3. Set up MongoDB database
4. Configure environment variables
5. Set up reverse proxy (nginx/Apache)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the demo for usage examples

## Roadmap

- [ ] Real-time collaboration
- [ ] Advanced export options
- [ ] Mobile app
- [ ] DNA integration
- [ ] Historical records import
- [ ] Advanced search and filtering
- [ ] Family tree templates
- [ ] Multi-language support
