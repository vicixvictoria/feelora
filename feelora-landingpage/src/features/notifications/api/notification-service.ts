import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';

type NotificationType = 'new_message' | 'new_match' | 'new_unmatch';

export type { NotificationType };

export interface NotificationItem {
  recipientId?: string;
  sk?: string;
  type?: NotificationType;
  conversationId?: string;
  count?: number;
  senderName?: string;
  matchedId?: string;
  unmatchedId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationBatch {
  notifications: NotificationItem[];
  nextToken?: string | null;
}

// Websocket token
const GENERATE_WEBSOCKET_TOKEN = gql`
  mutation GenerateWSAuthToken {
    generateWSAuthToken {
      sessionId,
      profileId,
      used
    }
  }
`;

// Batch notification fetch 
const GET_NOTIFICATIONS = gql`
  query GetNotifications($notificationType: NotificationType, $limit: Int, $nextToken: String) {
    getNotifications(notificationType: $notificationType, limit: $limit, nextToken: $nextToken) {
      notifications {
        recipientId
        sk
        type
        conversationId
        count
        senderName
        matchedId
        unmatchedId
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// Read notification (deletes the item from notification store)
const READ_NOTIFICATION = gql`
  mutation ReadNotification($notificationType: NotificationType!, $notificationId: String!) {
    readNotification(notificationType: $notificationType, notificationId: $notificationId)
  }
`;

// --- Service Object ---
export const notificationService = {
  // Generate Websocket Token
  generateWebsocketToken: async () => {
    // no "await" here! It's a "fire-and-forget" call.
    const { data }: any = await apolloClient
      .mutate({
        mutation: GENERATE_WEBSOCKET_TOKEN,
        fetchPolicy: 'network-only',
      })
      .catch((error) => {
        // We catch the error silently.
        console.debug('Generate Websocket Token (ignored):', error);
      });

      console.warn(data);

    return data.generateWSAuthToken.sessionId;
  },

  getNotifications: async ({
    notificationType,
    limit,
    nextToken,
  }: {
    notificationType?: NotificationType;
    limit?: number;
    nextToken?: string;
  } = {}): Promise<NotificationBatch> => {
    const { data }: any = await apolloClient.query({
      query: GET_NOTIFICATIONS,
      variables: { notificationType, limit, nextToken },
      fetchPolicy: 'network-only',
    });
    return data?.getNotifications ?? { notifications: [], nextToken: null };
  },
  
  readNotification: async ({
    notificationType,
    notificationId,
  }: {
    notificationType: NotificationType;
    notificationId: string;
  }): Promise<boolean> => {
    const { data }: any = await apolloClient.mutate({
      mutation: READ_NOTIFICATION,
      variables: { notificationType, notificationId },
      fetchPolicy: 'network-only',
    });
    return Boolean(data?.readNotification);
  },
}