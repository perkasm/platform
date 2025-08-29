# Project Overview

The PerkAsm platform is a web application designed for AI-powered credit card rewards optimization. It consists of a frontend and a backend, with this directory containing the frontend component. The frontend provides a dashboard interface where users can manage their credit cards, get recommendations, and chat with an AI assistant.

## Key Technologies

*   **Framework:** React
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** shadcn/ui
*   **Routing:** React Router
*   **Data Fetching:** React Query

## Architecture

The application is a single-page application (SPA) with a client-side routing system. The main entry point is `src/main.tsx`, which renders the `App` component. The `App` component sets up the routing and global providers.

The main page, `src/pages/Index.tsx`, contains the primary UI, which is a tabbed interface with the following sections:

*   **Dashboard:** Displays an overview of the user's rewards and metrics.
*   **My Cards:** Allows users to manage their credit cards.
*   **AI Chat:** Provides an interface to chat with an AI assistant.
*   **Recommendations:** Offers recommendations for optimizing credit card rewards.

The UI is built using components from `shadcn/ui`, and the application state is managed using React hooks and `react-query`.

# Building and Running

To build and run the project, use the following commands:

*   **Install dependencies:**
    ```bash
    npm install
    ```
*   **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:8080`.
*   **Build for production:**
    ```bash
    npm run build
    ```
*   **Lint the code:**
    ```bash
    npm run lint
    ```

# Development Conventions

*   **Styling:** The project uses Tailwind CSS for styling. Utility classes should be used whenever possible.
*   **Components:** Reusable UI components are located in the `src/components` directory.
*   **State Management:** For server-side state, use `react-query`. For client-side state, use React hooks.
*   **Routing:** Use `react-router-dom` for routing. New routes should be added to `src/App.tsx`.
*   **Linting:** The project uses ESLint for code linting. Run `npm run lint` to check for linting errors.