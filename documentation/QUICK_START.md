# Quick Start Guide - Feelora Frontend

Get up and running in 5 minutes!

## TL;DR

```bash
# 1. Navigate to project
cd feelora-landingpage

# 2. Install dependencies
npm install

# 3. Set up environment (ask team for .env.local values)
touch .env.local
# Add VITE_GRAPHQL_API_URL, AWS credentials, etc.

# 4. Start development server
npm run dev

# 5. Open in browser
# http://localhost:5173
```

## Environment Variables Checklist

Copy this template to `.env.local` and fill in values:

```env
# API Endpoints
VITE_GRAPHQL_API_URL=
VITE_AUTH_API_URL=

# AWS Configuration
VITE_AMPLIFY_URL=http://localhost:5173
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=
VITE_AWS_USER_POOL_CLIENT_ID=
VITE_AWS_THERAPIST_CLIENT_ID=
VITE_AWS_STORAGE_BUCKET=
VITE_AWS_STORAGE_REGION=

# Optional: Local testing without login
VITE_TEST_AUTH_TOKEN=
```

## Project at a Glance

| Aspect | Details |
|--------|---------|
| **Type** | React + TypeScript SPA |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS |
| **State Management** | Apollo Client (GraphQL) + TanStack Query |
| **Authentication** | AWS Cognito |
| **Main Features** | Patient & Therapist dashboards |

## Key Directories

| Path | Purpose |
|------|---------|
| `src/features/landing/` | Public landing pages |
| `src/features/patient/` | Patient dashboard pages & components |
| `src/features/therapist/` | Therapist dashboard pages & components |
| `src/features/auth/` | Login & authentication pages |
| `src/components/ui/` | Reusable UI components (Shadcn/Radix) |
| `src/contexts/` | Global state (Auth, Language) |
| `src/hooks/` | Custom React hooks |
| `src/lib/` | Utilities (Apollo, Axios, etc.) |

## Testing Access

### Patient Access
- Go to: `http://localhost:5173/login`
- Use test credentials provided by your team
- Redirected to: `http://localhost:5173/patient/`

### Therapist Access
- Go to: `http://localhost:5173/loginTherapist`
- Use therapist test credentials
- Redirected to: `http://localhost:5173/therapist/`

### Bypass Login (Dev Only)
If `VITE_TEST_AUTH_TOKEN` is set, you can:
1. Visit `/test-patient` to see patient questionnaire
2. Visit `/test-therapist` to see therapist questionnaire
3. These routes are public and bypass authentication

## Useful Commands

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for TypeScript errors (integrated during build)
# No separate type-check command - errors shown in dev server
```

## File I'm Currently Working On

The file you're editing is: `src/features/therapist/pages/TherapistQuestionnaire.tsx`

This is likely where therapists fill out onboarding/assessment forms.

## First Steps

1. **Get environment variables** from your team lead
2. **Install & run** the app (`npm install && npm run dev`)
3. **Explore the code**: Start with `src/App.tsx` to understand routing
4. **Browse features**: Navigate to patient/therapist dashboards
5. **Pick a component**: Understand how one feature works end-to-end

## Need Help?

- **Routes confused?** Read `src/App.tsx` - all routes defined here
- **How's auth working?** Check `src/contexts/AuthContext.tsx`
- **Where's a component?** Use VS Code search (Cmd+P)
- **How to call backend?** See `src/features/patient/api/` for examples

---

**Happy coding!** 🚀
