/**
 * Amplify configuration that dynamically uses environment variables
 * provided by AWS Amplify during build time or from .env files during local development.
 * * This file now supports configuration for both the standard user pool and a separate therapist pool
 * by dynamically selecting the Client ID while reusing the core User Pool ID.
 */

interface AmplifyConfig {
  auth: {
    user_pool_id: string;
    aws_region: string;
    user_pool_client_id: string;
    // ... rest of your auth properties ...
    mfa_methods: string[];
    standard_required_attributes: string[];
    username_attributes: string[];
    user_verification_types: string[];
    groups: string[];
    mfa_configuration: string;
    password_policy: {
      min_length: number;
      require_lowercase: boolean;
      require_numbers: boolean;
      require_symbols: boolean;
      require_uppercase: boolean;
    };
    oauth: {
      identity_providers: string[];
      redirect_sign_in_uri: string[];
      redirect_sign_out_uri: string[];
      response_type: string;
      scopes: string[];
      domain: string;
    };
    unauthenticated_identities_enabled: boolean;
  };
  Storage?: {
    // storage configuration for S3
    S3: {
      bucket: string;
      region: string;
    };
  };
  version: string;
}

/**
 * Get redirect URIs based on AMPLIFY_URL environment variable
 */
function getRedirectUris(): string[] {
  const amplifyUrl = import.meta.env.VITE_AMPLIFY_URL;

  if (!amplifyUrl || amplifyUrl.includes('localhost')) {
    return ['http://localhost:5173/'];
  }

  return [`https://${amplifyUrl}/`, `https://www.${amplifyUrl}/`];
}

/**
 * Build Amplify configuration from environment variables,
 * selecting the correct Client ID based on the pool type.
 * * IMPORTANT: Both 'user' and 'therapist' pools reuse the VITE_USER_POOL_ID
 * to ensure tokens are issued by the same authority for backend compatibility.
 * * @param poolType 'user' for standard pool, 'therapist' for therapist pool.
 */
export function buildAmplifyConfig(poolType: 'user' | 'therapist' = 'user'): AmplifyConfig {
  let userPoolId: string;
  let userPoolClientId: string;
  const s3Bucket = import.meta.env.VITE_S3_BUCKET_NAME; // Get the bucket name from environment variables

  // Common required variables
  const region = import.meta.env.VITE_REGION;
  const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;

  // --- 1. Determine Pool IDs and Client IDs ---

  if (poolType === 'therapist') {
    // For therapist, reuse the main User Pool ID but require the specific Client ID
    userPoolId = import.meta.env.VITE_USER_POOL_ID; // Reuse the main ID!
    userPoolClientId = import.meta.env.VITE_THERAPIST_POOL_CLIENT_ID;

    // --- 2. Custom Validation for Therapist Pool ---
    if (!userPoolId || !region || !userPoolClientId || !cognitoDomain) {
      console.error(`Missing required environment variables for ${poolType} pool:`, {
        VITE_USER_POOL_ID: userPoolId, // Now checking the main ID here
        VITE_REGION: region,
        VITE_THERAPIST_POOL_CLIENT_ID: userPoolClientId,
        VITE_COGNITO_DOMAIN: cognitoDomain,
      });
      throw new Error(
        `Missing required Amplify configuration environment variables for ${poolType} pool`,
      );
    }
  } else {
    // For standard user, use the standard variables
    userPoolId = import.meta.env.VITE_USER_POOL_ID;
    userPoolClientId = import.meta.env.VITE_USER_POOL_CLIENT_ID;

    // --- 2. Validation for Standard User Pool ---
    if (!userPoolId || !region || !userPoolClientId || !cognitoDomain) {
      console.error(`Missing required environment variables for ${poolType} pool:`, {
        VITE_USER_POOL_ID: userPoolId,
        VITE_REGION: region,
        VITE_USER_POOL_CLIENT_ID: userPoolClientId,
        VITE_COGNITO_DOMAIN: cognitoDomain,
      });
      throw new Error(
        `Missing required Amplify configuration environment variables for ${poolType} pool`,
      );
    }
  }

  // --- 3. Construct the Configuration ---
  const config: AmplifyConfig = {
    auth: {
      user_pool_id: userPoolId,
      aws_region: region,
      user_pool_client_id: userPoolClientId, // The dynamic value is used here
      mfa_methods: [],
      standard_required_attributes: ['email'],
      username_attributes: ['email'],
      user_verification_types: ['email'],
      groups: poolType === 'therapist' ? ['Therapists'] : [], // Assign 'Therapists' group
      mfa_configuration: 'NONE',
      password_policy: {
        min_length: 6,
        require_lowercase: true,
        require_numbers: true,
        require_symbols: true,
        require_uppercase: true,
      },
      oauth: {
        identity_providers: ['GOOGLE'],
        redirect_sign_in_uri: getRedirectUris(),
        redirect_sign_out_uri: getRedirectUris(),
        response_type: 'code',
        scopes: ['phone', 'email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
        domain: cognitoDomain,
      },
      unauthenticated_identities_enabled: true,
    },
    Storage: {
      S3: {
        bucket: s3Bucket,
        region: region,
      },
    },
    version: '1.4',
  };

  return config;
}

// --- Export the Configurations ---

/**
 * Configuration for the standard user pool (uses VITE_USER_POOL_CLIENT_ID)
 */
export const amplifyConfig = buildAmplifyConfig('user');

/**
 * Configuration for the therapist pool (uses VITE_THERAPIST_POOL_CLIENT_ID
 * and reuses VITE_USER_POOL_ID).
 */
export const therapistAmplifyConfig = buildAmplifyConfig('therapist');
