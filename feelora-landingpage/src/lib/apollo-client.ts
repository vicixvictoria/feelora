import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const graphqlEndpoint = import.meta.env.VITE_GRAPHQL_API_URL;

const httpLink = createHttpLink({
  uri: graphqlEndpoint,
});

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

/**
 * Auth link that attaches the current access token to every request.
 * Falls back to VITE_TEST_AUTH_TOKEN for local testing without login.
 */
const authLink = setContext((_, { headers }) => {
  const token = _accessToken || import.meta.env.VITE_TEST_AUTH_TOKEN;
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: token } : {}),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    mutate: { fetchPolicy: 'no-cache' },
    query: { fetchPolicy: 'no-cache' },
  },
});
