/**
 * Validate Environment Variables
 * 
 * This script checks that all required environment variables are set
 * before building the application.
 * 
 * Run with: npm run validate-env
 */

const requiredEnvVars = [
  'VITE_ENVIRONMENT',
  'VITE_REGION',
  'VITE_USER_POOL_ID',
  'VITE_USER_POOL_CLIENT_ID',
  'VITE_AMPLIFY_URL',
  'VITE_COGNITO_DOMAIN',
];

console.log('🔍 Validating environment variables...\n');

let hasErrors = false;

requiredEnvVars.forEach((varName) => {
  const value = process.env[varName];
  
  if (!value) {
    console.error(`❌ Missing: ${varName}`);
    hasErrors = true;
  } else if (value.includes('<set-by-terraform>')) {
    console.error(`❌ Not configured: ${varName} = ${value}`);
    hasErrors = true;
  } else {
    // Mask sensitive values
    const displayValue = varName.includes('CLIENT_ID') || varName.includes('POOL_ID')
      ? value.substring(0, 10) + '...'
      : value;
    console.log(`✅ ${varName} = ${displayValue}`);
  }
});

console.log('');

if (hasErrors) {
  console.error('❌ Environment validation failed!');
  console.error('\nFor local development, create a .env.development file with:');
  requiredEnvVars.forEach((varName) => {
    console.error(`  ${varName}=<your-value>`);
  });
  console.error('\nFor deployed environments, check infrastructure/iac/amplify.tf\n');
  process.exit(1);
} else {
  console.log('✅ All environment variables are set!\n');
  process.exit(0);
}
