# frontend
Comprehensive Documentation about the Frontend: steup, useage, architecture etc, you find in **[README_DOCS.md]**

# Feelora Authentication Setup Guide

This guide explains the Cognito authentication implementation that has been integrated into your Feelora landing page.

## What's Been Implemented

### 1. **AWS Amplify Configuration**
   - Created `amplify_outputs.json` with your Cognito User Pool configuration
   - Configured OAuth with Google identity provider
   - Set up redirect URIs for both local development and production

### 2. **Login Page** (`src/pages/LoginPage.tsx`)
   - Full-featured authentication UI using AWS Amplify Authenticator
   - Supports:
     - Email/password sign-in
     - Google social sign-in
     - Sign-up with custom fields (name, surname, email)
     - Password reset flow
     - Terms and conditions checkbox
   - After successful login, shows a welcome message with user info
   - Includes sign-out functionality

### 3. **App.tsx Updates**
   - Added routing for `/login` page
   - Implemented error handling for authentication failures
   - Displays error modal if authentication fails (e.g., OAuth errors)
   - Automatically clears error parameters from URL after showing the error

### 4. **Navbar Updates**
   - Login button now navigates to `/login` route
   - Updated navigation logic to handle cross-page section scrolling
   - Mobile menu properly closes after login button click

## Installation Steps

Before running the application, you need to install the AWS Amplify dependencies:

```bash
cd /home/michelemusacchio/feelora/frontend/feelora-landingpage
npm install aws-amplify @aws-amplify/ui-react
```

## How to Use

### For Development:
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Click the "Log in" button in the navbar

3. You'll be redirected to `/login` where you can:
   - Sign in with existing credentials
   - Sign up for a new account
   - Sign in with Google

### For Production:
The app is configured to work with your Amplify deployment at:
- `https://dev.dvlctjk22kd5u.amplifyapp.com`
- `https://www.dev.dvlctjk22kd5u.amplifyapp.com`

## Configuration Details

Your Cognito configuration includes:
- **User Pool ID**: `eu-central-1_G9kmeK2rW`
- **App Client ID**: `2fkh7equm66ak8dn1pvvkgdv49`
- **Region**: `eu-central-1`
- **Cognito Domain**: `dev-feelora.auth.eu-central-1.amazoncognito.com`
- **Identity Providers**: Google
- **OAuth Scopes**: phone, email, openid, profile, aws.cognito.signin.user.admin

## Password Requirements

As configured in Cognito:
- Minimum length: 6 characters
- Must include: lowercase, uppercase, numbers, and symbols

## User Attributes

Required sign-up fields:
- Email (used as username)
- Name
- Surname (family_name)

## What Happens After Login?

After successful authentication:
1. User sees a welcome screen with their email
2. Two buttons are available:
   - "Go to Dashboard" - navigates back to home page (currently)
   - "Sign out" - logs the user out

## Next Steps / Customization

You may want to:

1. **Create a Protected Dashboard**: 
   - Create a new dashboard page for authenticated users
   - Update the "Go to Dashboard" button to navigate there

2. **Add Authentication State Management**:
   - Use Amplify's auth state to show/hide the login button
   - Display user profile in the navbar when logged in
   - Show "Log out" instead of "Log in" for authenticated users

3. **Protect Routes**:
   - Create a ProtectedRoute component
   - Redirect unauthenticated users to login page

4. **Access User Tokens**:
   ```typescript
   import { fetchAuthSession } from 'aws-amplify/auth';
   
   const session = await fetchAuthSession();
   const token = session.tokens?.accessToken;
   ```

5. **Check Authentication Status**:
   ```typescript
   import { getCurrentUser } from 'aws-amplify/auth';
   
   try {
     const user = await getCurrentUser();
     // User is authenticated
   } catch {
     // User is not authenticated
   }
   ```

## Troubleshooting

### "Cannot find module 'aws-amplify'"
Run: `npm install aws-amplify @aws-amplify/ui-react`

### OAuth Redirect Issues
Make sure your Cognito User Pool has the correct redirect URIs configured:
- For local: `http://localhost:5173/`
- For production: Your Amplify app URL

