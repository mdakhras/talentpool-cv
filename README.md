
# CV Builder Application

A modern, AI-powered CV builder application that allows users to create, edit, and manage their professional CVs with real-time chat assistance.

## 🚀 Features

- **Interactive CV Builder**: Create and edit professional CVs with a user-friendly interface
- **AI Chat Assistant**: Get personalized suggestions and improvements for your CV content
- **Real-time Preview**: See changes to your CV instantly as you edit
- **Markdown Support**: Import CV data from markdown files
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Built with Radix UI components and Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible UI components
- **TanStack React Query** for server state management
- **Lucide React** for icons

### Backend
- **Express.js** with TypeScript
- **In-memory storage** with plans for PostgreSQL integration
- **OpenAI/CrewAI** integration for AI chat functionality
- **Markdown parsing** for CV import

### Development Tools
- **ESBuild** for fast bundling
- **TSX** for TypeScript execution
- **Drizzle ORM** for database operations (prepared)

## 📋 Prerequisites

- Node.js 20 or higher
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone and Setup
```bash
# Clone the repository (if running locally)
git clone <repository-url>
cd cv-builder

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

### 2. Environment Configuration

#### On Replit
The application uses environment variables for AI service configuration. In Replit, you can set these using the Secrets tool:

- `OPENAI_API_KEY` - Your OpenAI API key (optional)
- `CREWAI_API_KEY` - Your CrewAI API key (optional)
- `AZURE_OPENAI_API_KEY` - Your Azure OpenAI API key (optional)
- `AZURE_OPENAI_ENDPOINT` - Your Azure OpenAI endpoint (optional)
- `AZURE_OPENAI_DEPLOYMENT_NAME` - Your Azure deployment name (optional)

#### Running Locally
If you're running this project locally outside of Replit:

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file** and add your API keys:
   ```env
   # For OpenAI
   OPENAI_API_KEY=your_openai_api_key_here
   
   # For Azure OpenAI (alternative to OpenAI)
   AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
   AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
   AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name_here
   AZURE_OPENAI_API_VERSION=2024-02-15-preview
   
   # For CrewAI (alternative service)
   CREWAI_API_KEY=your_crewai_api_key_here
   
   # Application settings
   NODE_ENV=development
   PORT=5000
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The application will automatically detect which AI service you've configured and use it accordingly.

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── pages/          # Application pages
├── server/                 # Backend Express application
│   ├── services/           # Business logic services
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   └── storage.ts          # Data storage layer
├── shared/                 # Shared TypeScript types
├── data/                   # Sample CV data
└── README.md
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

## 📄 CV Data Format

The application supports importing CV data from markdown files. Place your CV markdown file in the `data/` directory. Example format:

```markdown
# John Doe

## Contact Information
- Email: john@example.com
- Phone: +1234567890
- Location: City, Country

## Professional Summary
Brief description of your professional background...

## Experience
### Job Title - Company Name
*Start Date - End Date*
- Achievement or responsibility
- Another achievement

## Education
### Degree - Institution
*Year*

## Skills
- Technical skills
- Soft skills
```

## 🚀 Deployment on Replit

### Option 1: Autoscale Deployment (Recommended)

1. **Prepare for Deployment**
   ```bash
   # Build the application
   npm run build
   ```

2. **Configure Deployment**
   - Click the **Deploy** button in the Replit header
   - Select **Autoscale Deployment**
   - Set the following configuration:
     - **Build Command**: `npm run build`
     - **Run Command**: `npm run start`
     - **Port**: 5000

3. **Set Environment Variables**
   - Use Replit's Secrets tool to add your API keys:
     - `OPENAI_API_KEY` (if using OpenAI)
     - `CREWAI_API_KEY` (if using CrewAI)

4. **Deploy**
   - Click **Deploy** to create your live application
   - Your app will be available at the provided Replit URL

### Option 2: Static Deployment (Frontend Only)

If you want to deploy only the frontend as a static site:

1. **Build the Frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Configure Static Deployment**
   - Click **Deploy** → **Static Deployment**
   - Set **Output Directory**: `client/dist`
   - Set **Build Command**: `cd client && npm run build`

### Deployment Configuration Details

The application is pre-configured for Replit deployment with:
- Port forwarding from 5000 to 80/443
- Environment variable support
- Build optimization for production
- Automatic dependency installation

## 🔒 Security Considerations

- API keys are stored securely using Replit Secrets
- CORS is configured for production deployment
- Session management is implemented for user data
- Input validation on all API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Endpoints

- `GET /api/cv-profile` - Get CV profile data
- `POST /api/cv-profile` - Create/update CV profile
- `GET /api/cv-sections` - Get available CV sections
- `GET /api/chat/:profileId` - Get chat messages
- `POST /api/chat` - Send chat message to AI assistant

## 🔧 Troubleshooting

### Common Issues

1. **Port Issues**: 
   - On Replit: Ensure the application binds to `0.0.0.0:5000` for proper port forwarding
   - Locally: The app will run on `http://localhost:5000`

2. **Build Errors**: Check that all dependencies are installed with `npm install`

3. **API Errors**: 
   - On Replit: Verify environment variables are set correctly in Replit Secrets
   - Locally: Ensure your `.env` file is properly configured with valid API keys

4. **Environment Variables Not Loading**:
   - Locally: Make sure your `.env` file is in the root directory
   - Check that variable names match exactly (case-sensitive)

### Development Tips

**On Replit:**
- Use the Replit console to view server logs
- Check the browser console for frontend errors
- Use the Replit database tool for data inspection (when PostgreSQL is configured)

**Running Locally:**
- Server logs will appear in your terminal where you ran `npm run dev`
- Use browser developer tools for frontend debugging
- Check your `.env` file if AI features aren't working

### Local Development Requirements

- **Node.js**: Version 20 or higher
- **npm**: Comes with Node.js
- **Git**: For cloning the repository (if needed)

No additional software or databases are required for basic functionality - the app uses in-memory storage by default.

## 📧 Support

For issues and questions:
- Check the troubleshooting section above
- Review the code documentation
- Open an issue in the repository

## 📄 License

This project is open source and available under the MIT License.

## 🎯 Roadmap

- [ ] PostgreSQL database integration
- [ ] User authentication and authorization
- [ ] Multiple CV templates
- [ ] PDF export functionality
- [ ] Advanced AI suggestions
- [ ] Collaborative editing features

---

Built with ❤️ on Replit
