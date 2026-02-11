import { GraphQLResult } from 'aws-amplify/api';

/**
 * A generic wrapper to handle Amplify GraphQL calls with type safety.
 * It narrows the result from the Subscription/Promise union.
 */
export async function handleGraphQL<T>(
  graphqlPromise: Promise<any> | { subscribe: (...args: any[]) => any } /// Accept the union type directly from Amplify
): Promise<T> {
    // Narrow the union to a Promise and await it
  const result = (await graphqlPromise) as GraphQLResult<T>;

  // GraphQL can return 'errors' even with a 200 status
  if (result.errors && result.errors.length > 0) {
    const mainError = result.errors[0];
    console.error('[GraphQL Error]:', mainError);
    throw new Error(mainError.message || 'GraphQL Request Failed');
  }

  // Ensure data exists
  if (!result.data) {
    throw new Error('No data returned from the API');
  }

  return result.data;
}