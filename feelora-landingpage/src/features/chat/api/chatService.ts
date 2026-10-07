// PORTFOLIO DEMO MODE: the backend is offline, so the real API calls below are
// commented out (not deleted) and `chatService` at the bottom of this file
// serves demo data from src/mocks instead.
// import { gql } from '@apollo/client';
// import { apolloClient } from '@/lib/apollo-client';
import { db, getCurrentUserId, notifyDemoStoreChanged, respond } from '@/mocks/demo-store';

// --- Types ---
export interface ChatConversation {
  conversationId: string;
  participantIds: string[];
  lastMessage?: string;
  lastMessageFrom?: string;
  lastMessageAt?: number;
  createdAt: number;
}

export interface ChatMessage {
  messageId: string;
  conversationId: string;
  from: string;
  content: string;
  type: string;
  sentAt: number;
}

// // --- GraphQL Queries & Mutations ---
// const GET_CONVERSATIONS_QUERY = gql`
//   query GetConversations($limit: Int, $nextToken: String) {
//     getConversations(limit: $limit, nextToken: $nextToken) {
//       items {
//         conversationId
//         participantIds
//         lastMessage
//         lastMessageFrom
//         lastMessageAt
//         createdAt
//       }
//       nextToken
//     }
//   }
// `;
//
// const GET_MESSAGES_QUERY = gql`
//   query GetMessages($conversationId: ID!, $limit: Int, $nextToken: String) {
//     getMessages(conversationId: $conversationId, limit: $limit, nextToken: $nextToken) {
//       items {
//         messageId
//         from
//         content
//         type
//         sentAt
//       }
//       nextToken
//     }
//   }
// `;
//
// const SEND_MESSAGE_MUTATION = gql`
//   mutation SendMessage($conversationId: ID!, $content: String!) {
//     sendMessage(conversationId: $conversationId, content: $content) {
//       messageId
//       from
//       content
//       type
//       sentAt
//     }
//   }
// `;
//
// // --- Service Object ---
// export const chatService = {
//   getChatConversations: async (): Promise<ChatConversation[]> => {
//     const { data } = await apolloClient.query({
//       query: GET_CONVERSATIONS_QUERY,
//       fetchPolicy: 'network-only',
//     });
//     // Filter out the mood tracker so we only see actual "human" chats
//     return data.getConversations.items.filter(
//       (chat: any) => !chat.participantIds.includes('moodtracker'),
//     );
//   },
//
//   getChatMessages: async (conversationId: string): Promise<ChatMessage[]> => {
//     const { data } = await apolloClient.query({
//       query: GET_MESSAGES_QUERY,
//       variables: { conversationId },
//       fetchPolicy: 'network-only',
//     });
//     // Sort messages by time so the newest are at the bottom
//     return data.getMessages.items.toSorted((a: ChatMessage, b: ChatMessage) => a.sentAt - b.sentAt);
//   },
//
//   sendChatMessage: async (conversationId: string, content: string): Promise<ChatMessage> => {
//     const { data } = await apolloClient.mutate({
//       mutation: SEND_MESSAGE_MUTATION,
//       variables: { conversationId, content },
//     });
//     return data.sendMessage;
//   },
// };

// --- Demo Service Object (portfolio mode — serves src/mocks data, no network) --- //

const toConversation = (conversation: (typeof db.conversations)[number]): ChatConversation => {
  const history = db.messages[conversation.conversationId] ?? [];
  const last = history[history.length - 1];
  return {
    conversationId: conversation.conversationId,
    participantIds: conversation.participantIds,
    lastMessage: last?.content,
    lastMessageFrom: last?.from,
    lastMessageAt: last?.sentAt,
    createdAt: conversation.createdAt,
  };
};

export const chatService = {
  getChatConversations: async (): Promise<ChatConversation[]> => {
    const userId = getCurrentUserId();
    return respond(
      db.conversations.filter((c) => c.participantIds.includes(userId)).map(toConversation),
    );
  },

  getChatMessages: async (conversationId: string): Promise<ChatMessage[]> =>
    respond([...(db.messages[conversationId] ?? [])].sort((a, b) => a.sentAt - b.sentAt)),

  sendChatMessage: async (conversationId: string, content: string): Promise<ChatMessage> => {
    const from = getCurrentUserId();
    const history = (db.messages[conversationId] ??= []);
    const message: ChatMessage = {
      messageId: `${conversationId}-message-${history.length + 1}-${Date.now()}`,
      conversationId,
      from,
      content,
      type: 'text',
      sentAt: Date.now(),
    };
    history.push(message);

    // Like the real backend: the other participant gets an unread-message notification.
    const recipientId = db.conversations
      .find((c) => c.conversationId === conversationId)
      ?.participantIds.find((id) => id !== from);
    if (recipientId) {
      const inbox = (db.notifications[recipientId] ??= []);
      const existing = inbox.find((n) => n.type === 'new_message' && n.conversationId === conversationId);
      if (existing) {
        existing.count = (existing.count ?? 0) + 1;
        existing.updatedAt = new Date().toISOString();
      } else {
        inbox.push({
          recipientId,
          sk: `new_message#${conversationId}`,
          type: 'new_message',
          conversationId,
          count: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    notifyDemoStoreChanged();
    return respond(message, 300);
  },
};
