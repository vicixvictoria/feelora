# Feelora Frontend Documentation

Welcome! This directory contains comprehensive documentation for the Feelora frontend codebase. Start here to understand the project and get productive quickly.

## 📚 Documentation Overview

### **[QUICK_START.md](QUICK_START.md)** ⚡ START HERE
**Read this first if you're new to the project (5 min read)**

- Project setup in 5 minutes
- Environment variables checklist
- Project structure at a glance
- First steps to take

**Best for:** Getting running locally immediately

---

### **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** 📖 COMPREHENSIVE GUIDE
**Your go-to reference for everything (60 min read)**

- Complete project overview
- Technology stack explained
- Full project structure
- Authentication & access control
- All key features explained
- Common development tasks with code examples
- Troubleshooting section

**Best for:** Understanding the complete project, learning workflows, solving problems

**Key sections:**
- Project Overview (what is Feelora)
- Tech Stack (libraries & tools)
- Setup & Installation
- Authentication Flow
- Key Features (Mood Tracking, Chat, Homework, etc.)
- Adding new features step-by-step
- Using Shadcn/UI components
- Common tasks (display user info, make GraphQL queries, show toasts, etc.)

---

### **[ARCHITECTURE.md](ARCHITECTURE.md)** 🏗️ SYSTEM DESIGN
**Deep dive into how the app works internally (45 min read)**

- High-level architecture diagram
- Authentication architecture & flows
- Three data flow patterns (GraphQL Query, Mutation, REST)
- State management (3-layer architecture)
- Component hierarchy
- API integration best practices

**Best for:** Understanding _how_ the app works, making architectural decisions, complex debugging

**Key sections:**
- System architecture overview
- Token lifecycle & refresh mechanism
- Request/response flows with diagrams
- State management patterns
- Component communication
- GraphQL & REST API structures

---

### **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** 🔧 PROBLEM SOLVING
**Solutions to common issues you'll encounter (30 min read)**

- Installation & setup problems
- Authentication errors (login, tokens, OAuth)
- GraphQL & data fetching issues
- Styling & UI problems
- Performance issues & optimization
- Deployment troubleshooting
- General debugging tips & checklist

**Best for:** Fixing problems, learning from others' mistakes, optimizing performance

**Organized by problem area with:**
- Symptoms (how to recognize the issue)
- Root causes (why it happens)
- Debug steps (how to diagnose)
- Solutions (how to fix)

---

## 🚀 Quick Navigation by Use Case

### "I'm brand new, set me up!"
1. Read: [QUICK_START.md](QUICK_START.md)
2. Install dependencies: `npm install`
3. Configure .env.local
4. Run: `npm run dev`
5. Open http://localhost:5173

