// PORTFOLIO DEMO MODE: the GraphQL backend is offline. The real HTTP + auth
// links are commented out below (not deleted); in their place `offlineLink`
// rejects every operation, so nothing can reach the network even by accident.
// All data now comes from the demo services (see src/mocks).
import { ApolloClient, InMemoryCache, ApolloLink, Observable } from '@apollo/client';
// import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
// import { setContext } from '@apollo/client/link/context';

const offlineLink = new ApolloLink(
  (operation) =>
    new Observable((observer) => {
      observer.error(
        new Error(`[Demo mode] Backend is offline — "${operation.operationName}" was not sent.`),
      );
    }),
);
//
// const graphqlEndpoint = import.meta.env.VITE_GRAPHQL_API_URL;
//
// const httpLink = createHttpLink({
//   uri: graphqlEndpoint,
// });

/**
 * Holds a reference to the current access token.
 * Updated by the AuthProvider whenever the token changes.
 */
let _accessToken: string | null = null;

export function setApolloAccessToken(token: string | null) {
  _accessToken = token;
}

export function getApolloAccessToken(): string | null {
  return _accessToken;
}

// /**
//  * Auth link that attaches the current access token to every request.
//  * Falls back to VITE_TEST_AUTH_TOKEN for local testing without login.
//  */
// const authLink = setContext((_, { headers }) => {
//   const token = _accessToken || import.meta.env.VITE_TEST_AUTH_TOKEN;
//   return {
//     headers: {
//       ...headers,
//       ...(token ? { Authorization: token } : {}),
//     },
//   };
// });

// 30-second TTL for cacheable queries (profile data etc.)
// Tracks the last time a given query key was fetched from the network.
const QUERY_CACHE_TTL_MS = 30_000;
const _cacheFetchTimes = new Map<string, number>();

export function isCacheStale(key: string): boolean {
  const t = _cacheFetchTimes.get(key);
  return t === undefined || Date.now() - t >= QUERY_CACHE_TTL_MS;
}

export function markCacheFresh(key: string): void {
  _cacheFetchTimes.set(key, Date.now());
}

export const apolloClient = new ApolloClient({
  // link: ApolloLink.from([authLink, httpLink]),
  link: offlineLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    mutate: { fetchPolicy: 'no-cache' },
    query: { fetchPolicy: 'no-cache' },
  },
});
