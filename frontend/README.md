# PerkAsm Frontend

AI-powered credit card rewards optimization platform - Frontend Component

## Project Overview

This is the frontend component of the PerkAsm platform, a web application designed to help users maximize their credit card rewards by providing personalized recommendations and insights. This React-based frontend provides a dashboard interface where users can manage their credit cards, get recommendations, and chat with an AI assistant.

The project was initially created with Lovable but has been migrated to this repository for independent development and deployment.

## Technologies Used

- **Framework**: React
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Routing**: React Router
- **Data Fetching**: React Query

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js) or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
```

### Development

```bash
# Start the development server with hot reloading
npm run dev
```

The application will be available at `http://localhost:8080`.

### Building for Production

```bash
# Create a production build
npm run build
```

The build files will be output to the `dist` directory.

### Linting

```bash
# Run ESLint to check for code issues
npm run lint
```

## Project Structure

```
frontend/
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and libraries
│   ├── pages/              # Page components
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
└── ...                     # Configuration files
```

## Development Workflow

1. Work in the `src/` directory
2. Use `npm run dev` to start the development server with hot reloading
3. Create components in the `src/components/` directory
4. Add pages to the `src/pages/` directory
5. Use `npm run lint` to check for code issues

## Architecture

The application is a single-page application (SPA) with a client-side routing system. The main entry point is `src/main.tsx`, which renders the `App` component. The `App` component sets up the routing and global providers.

The main page, `src/pages/Index.tsx`, contains the primary UI, which is a tabbed interface with the following sections:

- **Dashboard**: Displays an overview of the user's rewards and metrics.
- **My Cards**: Allows users to manage their credit cards.
- **AI Chat**: Provides an interface to chat with an AI assistant.
- **Recommendations**: Offers recommendations for optimizing credit card rewards.

The UI is built using components from `shadcn/ui`, and the application state is managed using React hooks and `react-query`.

## Deployment

To deploy the frontend:

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the contents of the `dist/` directory to your preferred hosting platform (Netlify, Vercel, GitHub Pages, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit your changes
5. Push to the branch
6. Create a pull request

## Support

For support, please open an issue on the GitHub repository or contact the development team.