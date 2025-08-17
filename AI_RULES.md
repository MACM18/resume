# AI Development Rules

This document outlines the rules and conventions for AI-driven development on this project. Following these guidelines ensures consistency, maintainability, and adherence to the established architecture.

## Tech Stack Overview

This is a modern web application built with the following technologies:

-   **Framework**: [Next.js](https://nextjs.org/) (App Router) for server-side rendering, routing, and API endpoints.
-   **Language**: [TypeScript](https://www.typescriptlang.org/) for static typing and improved developer experience.
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/) for a pre-built, accessible, and customizable component library built on Radix UI.
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a utility-first CSS framework.
-   **Data Fetching & State**: [React Query](https://tanstack.com/query) for managing server state, caching, and data synchronization.
-   **Animation**: [Framer Motion](https://www.framer.com/motion/) for declarative and performant animations.
-   **Forms**: [React Hook Form](https://react-hook-form.com/) for efficient and scalable form state management and validation.
-   **Icons**: [Lucide React](https://lucide.dev/) for a comprehensive and consistent set of icons.
-   **Notifications**: [Sonner](https://sonner.emilkowal.ski/) for clean and simple toast notifications.

## Library Usage and Conventions

### 1. UI and Components

-   **Primary Component Library**: **ALWAYS** use components from `components/ui` (shadcn/ui). Do not create custom components from scratch if a suitable one exists in the library.
-   **Composition**: Create new, complex components by composing smaller components from `components/ui`.
-   **Styling**: All styling **MUST** be done with Tailwind CSS utility classes. Use the `cn` utility from `lib/utils.ts` for conditional class names. Do not write custom CSS files or use inline `style` objects unless absolutely necessary.

### 2. State Management

-   **Server State**: Use **React Query** for all data fetching, caching, and mutations. This includes fetching data from APIs and managing asynchronous operations.
-   **Client State**: For simple, local component state, use React's built-in hooks (`useState`, `useReducer`). Avoid complex global state management libraries unless the application's complexity demands it.

### 3. Routing and Navigation

-   **Routing**: The application uses the **Next.js App Router**. All pages and layouts should be created within the `app/` directory.
-   **Navigation**: Use the `<Link>` component from `next/link` for all internal navigation to leverage client-side routing.
-   **Route Information**: Use hooks like `usePathname`, `useRouter`, and `useParams` from `next/navigation` to access routing information.

### 4. Forms

-   **Form Handling**: **ALWAYS** use `react-hook-form` for managing form state, validation, and submissions.
-   **Integration**: Integrate `react-hook-form` with shadcn/ui components using the `<Form />` components from `components/ui/form.tsx`.

### 5. Icons and Animations

-   **Icons**: Use icons exclusively from the `lucide-react` library.
-   **Animations**: Implement all animations and transitions using `framer-motion`.

### 6. Notifications

-   **User Feedback**: Use the `toast` function from `sonner` to provide feedback to the user for actions like form submissions, errors, or successful operations. Import it from `components/ui/sonner.tsx`.

### 7. Code Structure

-   **Pages**: Reside in the `app/` directory, following Next.js App Router conventions.
-   **Reusable Components**: Place in `components/`.
-   **UI Primitives**: Reside in `components/ui/`. These should generally not be modified.
-   **Hooks**: Custom hooks go in the `hooks/` directory.
-   **Utilities**: Helper functions are located in `lib/`.
-   **Static Data**: Place static data, like the portfolio content, in the `data/` directory.