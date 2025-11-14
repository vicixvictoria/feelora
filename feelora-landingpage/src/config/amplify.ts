/**
 * Amplify configuration that dynamically uses environment variables
 * provided by AWS Amplify during build time or from .env files during local development.
 * 
 * Environment variables are set in infrastructure/iac/amplify.tf
 */

interface AmplifyConfig {
  auth: {
    user_pool_id: string;
    aws_region: string;
    user_pool_client_id: string;
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
  version: string;
}

/**
 * Get redirect URIs based on AMPLIFY_URL environment variable
 */
function getRedirectUris(): string[] {
  const amplifyUrl = import.meta.env.VITE_AMPLIFY_URL;
  
  // For local development
  if (!amplifyUrl || amplifyUrl.includes('localhost')) {
    return [
      'http://localhost:5173',
      'http://localhost:5173/',
    ];
  }

  // For deployed environments (dev/prod)
  return [
    `https://${amplifyUrl}`,
    `https://${amplifyUrl}/`,
    `https://www.${amplifyUrl}`,
    `https://www.${amplifyUrl}/`,
  ];
}

/**
 * Build Amplify configuration from environment variables
 */
export function getAmplifyConfig(): AmplifyConfig {
  const userPoolId = import.meta.env.VITE_USER_POOL_ID;
  const region = import.meta.env.VITE_REGION;
  const userPoolClientId = import.meta.env.VITE_USER_POOL_CLIENT_ID;
  const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;

  // Validate required environment variables
  if (!userPoolId || !region || !userPoolClientId || !cognitoDomain) {
    console.error('Missing required environment variables:', {
      VITE_USER_POOL_ID: userPoolId,
      VITE_REGION: region,
      VITE_USER_POOL_CLIENT_ID: userPoolClientId,
      VITE_COGNITO_DOMAIN: cognitoDomain,
    });
    throw new Error('Missing required Amplify configuration environment variables');
  }

  const config: AmplifyConfig = {
    auth: {
      user_pool_id: userPoolId,
      aws_region: region,
      user_pool_client_id: userPoolClientId,
      mfa_methods: [],
      standard_required_attributes: ['email'],
      username_attributes: ['email'],
      user_verification_types: ['email'],
      groups: [],
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
    version: '1.4',
  };

  return config;
}

// Export the configuration
export const amplifyConfig = getAmplifyConfig();
