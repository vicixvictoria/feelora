# Feelora Architecture Guide

Deep dive into how the application is structured and how data flows through the system.

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Authentication Architecture](#authentication-architecture)
3. [Data Flow Patterns](#data-flow-patterns)
4. [State Management](#state-management)
5. [Component Hierarchy](#component-hierarchy)
6. [API Integration](#api-integration)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     BROWSER / CLIENT                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              React Application (SPA)                  │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │  index.tsx → App.tsx Router & Providers         │ │   │
│  │  ├──────────────────────────────────────────────────┤ │   │
│  │  │  Routes:                                        │ │   │
│  │  │  ├─ Landing pages (public)                      │ │   │
│  │  │  ├─ Auth pages (/login, /callback)             │ │   │
│  │  │  ├─ Patient dashboard (/patient/*) [protected] │ │   │
│  │  │  └─ Therapist dashboard (/therapist/*) [prot.] │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │         Global Providers & Context              │ │   │
│  │  │  ├─ QueryClientProvider (TanStack Query)       │ │   │
│  │  │  ├─ ApolloProvider (GraphQL)                   │ │   │
│  │  │  ├─ AuthProvider (Auth Context)                │ │   │
│  │  │  ├─ LanguageProvider (i18n)                    │ │   │
│  │  │  ├─ TooltipProvider, Toaster (UI)             │ │   │
│  │  │  └─ BrowserRouter (React Router)               │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │          State Management & Hooks              │ │   │
│  │  │  ├─ Apollo Client (GraphQL Queries/Mutations)  │ │   │
│  │  │  ├─ TanStack Query (REST)                      │ │   │
│  │  │  ├─ Auth Context (Global Auth State)           │ │   │
│  │  │  ├─ Zustand (Optional client state)            │ │   │
│  │  │  └─ Custom Hooks (use-auth, use-mobile, etc.)  │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │         Feature Pages & Components              │ │   │
│  │  │  ├─ Landing pages (landing layout + sections)  │ │   │
│  │  │  ├─ Patient dashboard (sidebar + pages)        │ │   │
│  │  │  └─ Therapist dashboard (sidebar + pages)      │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │       Shared UI Components (Shadcn/Radix)       │ │   │
│  │  │  ├─ Button, Card, Input, Dialog, etc.          │ │   │
│  │  │  ├─ Accordion, Tabs, Dropdown Menu             │ │   │
│  │  │  ├─ Toast, Toaster, Sonner notifications       │ │   │
│  │  │  └─ Responsive components (sheets, drawers)    │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (APIs)
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │  GraphQL API     │  │  REST API        │  │  AWS Cognito│ │
│  │  (Queries/Muts)  │  │  (if needed)      │  │  (Auth)     │ │
│  └──────────────────┘  └──────────────────┘  └─────────────┘ │
│         ↓                      ↓                      ↓        │
│   ┌──────────────────────────────────────────────────────┐   │
│   │  Database (Patient data, Therapist data, Messages)   │   │
│   └──────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │  AWS S3          │  │  Real-time (WebSocket)             │
│  │  (File uploads)  │  │  (Chat, notifications)             │
│  └──────────────────┘  └──────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication Architecture

### How Cognito Integration Works

```
┌──────────────────────────────────────────────────────────────┐
│                    App Startup                               │
│  Amplify.configure(amplifyConfig) in App.tsx               │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│              AuthProvider wraps entire app                    │
│  ├─ Reads localStorage for stored tokens                    │
│  ├─ Initializes user state from tokens                      │
│  └─ Sets up automatic token refresh (55 min interval)       │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│              User navigates to /login                         │
│  LoginPage.tsx shows Amplify Authenticator UI              │
│  ├─ Email/password option                                   │
│  ├─ Google OAuth button (redirects to Cognito)             │
│  └─ Sign-up form with validation                            │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│              User logs in successfully                        │
│  Cognito returns:                                            │
│  ├─ accessToken (60 min expiry)                             │
│  ├─ idToken (user info & groups)                            │
│  └─ refreshToken (for token refresh)                        │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│            AuthContext processes tokens                       │
│  ├─ JWT decode: Extract user info (name, email, groups)   │
│  ├─ Store in memory: accessToken for API calls            │
│  ├─ Store in localStorage: For persistence across reloads │
│  └─ Notify Apollo Client: setApolloAccessToken()          │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│            Protected route checks access                      │
│  RequireAuth component:                                      │
│  ├─ Verifies isAuthenticated === true                       │
│  ├─ Checks user.groups includes 'patient' or 'therapist'   │
│  └─ Routes /patient/** to PatientDashboard                 │
│  └─ Routes /therapist/** to TherapistDashboard             │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│            Token refresh happens automatically               │
│  Every 55 minutes:                                           │
│  ├─ AuthContext calls refreshToken()                        │
│  ├─ Makes request to backend /auth/refresh                  │
│  ├─ Gets new accessToken                                    │
│  ├─ Updates localStorage & memory                           │
│  └─ Updates Apollo Client token                             │
└──────────────────────────────────────────────────────────────┘
```

### Token Flow in API Requests

```
┌──────────────────────────────────────────────────────┐
│        Component makes GraphQL query                 │
│  const { data } = useQuery(GET_PATIENT)             │
└──────────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────┐
│  Apollo Client auth link executes:                   │
│  1. Gets accessToken from _accessToken global var   │
│  2. Adds to request header: Authorization: token    │
│  3. Sends HTTP POST to GraphQL endpoint             │
└──────────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────┐
│  Backend receives request                            │
│  1. Validates Authorization header                   │
│  2. Verifies JWT signature from Cognito             │
│  3. Checks user groups/permissions                   │
│  4. Executes GraphQL resolver                        │
│  5. Returns data or error                            │
└──────────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────┐
│  Apollo Client handles response                      │
│  1. Updates cache with new data                      │
│  2. Component re-renders with new data              │
│  3. Error boundaries catch authentication errors     │
└──────────────────────────────────────────────────────┘
```

---

## Data Flow Patterns

### Pattern 1: Simple Data Display (GraphQL Query)

```
┌────────────────────────────────────────┐
│        Component (PatientProfile)      │
│  const { data, loading } = useQuery()  │
└────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────┐
│   Apollo Client in-memory cache        │
│   Checks if data already cached        │
└────────────────────────────────────────┘
           ↓
        If not cached:
           ↓
┌────────────────────────────────────────┐
│   Make HTTP request to GraphQL API     │
│   Include auth token in header         │
└────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────┐
│  Backend processes query, returns data │
└────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────┐
│  Apollo updates cache                  │
│  Component re-renders with new data    │
└────────────────────────────────────────┘

Code example:
────────────
import { useQuery } from '@apollo/client';
import { GET_PATIENT } from '@/features/patient/api/queries';

export function PatientProfile() {
  const { data, loading, error } = useQuery(GET_PATIENT, {
    variables: { id: patientId }
  });

  if (loading) return <Skeleton />;
  if (error) return <Error />;
  return <div>{data?.patient?.name}</div>;
}
```

### Pattern 2: Form Submission (GraphQL Mutation)

```
┌────────────────────────────────────────┐
│   User fills & submits form            │
│   onSubmit(formData) triggered         │
└────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────┐
│  Form validation (Zod)                 │
│  Check required fields, formats, etc.  │
└────────────────────────────────────────┘
           ↓
        If valid:
           ↓
┌────────────────────────────────────────┐
│  Execute mutation (useMutation)        │
│  Sends form data to GraphQL API        │
│  Sets loading state = true             │
└────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────┐
│  Backend creates/updates resource      │
│  Returns success or error              │
└────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────┐
│  Apollo updates cache                  │
│  Call onSuccess callback               │
│  Show toast: "Saved successfully!"     │
└────────────────────────────────────────┘

Code example:
────────────
import { useMutation } from '@apollo/client';
import { UPDATE_PATIENT } from '@/features/patient/api/mutations';

export function EditProfile() {
  const [updatePatient] = useMutation(UPDATE_PATIENT);

  const onSubmit = async (data) => {
    try {
      await updatePatient({
        variables: { patient: data }
      });
      toast({ title: 'Saved!' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  return <form onSubmit={handleSubmit(onSubmit)} />;
}
```

### Pattern 3: RESTful API with TanStack Query

```
┌────────────────────────────────────────┐
│  Component needs data                  │
│  const { data } = useQuery(...)        │
└────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────┐
│  TanStack Query checks cache           │
│  If fresh (within staleTime), use it   │
│  Otherwise, mark stale and refetch     │
└────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────┐
│  HTTP request via axios                │
│  GET /api/patients/:id                 │
│  Auth token in header (if not GraphQL) │
└────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────┐
│  Backend processes, returns data       │
└────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────┐
│  TanStack Query caches response        │
│  Component re-renders with data        │
└────────────────────────────────────────┘

Code example:
────────────
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function PatientsList() {
  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => axios.get('/api/patients'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) return <Spinner />;
  return patients?.map(p => <PatientCard key={p.id} patient={p} />);
}
```

---

## State Management

### Three-Layer State Architecture

```
┌─────────────────────────────────────────────────────┐
│        Layer 1: Server State (Source of Truth)      │
│  ├─ Backend database (patients, therapists, chat)   │
│  ├─ Managed by: Apollo Client + TanStack Query      │
│  └─ When to use: Data from backend APIs            │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│      Layer 2: Client State (UI-specific)            │
│  ├─ Auth state (user, tokens)                       │
│  ├─ Managed by: Context API (AuthContext)           │
│  └─ When to use: Global auth, user preferences      │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│   Layer 3: Component State (Local)                  │
│  ├─ Form inputs, UI toggles (loading, open)         │
│  ├─ Managed by: React State (useState)              │
│  └─ When to use: Component-specific UI state        │
└─────────────────────────────────────────────────────┘
```

### Example State Flow

```
┌─────────────────────────────────┐
│  User logs in with email        │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│  Cognito returns tokens         │
│  (Server State)                 │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│  AuthContext stores tokens      │
│  (Client State)                 │
│  - accessToken                  │
│  - user info (name, email)      │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│  Components use useAuth hook    │
│  (Consumer of Client State)     │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│  Component renders dashboard    │
│  Makes GraphQL query for data   │
│  (Uses Server State)            │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│  Apollo Client stores response  │
│  (Server State Cache)           │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│  Component sets form state      │
│  (Component State)              │
│  - isLoading: false             │
│  - formErrors: {...}            │
└─────────────────────────────────┘
```

---

## Component Hierarchy

### Therapist License Document Upload
- Therapist profile now includes a `pathToLicenseDocument` field (see API)

### Patient Dashboard Unread Messages
- Dashboard component displays unread message count using new i18n keys

### Landing Page Section Navigation
- HeroSection uses DOM navigation for section scroll

### Patient Dashboard Hierarchy

```
App
├─ AuthProvider
│  ├─ Router
│  │  └─ Routes
│  │     └─ PatientLayoutWrapper
│  │        └─ PatientAppLayout (sidebar + main)
│  │           ├─ Sidebar
│  │           │  └─ Navigation links
│  │           └─ Outlet (page content)
│  │              ├─ Dashboard
│  │              ├─ ChatPage
│  │              ├─ CalendarPage
│  │              ├─ MoodTrackerPage
│  │              ├─ HomeworkPage
│  │              └─ ProfilePage
│  ├─ ApolloProvider
│  ├─ QueryClientProvider
│  └─ Other Providers (Language, Tooltip, Toast)
```

### Component Communication

```
                 App
                  │
        ┌─────────┼──────────┐
        │                    │
    AuthContext       RequireAuth
        │                    │
        │            ┌───────┴────────┐
        │            │                │
     useAuth      PatientLayout    TherapistLayout
        │            │                │
        └────────────┼────────────────┘
                     │
            ┌────────┴─────────┐
            │                  │
         Sidebar          PageComponent
            │                  │
            │          ┌───────┴──────┐
            │          │              │
            │        useAuth    useQuery/useMutation
            │          │              │
            └──────────┼──────────────┘
                   Data & Auth
```

---

## API Integration

### Therapist API: License Document
Field: `pathToLicenseDocument` (string) — path to uploaded license/qualification document

### i18n Keys
- `patient.dashboard.unreadMessage`, `patient.dashboard.unreadMessagesCount`
- `q.t.qualifications.uploadRequired`
- `privacy.pageTitle`

### GraphQL Queries Structure

**Location:** `src/features/[feature]/api/queries.ts`

```typescript
// Example: Get patient data
export const GET_PATIENT = gql`
  query GetPatient($id: ID!) {
    patient(id: $id) {
      id
      name
      email
      phone
      therapistId
      createdAt
      updatedAt
    }
  }
`;

// In component:
const { data, loading } = useQuery(GET_PATIENT, {
  variables: { id: userId }
});
```

### GraphQL Mutations Structure

**Location:** `src/features/[feature]/api/mutations.ts`

```typescript
// Example: Update patient profile
export const UPDATE_PATIENT = gql`
  mutation UpdatePatient($id: ID!, $input: PatientInput!) {
    updatePatient(id: $id, input: $input) {
      id
      name
      email
      updatedAt
    }
  }
`;

// In component:
const [updatePatient] = useMutation(UPDATE_PATIENT);
await updatePatient({
  variables: {
    id: userId,
    input: { name: 'New Name' }
  }
});
```

### Type Definitions Structure

**Location:** `src/features/[feature]/types/index.ts`

```typescript
// Keep types organized by feature
export interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  therapistId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Therapist {
  id: string;
  name: string;
  email: string;
  license?: string;
  patientsCount: number;
}
```

---

## Development Tips

### Adding a New API Call

1. **Create Query/Mutation**
   ```typescript
   // src/features/patient/api/queries.ts
   export const GET_USER_MOOD = gql`...`;
   ```

2. **Use in Component**
   ```typescript
   import { GET_USER_MOOD } from '@/features/patient/api/queries';
   const { data } = useQuery(GET_USER_MOOD);
   ```

3. **Handle Loading/Error**
   ```typescript
   if (loading) return <Skeleton />;
   if (error) return <Alert title="Error" />;
   ```

### Adding a New Route

1. **Create Component/Page**
   ```typescript
   // src/features/patient/pages/NewPage.tsx
   export default function NewPage() { ... }
   ```

2. **Add Route in App.tsx**
   ```typescript
   <Route path="/patient/new-page" element={<NewPage />} />
   ```

3. **Add Navigation Link**
   ```typescript
   // src/features/patient/layout/Sidebar.tsx
   <NavLink to="/patient/new-page">New Page</NavLink>
   ```

---

**This architecture provides:**
- ✅ Clear separation of concerns
- ✅ Easy to add new features
- ✅ Scalable state management
- ✅ Secure authentication
- ✅ Efficient data caching
- ✅ Type-safe development