### Google Sign-In Not Working
Verify that:
1. Google identity provider is properly configured in Cognito
2. Your Google OAuth client has the correct redirect URIs
3. The Cognito domain is properly set up

## Files Modified/Created

- ✅ `/amplify_outputs.json` - Amplify configuration
- ✅ `/src/pages/LoginPage.tsx` - Login page component
- ✅ `/src/App.tsx` - Added login route and error handling
- ✅ `/src/components/Navbar.tsx` - Updated login button
- ✅ `/src/contexts/LanguageContext.tsx` - Fixed type checking

## Security Notes

- User credentials are handled entirely by AWS Cognito
- OAuth flows follow industry standards (Authorization Code flow)
- All tokens are stored securely by Amplify
- HTTPS is required for production (enforced by OAuth)
- Your app is GDPR compliant through AWS Cognito

## Support

For AWS Amplify documentation: https://docs.amplify.aws/
For Cognito documentation: https://docs.aws.amazon.com/cognito/

# Environment Configuration

This project uses environment-specific configuration for AWS Amplify and Cognito.

## How it Works

The application dynamically loads configuration from environment variables set by:
- **Local Development**: `.env.development` file
- **Deployed Environments**: Terraform (`infrastructure/iac/amplify.tf`)

## Environment Variables

The following environment variables are required:

| Variable | Description | Example (Dev) |
|----------|-------------|---------------|
| `VITE_ENVIRONMENT` | Environment name | `dev` or `prod` |
| `VITE_REGION` | AWS Region | `eu-central-1` |
| `VITE_USER_POOL_ID` | Cognito User Pool ID | `eu-central-1_G9kmeK2rW` |
| `VITE_USER_POOL_CLIENT_ID` | Cognito User Pool Client ID | `2fkh7equm66ak8dn1pvvkgdv49` |
| `VITE_AMPLIFY_URL` | Amplify app URL (without https://) | `dev.dvlctjk22kd5u.amplifyapp.com` |
| `VITE_COGNITO_DOMAIN` | Cognito domain | `dev-feelora.auth.eu-central-1.amazoncognito.com` |

## Redirect URIs

The application automatically generates redirect URIs based on `VITE_AMPLIFY_URL`:

**For deployed environments:**
- `https://{VITE_AMPLIFY_URL}`
- `https://{VITE_AMPLIFY_URL}/`
- `https://www.{VITE_AMPLIFY_URL}`
- `https://www.{VITE_AMPLIFY_URL}/`

**For local development:**
- `http://localhost:5173`
- `http://localhost:5173/`

## Local Development

1. Copy `.env.development` if it doesn't exist
2. Update values to match your dev environment
3. Run `npm run dev`

## Deployment

Environment variables are automatically set by Terraform in `infrastructure/iac/amplify.tf`:

```terraform
environment_variables = {
  VITE_ENVIRONMENT        = var.environment
  VITE_REGION             = "eu-central-1"
  VITE_USER_POOL_ID       = module.cognito.user_pool_id
  VITE_USER_POOL_CLIENT_ID = module.cognito.user_pool_client_ids["users"]
  VITE_AMPLIFY_URL        = var.amplify_url
  VITE_COGNITO_DOMAIN     = module.cognito.cognito_domain
}
```

When you deploy with Terraform:
- **Dev branch**: Uses values from `infrastructure/envs/dev.tfvars`
- **Prod branch**: Uses values from `infrastructure/envs/prod.tfvars`

## Configuration File

The configuration is built dynamically in `src/config/amplify.ts`:

```typescript
import { amplifyConfig } from './config/amplify';
import { Amplify } from 'aws-amplify';

Amplify.configure(amplifyConfig);
```

## Migration from amplify_outputs.json

The old `amplify_outputs.json` file has been replaced with dynamic configuration. If you have an existing `amplify_outputs.json`, you can:

1. Keep it for reference
2. Update `.env.development` with the values
3. The application now uses `src/config/amplify.ts` instead

## Troubleshooting

If you see errors about missing environment variables:

1. **Local Development**: Make sure `.env.development` exists and has all required variables
2. **Deployed App**: Check that Terraform has been applied with the correct environment variables
3. Check the Amplify build logs for the echo statements showing environment variable values
