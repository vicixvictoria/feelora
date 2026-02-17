# Common Issues & FAQ

Solutions to common problems developers encounter when working on Feelora frontend.

## Content

- [Installation & Setup Issues](#installation--setup-issues)
- [Authentication Issues](#authentication-issues)
- [Data Fetching & GraphQL](#data-fetching--graphql)
- [Styling & UI Issues](#styling--ui-issues)
- [Performance Issues](#performance-issues)
- [Deployment Issues](#deployment-issues)
- [General Tips](#general-tips)

---

## Installation & Setup Issues

### ❌ "npm install" fails with version conflicts

**Symptoms:**
```
npm ERR! peer dep missing: ...
npm ERR! could not resolve dependency
```

**Solution:**

```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# If still failing, use npm ci (more reliable)
npm ci
```

### ❌ "Cannot find module" error after npm install

**Symptoms:**
```
Cannot find module '@/components/ui/button'
Module not found: Error resolving 'aws-amplify'
```

**Solution:**

1. Check `vite.config.ts` has correct alias:
   ```typescript
   resolve: {
     alias: {
       "@": path.resolve(__dirname, "src"),
     },
   }
   ```

2. Check `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["src/*"]
       }
     }
   }
   ```

3. Restart VS Code and dev server

---

## Authentication Issues

### ❌ Login redirects to /auth/callback and then shows blank page

**Symptoms:**
- URL is `/auth/callback?code=xxx&state=yyy`
- White screen or error message

**Causes:**
1. Invalid Cognito config
2. Missing environment variables
3. Redirect URI not configured in Cognito

**Solution:**

```bash
# Check environment variables
echo $VITE_AWS_USER_POOL_ID
echo $VITE_AWS_USER_POOL_CLIENT_ID
echo $VITE_AMPLIFY_URL

# All should have values, not empty
```

Then in AWS Cognito console:
1. Go to your User Pool → App clients
2. Verify "Callback URL(s)" includes your dev URL: `http://localhost:5173/auth/callback`
3. Check "Allowed OAuth Scopes" includes `openid email profile`

### ❌ "User is not authenticated" error on protected routes

**Symptoms:**
- Redirects back to login even after successful login
- `isAuthenticated` is always `false`

**Root causes:**
1. Token not being stored
2. AuthContext not initialized properly
3. Browser cookies/storage disabled

**Debug steps:**

```tsx
// Add this in a component to check auth state
import { useAuth } from '@/hooks/use-auth';

export function DebugAuth() {
  const auth = useAuth();
  console.log('Auth state:', {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    token: auth.accessToken ? 'Set' : 'Missing',
  });
  return null;
}
```

Then check browser DevTools:
1. **Console**: Look at the log output
2. **Application → Cookies**: Look for `CognitoIdentityServiceProvider` tokens
3. **Application → Local Storage**: Check for `user` or token keys
4. **Network**: Watch `/auth/callback` request - should have 200 status

### ❌ Google OAuth login fails silently

**Symptoms:**
- Click "Sign in with Google" - nothing happens
- Browser console shows CORS error

**Solution:**

1. Check Cognito OAuth settings:
   - User Pool → App Integration → App Clients → Settings
   - "Allowed OAuth Scopes" should include `openid email profile`
   - "Allowed redirect URIs" should include callback URL

2. Check Google OAuth credentials:
   - Go to Google Cloud Console
   - Authorized redirect URIs should include your callback URL
   - Client ID matches what's in Cognito config

3. If testing locally/on different domain:
   - You may need separate Google app for dev/prod
   - Update Cognito config with correct client ID

### ❌ Token expires and user gets logged out

**Symptoms:**
- Works fine for 1 hour
- Then 401 errors and redirects to login

**Solution:**

Tokens should auto-refresh every 55 minutes. If not:

1. Check AuthContext is running refresh loop:
   ```tsx
   const auth = useAuth();
   console.log('Last refresh:', auth.lastRefresh); // Should be recent
   ```

2. Check backend `/auth/refresh` endpoint is working:
   ```bash
   curl -X POST https://auth.feelora-dev.com/auth/refresh \
     -H "Authorization: your-refresh-token"
   ```

3. If backend is missing endpoint, tokens won't auto-refresh

---

## Data Fetching & GraphQL

### ❌ GraphQL query returns null or empty data

**Symptoms:**
```
{ data: { patient: null } } // Expected patient object
```

**Debugging steps:**

1. Check if query has correct format:
   ```tsx
   // Use Apollo DevTools (Chrome Extension)
   // View network tab → GraphQL request
   // Check query syntax is correct
   ```

2. Verify backend is returning data:
   ```bash
   # Test GraphQL endpoint directly
   curl -X POST https://api.feelora-dev.com/graphql \
     -H "Content-Type: application/json" \
     -H "Authorization: your-token" \
     -d '{"query":"{ patient(id:\"123\") { id name } }"}'
   ```

3. Check auth token is included:
   ```tsx
   import { getApolloAccessToken } from '@/lib/apolloClient';
   console.log('Token:', getApolloAccessToken()); // Should not be null
   ```

4. Check cache policy:
   ```tsx
   const { data } = useQuery(GET_PATIENT, {
     fetchPolicy: 'network-only', // Force fresh fetch
   });
   ```

### ❌ "GRAPHQL_ERROR: Unauthorized" on GraphQL requests

**Symptoms:**
```
Error: [GraphQL error]: Message: Unauthorized, Locations: ...
```

**Causes:**
1. Access token not attached to request
2. Access token is invalid/expired
3. Backend rejecting token

**Solution:**

```tsx
// Check token is being sent
import { getApolloAccessToken } from '@/lib/apolloClient';

console.log('Token value:', getApolloAccessToken());
console.log('Token length:', getApolloAccessToken()?.length);

// Decode token to see details
import { jwtDecode } from 'jwt-decode';
const decoded = jwtDecode(getApolloAccessToken() || '');
console.log('Token expires:', new Date(decoded.exp * 1000));
```

If token is missing:
1. User might not be logged in → Check AuthContext
2. Token refresh might be failing → Check backend `/auth/refresh`

If token is expired:
1. Manual logout/login to get fresh token
2. Check if token refresh endpoint is working

### ❌ Mutation succeeds but UI doesn't update

**Symptoms:**
- `updatePatient` mutation succeeds
- Toast shows "Saved!"
- But page still shows old data

**Solution:**

Option A: Update Apollo cache manually:
```tsx
const [updatePatient] = useMutation(UPDATE_PATIENT, {
  onCompleted: (data) => {
    // Update cache immediately
    apolloClient.cache.modify({
      fields: {
        patient(existing) {
          return data.updatePatient;
        }
      }
    });
  }
});
```

Option B: Refetch the data:
```tsx
const { data, refetch } = useQuery(GET_PATIENT);
const [updatePatient] = useMutation(UPDATE_PATIENT, {
  onCompleted: () => {
    refetch(); // Re-fetch fresh data
  }
});
```

Option C: Better - Include cache update in mutation:
```tsx
const [updatePatient] = useMutation(UPDATE_PATIENT, {
  refetchQueries: [{ query: GET_PATIENT, variables: { id } }],
});
```

---

## Styling & UI Issues

### ❌ Tailwind CSS classes not applying

**Symptoms:**
```
<div className="bg-blue-500 p-4">
<!-- Shows no blue background, despite correct class -->
```

**Causes:**
1. Dynamic class names (Tailwind can't detect them)
2. Tailwind config missing content paths
3. Styles not recompiling

**Solution:**

1. Use full class names, not dynamic:
   ```tsx
   // ❌ Wrong
   const color = 'blue';
   <div className={`bg-${color}-500`}>

   // ✅ Correct
   const color = 'blue';
   <div className={color === 'blue' ? 'bg-blue-500' : 'bg-red-500'}>
   ```

2. Check `tailwind.config.js` includes content paths:
   ```javascript
   module.exports = {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
   };
   ```

3. Restart dev server after config changes:
   ```bash
   npm run dev  # Ctrl+C and restart
   ```

### ❌ Shadcn/UI components look broken

**Symptoms:**
- Button doesn't have rounded corners
- Dialog has no backdrop
- Styles look completely different than expected

**Causes:**
1. Tailwind CSS not loading
2. Component not imported correctly
3. Missing peer dependency

**Solution:**

1. Verify Tailwind is imported in `src/index.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

2. Check component import is correct:
   ```tsx
   // ✅ Correct
   import { Button } from "@/components/ui/button";

   // ❌ Wrong
   import { Button } from "@/Button";
   import { Button } from "@components/ui/button";
   ```

3. Verify dependencies installed:
   ```bash
   npm list @radix-ui/react-dialog tailwind-merge
   ```

### ❌ Toast notifications not showing

**Symptoms:**
- `toast()` function called but nothing appears
- Toast should be in bottom-right corner

**Solution:**

1. Ensure Toaster is in App.tsx:
   ```tsx
   // src/App.tsx inside App component
   <Toaster />
   <Sonner /> {/* Alternative/additional toast system */}
   ```

2. Use correct toast hook:
   ```tsx
   import { useToast } from "@/hooks/use-toast";

   const { toast } = useToast();
   toast({
     title: "Success",
     description: "Operation completed",
   });
   ```

3. Check toast isn't z-index hidden:
   ```css
   /* Toaster should have high z-index (usually 40-50) */
   .toaster { z-index: 40; }
   ```

---

## Performance Issues

### ❌ Page loads very slowly

**Symptoms:**
- Clear to Largest Contentful Paint (LCP) takes 5+ seconds
- Lots of network requests

**Causes:**
1. Large bundle size
2. Unnecessary re-renders
3. N+1 queries (backend issue usually)
4. Missing code splitting

**Solution:**

1. Check bundle size:
   ```bash
   npm run build -- --analyze  # If available
   # Or use: npx vite build --outDir dist
   ```

2. Use React DevTools Profiler:
   - Open: More Tools → React DevTools → Profiler
   - Record interactions
   - Look for components rendering unnecessarily

3. Optimize queries:
   ```tsx
   // ❌ Multiple queries causing N+1
   const patients = useQuery(GET_PATIENTS); // 10 patients
   patients.data?.forEach(p => {
     useQuery(GET_PATIENT, { id: p.id }); // 10 more queries!
   });

   // ✅ Single query with nested data
   const patientsWithDetails = useQuery(GET_PATIENTS_WITH_DETAILS);
   ```

4. Code split heavy features:
   ```tsx
   const MoodTracker = lazy(() => import('./MoodTrackerPage'));
   <Suspense fallback={<Spinner />}>
     <MoodTracker />
   </Suspense>
   ```

### ❌ React re-renders too many times

**Symptoms:**
- Component console.log runs multiple times on single user action
- App feels laggy when typing or scrolling

**Solution:**

1. Use React DevTools Profiler to find culprit

2. Wrap expensive components with memo:
   ```tsx
   import { memo } from 'react';

   const MoodCard = memo(function MoodCard({ mood }) {
     return <div>{mood}</div>;
   });
   ```

3. Use useCallback for event handlers:
   ```tsx
   import { useCallback } from 'react';

   function Parent() {
     const handleClick = useCallback(() => {
       // Only recreated if dependencies change
       doSomething();
     }, []);

     return <Child onClick={handleClick} />;
   }
   ```

---

## Deployment Issues

### ❌ Build fails with "Cannot find type" errors

**Symptoms:**
```
error TS2307: Cannot find module 'react' or its declarations
error TS1219: Unterminated string literal
```

**Solution:**

```bash
# Check TypeScript errors locally first
npm run build  # Will show errors

# Common fixes:
1. Check tsconfig.json is valid JSON (no trailing commas)
2. Ensure all imports have correct paths
3. Check for circular dependencies
4. Validate .env.local has all required vars
```

### ❌ Deployed site shows "Cannot GET /" error

**Symptoms:**
- Build succeeds
- Site deploys
- Visiting site shows error

**Causes:**
- Server not configured for SPA (Single Page Application)
- Router trying to find real files for routes like /patient

**Solution:**

**For Vercel:**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**For Netlify:**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**For Docker/Static Host:**
```nginx
# nginx.conf
location / {
  try_files $uri /index.html;
}
```

### ❌ Apollo Client doesn't have auth token in production

**Symptoms:**
- Works locally with `VITE_TEST_AUTH_TOKEN`
- Production shows "Unauthorized" errors

**Solution:**

1. Check environment variables transferred to production:
   ```bash
   # In production build log, verify:
   VITE_GRAPHQL_API_URL=XXX
   VITE_AUTH_API_URL=XXX
   # Should show actual values, not undefined
   ```

2. Ensure AuthContext initializes in production:
   ```tsx
   // src/contexts/AuthContext.tsx should read from localStorage
   const storedToken = localStorage.getItem('accessToken');
   setAccessToken(storedToken);
   ```

3. Check Cognito domain is accessible:
   ```bash
   curl https://your-cognito-domain.auth.region.amazoncognito.com/.well-known/openid-configuration
   # Should return JSON, not error
   ```

---

## General Tips

### 🎯 Debugging Workflow

1. **Check browser DevTools:**
   - Console for errors
   - Network tab for API calls
   - Application tab for storage/cookies

2. **Add console logs strategically:**
   ```tsx
   console.group('Fetching user data');
   console.log('User ID:', userId);
   console.log('Token:', getApolloAccessToken());
   console.groupEnd();
   ```

3. **Use GitHub Copilot or ChatGPT:**
   - Copy error message
   - Paste file content if relevant
   - Ask: "How do I fix this?"

4. **Search GitHub issues:**
   - Many common issues have solutions online
   - Format: "Feelora" + error message + library name

### 🔧 Quick Fix Checklist

When something breaks unexpectedly:

- [ ] Clear browser cache and localStorage
- [ ] Restart dev server (`npm run dev`)
- [ ] Check `.env.local` has all variables
- [ ] Verify network requests in DevTools
- [ ] Check auth token is present: `useAuth().accessToken`
- [ ] Look at most recent code changes
- [ ] Check GraphQL query syntax with Apollo DevTools
- [ ] Try `npm install` to ensure dependencies are correct
- [ ] Check VS Code problems panel for TypeScript errors

### 📚 Where to Get Help

1. **Check project docs:**
   - `DEVELOPER_GUIDE.md` - Full guide
   - `ARCHITECTURE.md` - How app works
   - `QUICK_START.md` - Get running fast

2. **Check component examples:**
   - Look at similar working features
   - Copy pattern to your new code

3. **Check library docs:**
   - Shadcn/ui: https://ui.shadcn.com/
   - Apollo Client: https://www.apollographql.com/docs/react/
   - Tailwind: https://tailwindcss.com/docs
   - React Router: https://reactrouter.com/

4. **Ask your team:**
   - Slack/Discord
   - Team meetings
   - Code reviews

---

**Remember:** Most issues have been solved before. Copy working patterns from similar code in the repo!

