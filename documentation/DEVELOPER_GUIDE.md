# Feelora Frontend - Developer Guide

Welcome to the Feelora frontend project! This guide will help you understand the project structure, workflows, and how to get started.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture & Workflows](#architecture--workflows)
5. [Setup & Installation](#setup--installation)
6. [Running the Application](#running-the-application)
7. [Authentication Flow](#authentication-flow)
8. [User Types & Access Control](#user-types--access-control)
9. [Key Features](#key-features)
10. [Development Workflow](#development-workflow)
11. [File Organization Guide](#file-organization-guide)
12. [Common Tasks](#common-tasks)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Feelora** is a mental health platform that connects patients with therapists. The frontend is a React-based web application with two distinct user interfaces:

- **Patient Dashboard**: For patients to track mood, view homework, communicate with therapists, and manage their therapy journey
- **Therapist Dashboard**: For therapists to manage patients, review mood data, assign homework, and coordinate with their patient roster

### Key Features
- 📄 **Therapist License Document Upload** - Therapists can upload a license/qualification document for verification. Document path is stored as `pathToLicenseDocument` (see API). **Location:** `src/features/therapist/api/therapist-service.ts`
- 🔔 **Unread Messages Indicator** - Patient dashboard now displays unread message count. Uses new i18n keys: `patient.dashboard.unreadMessage`, `patient.dashboard.unreadMessagesCount`. **Location:** `src/features/patient/pages/Dashboard.tsx`
- 📑 **Qualification Document Upload Required** - New validation for therapist onboarding: document upload required. i18n key: `q.t.qualifications.uploadRequired`
- 🧭 **Landing Page Section Navigation** - Improved navigation to sections on the landing page. Uses DOM navigation logic. **Location:** `src/features/landing/pages/HeroSection.tsx`
- 📚 **Legal Documents Page Title** - New i18n key for privacy/legal documents page title: `privacy.pageTitle`
- 🔐 **Secure Authentication** via AWS Cognito with support for email/password and Google OAuth
- 👥 **Role-Based Access Control** (RBAC) - Different interfaces for patients and therapists
- 📊 **Mood Tracking** - Patients can log and track mood over time
- 💬 **Real-time Chat** - Communication between patients and therapists
- 📅 **Calendar Integration** - Schedule appointments and view sessions - not MVP
- 📝 **Homework Management** - Therapists assign, patients complete - not MVP
- 🎯 **Questionnaire System** - Onboarding and assessment forms

---

## Technology Stack

### Core Framework
- **React 18.2.0** - UI component library
- **TypeScript** - Type safety and better development experience
- **Vite 6.3.5** - Lightning-fast build tool and dev server

### Styling & UI Components
- **Tailwind CSS 3.4.16** - Utility-first CSS framework
- **Radix UI** - Headless, accessible component primitives
- **Shadcn/ui** - Pre-built components based on Radix UI

### State Management & Data
- **Apollo Client 3.14.0** - GraphQL client for backend communication
- **TanStack Query 5.90.20** - Server state management and caching
- **Zustand 4.5.2** - Lightweight client state management (if needed)

### Authentication & Backend
- **AWS Amplify 6.15.8** - Authentication and backend services
- **AWS Amplify UI React 6.13.1** - Pre-built authentication UI components
- **JWT Decode 4.0.0** - Token parsing and validation

### Animation & UX
- **Framer Motion 12.23.24** - React animation library
- **GSAP 3.12.5** - Advanced animation library
- **Intersection Observer** - Lazy loading and scroll triggers

### Utilities
- **React Router DOM 6.8.1** - Client-side routing
- **Sonner 2.0.7** - Toast notifications
- **Zod 4.3.6** - Schema validation and TypeScript-first validation
- **date-fns 4.1.0** - Date manipulation utilities
- **next-themes 0.4.6** - Dark mode support

---

## Project Structure

```
feelora-landingpage/
├── src/
│   ├── App.tsx                          # Main app component with routing
│   ├── index.tsx                        # Entry point
│   ├── index.css                        # Global styles
│   ├── assets/                          # Images, icons, static files
│   ├── components/
│   │   ├── auth/
│   │   │   └── RequireAuth.tsx          # Route protection component
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx            # Patient dashboard layout wrapper
│   │   │   ├── Header.tsx               # Header component
│   │   │   └── Sidebar.tsx              # Sidebar/navigation
│   │   ├── questionnaire/               # Reusable form components
│   │   ├── ui/                          # Shadcn/Radix UI components
│   │   └── S3Image/                     # Image component for S3 assets
│   ├── config/
│   │   ├── amplify.ts                   # AWS Cognito configuration
│   │   └── s3Assets.ts                  # S3 asset configuration
│   ├── contexts/
│   │   ├── AuthContext.tsx              # Global authentication context
│   │   └── LanguageContext.tsx          # Multi-language support
│   ├── features/
│   │   ├── auth/                        # Authentication pages
│   │   │   ├── LoginPageNew.tsx         # Main login page
│   │   │   ├── LoginPageTherapist.tsx   # Therapist login variant
│   │   │   └── AuthCallback.tsx         # OAuth callback handler
│   │   ├── landing/                     # Public landing page sections
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   └── pages/
│   │   │       ├── HeroSection.tsx
│   │   │       ├── ForPatientsSection.tsx
│   │   │       ├── ForTherapistsSection.tsx
│   │   │       ├── WhyFeeloraSection.tsx
│   │   │       ├── EvidenceBasedSection.tsx
│   │   │       ├── TestimonialsSection.tsx
│   │   │       ├── AboutUsPage.tsx
│   │   │       ├── PrivacyPolicyPage.tsx
│   │   │       └── SupportPage.tsx
│   │   ├── patient/                     # Patient dashboard
│   │   │   ├── layout/
│   │   │   │   └── AppLayout.tsx        # Sidebar + main content wrapper
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── ChatPage.tsx
│   │   │   │   ├── CalendarPage.tsx
│   │   │   │   ├── ProfilePage.tsx
│   │   │   │   ├── MoodTrackerPage.tsx
│   │   │   │   ├── HomeworkPage.tsx
│   │   │   │   ├── PatientQuestionnaire.tsx
│   │   │   │   └── NotFound.tsx
│   │   │   ├── components/              # Patient-specific components
│   │   │   ├── api/                     # Patient API queries/mutations
│   │   │   └── types/                   # Patient-specific types
│   │   └── therapist/                   # Therapist dashboard
│   │       ├── layout/
│   │       │   └── TherapistLayout.tsx
│   │       ├── pages/
│   │       │   ├── TherapistChat.tsx
│   │       │   ├── TherapistMoodTrackerPage.tsx
│   │       │   ├── TherapistQuestionnaire.tsx
│   │       │   ├── TherapistProfilePage.tsx
│   │       │   ├── TherapistHomeworkPage.tsx
│   │       │   ├── TherapistPatientsPage.tsx
│   │       │   └── TherapistCalendarPage.tsx
│   │       ├── components/              # Therapist-specific components
│   │       └── pages/
│   ├── hooks/
│   │   ├── use-auth.ts                  # Custom hook for auth context
│   │   ├── use-mobile.ts                # Responsive design hook
│   │   ├── use-toast.ts                 # Toast notification hook
│   │   ├── usePersistedQuestionnaire.ts # Form state persistence
│   │   ├── useS3Upload.ts               # S3 file upload handler
│   │   └── useStepValidation.ts         # Multi-step form validation
│   ├── lib/
│   │   ├── apolloClient.ts              # GraphQL client configuration
│   │   ├── axios.ts                     # HTTP client (if needed)
│   │   └── utils.ts                     # Utility functions
│   └── routes/                          # Route definitions (if centralized)
├── public/                              # Static assets
├── index.html                           # HTML entry point
├── vite.config.ts                       # Vite configuration
├── tailwind.config.js                   # Tailwind CSS configuration
├── tsconfig.json                        # TypeScript configuration
└── package.json                         # Dependencies and scripts
```

---

## Architecture & Workflows

### Overall Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        FEELORA APP                          │
│  (App.tsx: Router, Providers, Global State Management)      │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼──────────────┐
                │             │              │
        ┌───────▼────────┐ ┌──▼──────────┐ ┌──▼──────────────┐
        │ Landing Pages  │ │ Auth Pages  │ │ Protected Pages │
        │                │ │             │ │                 │
        │ ├─ Home        │ │ ├─ /login   │ │ ├─ /patient/**  │
        │ ├─ About       │ │ └─ /callback│ │ └─ /therapist/**│
        │ ├─ Privacy     │ │             │ │                 │
        │ └─ Support     │ └─────────────┘ └─────────────────┘
        └────────────────┘        │              │
         (LandingLayout)          │         (Protected by
                                  │       RequireAuth Guard)
                            ┌─────▼──────┐
                            │ AuthContext│
                            │ (Cognito)  │
                            └────────────┘
```

### Authentication Flow

1. **User visits `/login`** → Presented with login options
2. **User authenticates** (email/password or Google OAuth)
3. **Cognito returns tokens** (Access Token + ID Token)
4. **AuthContext stores tokens** and decodes user information
5. **Tokens attached to requests** (GraphQL & REST APIs)
6. **Automatic token refresh** every 55 minutes
7. **Protected routes enforce access** based on user type

### User Type Distinction

- **Patient** (`userType: "user"`): Accesses `/patient/**` routes
- **Therapist** (`userType: "therapist"`): Accesses `/therapist/**` routes
- **Determined by**: Cognito user groups or custom attributes

### Data Flow Architecture

```
Frontend (React)
    │
    ├──► Apollo Client (GraphQL)
    │    └──► Backend GraphQL API
    │
    ├──► TanStack Query (REST/HTTP)
    │    └──► Backend REST API
    │
    └──► AWS Services
         ├──► Cognito (Authentication)
         └──► S3 (File uploads/images)

AuthContext maintains tokens →
All requests include Authorization header
```

---

## Setup & Installation

### Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x

### Step 1: Clone and Navigate
```bash
cd /Users/victoriazeillinger/Documents/Feelora-Code/frontend/feelora-landingpage
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs the following key dependencies:
- React & React Router
- Apollo Client for GraphQL
- TanStack Query for state management
- Tailwind CSS & UI components
- AWS Amplify for authentication

### Step 3: Configure Environment Variables

Create a `.env.local` file in the `feelora-landingpage/` directory:

```env
# Backend API URLs
VITE_GRAPHQL_API_URL=https://api.feelora-dev.com/graphql
VITE_AUTH_API_URL=https://auth.feelora-dev.com

# AWS Amplify Configuration
VITE_AMPLIFY_URL=http://localhost:5173
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_AWS_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
VITE_AWS_THERAPIST_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
VITE_AWS_STORAGE_BUCKET=feelora-bucket
VITE_AWS_STORAGE_REGION=us-east-1

# Optional: Test token for local development (bypass login)
VITE_TEST_AUTH_TOKEN=your-jwt-token-here
```

**Note:** Get these values from the project manager or AWS Console.

### Step 4: Verify Installation
```bash
npm run build
# Should complete without errors
```

---

## Running the Application

### Development Server
```bash
npm run dev
```
- Opens at `http://localhost:5173`
- Hot module replacement (HMR) enabled
- Auto-reloads on file changes

### Production Build
```bash
npm run build
```
- Creates optimized bundle in `dist/`
- TypeScript checking included
- Minified and tree-shaken

### Preview Production Build Locally
```bash
npm run preview
```

---

## Authentication Flow

### How AuthContext Works

Located in `src/contexts/AuthContext.tsx`:

```tsx
// Key exports from AuthContext
interface User {
  id: string;
  email?: string;
  name?: string;
  familyName?: string;
  username?: string;
  groups?: string[];
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (type: 'user' | 'therapist') => void;
  logout: (type: 'user' | 'therapist') => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
}
```

### Using Authentication in Components

```tsx
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { user, isAuthenticated, accessToken, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={() => logout('user')}>Logout</button>
    </div>
  );
}
```

### Token Lifecycle

1. **Login**: Cognito issues access token (60 min expiry) + ID token
2. **Storage**: Tokens stored in memory and localStorage
3. **Auto-Refresh**: Runs every 55 minutes to get fresh token
4. **Logout**: Clears tokens from both memory and storage
5. **Failed Requests**: If token expired, attempts refresh before retry

---

## User Types & Access Control

### The RequireAuth Guard

Located in `src/components/auth/RequireAuth.tsx`:

```tsx
<Route element={<RequireAuth allowedType="patient" />}>
  <Route path="/patient/*" element={<PatientDashboard />} />
</Route>
```

**How it works:**
- Checks if user is authenticated
- Verifies user type matches `allowedType`
- Redirects to login if unauthorized
- Shows loading state while checking

### Adding Protected Routes

```tsx
// In App.tsx
<Route element={<RequireAuth allowedType="therapist" />}>
  <Route path="/therapist/new-feature" element={<NewFeaturePage />} />
</Route>
```

---

## Key Features
### 7. **Therapist License Document Upload**
- Therapists can upload a license/qualification document for verification
- Document path is stored as `pathToLicenseDocument` (see API)
- **Location:** `src/features/therapist/api/therapist-service.ts`

### 8. **Unread Messages Indicator**
- Patient dashboard now displays unread message count
- Uses new i18n keys: `patient.dashboard.unreadMessage`, `patient.dashboard.unreadMessagesCount`
- **Location:** `src/features/patient/pages/Dashboard.tsx`

### 9. **Qualification Document Upload Required**
- New validation for therapist onboarding: document upload required
- i18n key: `q.t.qualifications.uploadRequired`

### 10. **Landing Page Section Navigation**
- Improved navigation to sections on the landing page
- Uses DOM navigation logic
- **Location:** `src/features/landing/pages/HeroSection.tsx`

### 11. **Legal Documents Page Title**
- New i18n key for privacy/legal documents page title: `privacy.pageTitle`

### 1. **Mood Tracking**
- **Patient View**: Log mood, track over time, visualize trends
- **Therapist View**: Monitor patient's mood data, set baselines
- **Location**: `src/features/patient/pages/MoodTrackerPage.tsx`

### 2. **Chat/Messaging**
- Real-time communication between patient and therapist
- Built on GraphQL subscriptions
- **Location**: `src/features/patient/pages/ChatPage.tsx`

### 3. **Homework Management**
- Therapists assign tasks/homework
- Patients track progress
- Mark as complete/incomplete
- **Location**: `src/features/patient/pages/HomeworkPage.tsx`

### 4. **Calendar/Scheduling**
- View upcoming appointments
- Schedule sessions with therapist
- Calendar view with event details
- **Location**: `src/features/patient/pages/CalendarPage.tsx`

### 5. **Questionnaire/Survey System**
- Onboarding questionnaires
- Assessment forms
- Multi-step forms with validation
- **Location**: `src/features/patient/pages/PatientQuestionnaire.tsx`

### 6. **Profile Management**
- View/edit user information
- Manage preferences and settings
- **Location**: `src/features/patient/pages/ProfilePage.tsx`

---

## Development Workflow

### Adding a New Feature

#### Step 1: Create the Page Component
```tsx
// src/features/patient/pages/NewFeaturePage.tsx
import React from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function NewFeaturePage() {
  const { user } = useAuth();
  
  return (
    <div>
      <h1>New Feature for {user?.name}</h1>
      {/* Your feature content */}
    </div>
  );
}
```

#### Step 2: Register the Route
```tsx
// In src/App.tsx
<Route element={<RequireAuth allowedType="user" />}>
  <Route path="/patient" element={<PatientLayoutWrapper />}>
    <Route path="new-feature" element={<NewFeaturePage />} />
  </Route>
</Route>
```

#### Step 3: Add Navigation
```tsx
// In src/features/patient/layout/Sidebar.tsx
<NavLink to="/patient/new-feature">New Feature</NavLink>
```

#### Step 4: Fetch Data (if needed)
```tsx
// Option A: Using Apollo Client (GraphQL)
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER_DATA } from '@/features/patient/api/queries';

const { data, loading, error } = useQuery(GET_USER_DATA, {
  variables: { userId: user?.id }
});

// Option B: Using TanStack Query (REST)
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const { data, isLoading } = useQuery({
  queryKey: ['user-data', userId],
  queryFn: () => axios.get(`/api/users/${userId}`)
});
```

### Creating Reusable Components

```tsx
// src/features/patient/components/MoodCard.tsx
interface MoodCardProps {
  date: string;
  mood: number;
  notes: string;
}

export function MoodCard({ date, mood, notes }: MoodCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{date}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Mood: {mood}/10</p>
        <p>{notes}</p>
      </CardContent>
    </Card>
  );
}
```

### Using Shadcn/UI Components

All components are in `src/components/ui/`:

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export function MyPage() {
  const { toast } = useToast();

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => toast({
          title: 'Success',
          description: 'Operation completed'
        })}>
          Click me
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## File Organization Guide

### i18n/Translations
New translation keys:
- `patient.dashboard.unreadMessage`, `patient.dashboard.unreadMessagesCount` (en/de)
- `q.t.qualifications.uploadRequired` (en)
- `privacy.pageTitle` (en)

### Components

Organize components by feature:
```
src/features/patient/components/
├── MoodCard.tsx          # Single responsibility
├── MoodChart.tsx         # Another component
└── index.ts              # Export all components
```

### API Queries & Mutations

Keep API calls separate:
```
src/features/patient/api/
├── queries.ts            # GraphQL queries
├── mutations.ts          # GraphQL mutations
└── types.ts              # GraphQL types
```

### Types & Interfaces

Define types near usage:
```
src/features/patient/types/
├── mood.ts
├── homework.ts
└── index.ts
```

---

## Common Tasks

### Task: Upload Therapist License Document
See Profile Management and Therapist Onboarding sections. Document upload is now required for verification.

### Task: Show Unread Messages
Use the new i18n keys in the patient dashboard to display unread message counts.

### Task: Navigate to Landing Page Section
Use `document.getElementById(sectionId)` for smooth scroll/navigation.

### Task 1: Display User Information
```tsx
import { useAuth } from '@/hooks/use-auth';

export function UserInfo() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return null;
  
  return <p>{user?.email}</p>;
}
```

### Task 2: Make a GraphQL Query
```tsx
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_PATIENT = gql`
  query GetPatient($id: ID!) {
    patient(id: $id) {
      id
      name
      email
    }
  }
`;

export function PatientProfile() {
  const { data, loading } = useQuery(GET_PATIENT, {
    variables: { id: 'patient-123' }
  });
  
  if (loading) return <p>Loading...</p>;
  return <p>{data?.patient?.name}</p>;
}
```

### Task 3: Show a Toast Notification
```tsx
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export function NotificationDemo() {
  const { toast } = useToast();
  
  return (
    <Button onClick={() => {
      toast({
        title: 'Success!',
        description: 'Your changes have been saved.',
        variant: 'default'
      });
    }}>
      Save
    </Button>
  );
}
```

### Task 4: Handle Form Submission
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email')
});

export function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema)
  });
  
  const onSubmit = (data) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('name')} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Task 5: Responsive Design
```tsx
import { useMobile } from '@/hooks/use-mobile';

export function ResponsiveLayout() {
  const isMobile = useMobile();
  
  return (
    <div className={isMobile ? 'flex flex-col' : 'flex flex-row'}>
      {/* Content */}
    </div>
  );
}
```

---

## Troubleshooting

### Issue: "Cannot find module '@/components/ui/button'"

**Solution:** Path alias is not working
- Check `vite.config.ts` has the correct alias:
  ```typescript
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  }
  ```
- Check `tsconfig.json` has:
  ```json
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
  ```

### Issue: "Not authenticated" error on protected routes

**Solution:** Check AuthContext and token
```tsx
const { user, isAuthenticated, accessToken } = useAuth();
console.log('Auth:', { user, isAuthenticated, accessToken });
```

- Ensure `.env.local` has correct Cognito credentials
- Check browser DevTools → Application → Cookies (look for Cognito tokens)
- Try clearing localStorage and re-login

### Issue: GraphQL queries return null

**Solution:** Check Apollo Client configuration
```tsx
// In src/lib/apolloClient.ts
console.log('GraphQL Endpoint:', graphqlEndpoint);
console.log('Auth Token:', getApolloAccessToken());
```

- Verify `VITE_GRAPHQL_API_URL` is correct
- Check if backend is running and accessible
- Use Apollo DevTools browser extension to inspect queries

### Issue: Tailwind styles not applying

**Solution:** Ensure proper class names
```tsx
// ✅ Correct: Single class name
<div className="bg-blue-500 p-4">

// ❌ Wrong: Dynamic class names
const color = 'blue'; // Tailwind won't detect "bg-${color}-500"
<div className={`bg-${color}-500`}>

// ✅ Correct: Safelist or use full class names
<div className={color === 'blue' ? 'bg-blue-500' : 'bg-red-500'}>
```

---

## Next Steps for New Developers

1. **Read the codebase**: Start with `App.tsx` → understand routing
2. **Explore a feature**: Pick one feature (e.g., Mood Tracker) and trace through the code
3. **Run locally**: `npm run dev` and interact with the app
4. **Make a small change**: Add a new button or modify existing component
5. **Check git workflow**: Ask about branch naming conventions and PR process

## Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Apollo Client Guide](https://www.apollographql.com/docs/react/)
- [AWS Amplify Docs](https://docs.amplify.aws/)
- [TanStack Query Docs](https://tanstack.com/query/latest)

---

**Last Updated:** February 17, 2026

For questions or clarifications, reach out to the team lead or check the project wiki.