### "I want to understand the whole project"
1. Read: [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
2. Skim [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
3. Explore the codebase mentioned in the guide

### "I need to add a new feature"
1. Check [DEVELOPER_GUIDE.md → Adding a New Feature](DEVELOPER_GUIDE.md#adding-a-new-feature)
2. Reference [ARCHITECTURE.md → Adding a New Route](ARCHITECTURE.md#adding-a-new-route)
3. Use existing features as templates

### "Something is broken!"
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for your issue
2. Use debugging steps provided
3. Check [DEVELOPER_GUIDE.md → Troubleshooting](DEVELOPER_GUIDE.md#troubleshooting)

### "I need to work with authentication"
1. Read: [DEVELOPER_GUIDE.md → Authentication Flow](DEVELOPER_GUIDE.md#authentication-flow)
2. Read: [ARCHITECTURE.md → Authentication Architecture](ARCHITECTURE.md#authentication-architecture)
3. Check: [TROUBLESHOOTING.md → Authentication Issues](TROUBLESHOOTING.md#authentication-issues)

### "I need to fetch data from the API"
1. Check: [DEVELOPER_GUIDE.md → Make a GraphQL Query](DEVELOPER_GUIDE.md#task-2-make-a-graphql-query)
2. Reference: [ARCHITECTURE.md → Data Flow Patterns](ARCHITECTURE.md#data-flow-patterns)
3. See: [TROUBLESHOOTING.md → GraphQL Issues](TROUBLESHOOTING.md#data-fetching--graphql)

### "Things are running slow"
1. Check: [TROUBLESHOOTING.md → Performance Issues](TROUBLESHOOTING.md#performance-issues)
2. Read: [ARCHITECTURE.md → Data Flow](ARCHITECTURE.md#data-flow-patterns) (to understand caching)

### "I'm deploying to production"
1. Read: [TROUBLESHOOTING.md → Deployment Issues](TROUBLESHOOTING.md#deployment-issues)
2. Verify all environment variables are set

---

## 📋 Documentation Structure

```
frontend/
├── QUICK_START.md          ← Start here (5 min)
├── DEVELOPER_GUIDE.md      ← Comprehensive guide (60 min)
├── ARCHITECTURE.md         ← Technical deep dive (45 min)
├── TROUBLESHOOTING.md      ← Problem solutions (30 min)
├── README.md               ← Project-level info (exists)
└── feelora-landingpage/
    ├── README.md           ← Build-level info
    ├── package.json        ← Dependencies list
    ├── vite.config.ts      ← Build config
    ├── tsconfig.json       ← TypeScript config
    ├── tailwind.config.js  ← Styling config
    └── src/
        ├── App.tsx         ← Main app component
        ├── index.tsx       ← Entry point
        ├── components/     ← Reusable UI
        ├── contexts/       ← Global state
        ├── features/       ← Main features
        │   ├── auth/
        │   ├── landing/
        │   ├── patient/
        │   └── therapist/
        ├── hooks/          ← Custom hooks
        ├── lib/            ← Utilities
        └── config/         ← Configurations
```

---

## 🔑 Key Concepts at a Glance

| Concept | Where to Read | Quick Explanation |
|---------|---------------|-------------------|
| **Authentication** | [DEVELOPER_GUIDE](DEVELOPER_GUIDE.md#authentication-flow) / [ARCHITECTURE](ARCHITECTURE.md#authentication-architecture) | AWS Cognito manages user login. Tokens attached to all API requests. Auto-refresh every 55 min. |
| **Routing** | [DEVELOPER_GUIDE](DEVELOPER_GUIDE.md#setup--installation) | React Router enables SPA navigation. /patient/* for patients, /therapist/* for therapists |
| **Data Fetching** | [ARCHITECTURE](ARCHITECTURE.md#data-flow-patterns) | Apollo Client for GraphQL, TanStack Query for REST. Both cache responses automatically |
| **State Management** | [ARCHITECTURE](ARCHITECTURE.md#state-management) | Server state (backend data), Client state (auth), Component state (UI) |
| **Styling** | [DEVELOPER_GUIDE](DEVELOPER_GUIDE.md#using-shadcnui-components) | Tailwind CSS + Shadcn/ui (Radix UI components). Define utilities in components |
| **Components** | [DEVELOPER_GUIDE](DEVELOPER_GUIDE.md#components) | Organize by feature. Use Shadcn/ui for UI primitives, create composable components |
| **User Types** | [DEVELOPER_GUIDE](DEVELOPER_GUIDE.md#user-types--access-control) | Two user types: patient and therapist. Access control via RequireAuth wrapper |
| **API Calls** | [ARCHITECTURE](ARCHITECTURE.md#api-integration) | Query/mutation files in `api/` folder. Types in `types/` folder |

---

## 🎯 Development Workflow

```
┌─ New to company
│
├─ 1. Read QUICK_START.md
├─ 2. Set up locally (npm install, .env.local)
├─ 3. Run: npm run dev
│
├─ 4. Read DEVELOPER_GUIDE.md
├─ 5. Explore codebase (start with App.tsx)
│
├─ ONGOING:
│  ├─ Reference DEVELOPER_GUIDE for how-tos
│  ├─ Reference ARCHITECTURE for understanding complex flows
│  ├─ Reference TROUBLESHOOTING when stuck
│  └─ Use existing code as templates for new features
│
└─ When deploying to production:
   └─ Check TROUBLESHOOTING.md deployment section
```

---

## 📞 Getting Help

### Before asking your team:

1. **Search the relevant doc** - CTRL+F in the markdown file
   - Look for your error message or feature name
   - Check TROUBLESHOOTING.md first

2. **Check existing code** - Look at a similar working feature
   - Need to add a button? Find another button's code
   - Need to fetch data? Find similar GraphQL query
   - Copy the pattern

3. **Check library documentation**
   - Shadcn/ui: https://ui.shadcn.com/ (component library)
   - Apollo Client: https://www.apollographql.com/docs/react/ (GraphQL)
   - React Router: https://reactrouter.com/ (routing)
   - Tailwind: https://tailwindcss.com/ (styling)

### If still stuck, ask your team:

- **Slack/Discord** - For quick questions
- **Team meeting** - For design/architectural questions
- **Code review** - For implementation feedback
- **Pair program** - For complex features

---

## ✅ Documentation Checklist

- [x] QUICK_START.md - Get running in 5 minutes
- [x] DEVELOPER_GUIDE.md - All you need to know (comprehensive)
- [x] ARCHITECTURE.md - How the system works (technical)
- [x] TROUBLESHOOTING.md - Problem solutions
- [x] This INDEX - Navigate all docs

---

## 🔄 Keeping Documentation Updated

**Important:** As the project evolves, keep docs updated:

- [x] Therapist license document upload: Added to [DEVELOPER_GUIDE.md → Key Features] and [ARCHITECTURE.md → API Integration]
- [x] Patient dashboard unread messages: Added to [DEVELOPER_GUIDE.md → Key Features] and [ARCHITECTURE.md → Component Hierarchy]
- [x] Qualification document upload required: Added to [DEVELOPER_GUIDE.md → Key Features]
- [x] Landing page section navigation: Added to [DEVELOPER_GUIDE.md → Key Features] and [ARCHITECTURE.md → Component Hierarchy]
- [x] Legal documents page title: Added to [DEVELOPER_GUIDE.md → Key Features]
- [x] New i18n keys: Documented in [DEVELOPER_GUIDE.md → File Organization Guide] and [ARCHITECTURE.md → API Integration]

---

## 📖 Documentation Best Practices Used

All documentation follows these principles:

- ✅ **Practical** - Real code examples, not theory
- ✅ **Scannable** - Headings, bullet points, bold text
- ✅ **Searchable** - Use keywords that developers search for
- ✅ **Complete** - Covers setup to advanced usage
- ✅ **Linked** - Cross-references between docs
- ✅ **Debuggable** - Troubleshooting always included
- ✅ **Example-based** - Show don't tell

---

**These docs were created on February 17, 2026**

For questions about the documentation itself, check with your team lead.

Happy coding! 🚀
