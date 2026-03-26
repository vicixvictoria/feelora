import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';

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

// --- GraphQL Queries & Mutations ---
const GET_CONVERSATIONS_QUERY = gql`
  query GetConversations($limit: Int, $nextToken: String) {
    getConversations(limit: $limit, nextToken: $nextToken) {
      items {
        conversationId
        participantIds
        lastMessage
        lastMessageFrom
        lastMessageAt
        createdAt
      }
      nextToken
    }
  }
`;

const GET_MESSAGES_QUERY = gql`
  query GetMessages($conversationId: ID!, $limit: Int, $nextToken: String) {
    getMessages(conversationId: $conversationId, limit: $limit, nextToken: $nextToken) {
      items {
        messageId
        from
        content
        type
        sentAt
      }
      nextToken
    }
  }
`;

const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($conversationId: ID!, $content: String!) {
    sendMessage(conversationId: $conversationId, content: $content) {
      messageId
      from
      content
      type
      sentAt
    }
  }
`;

// --- Service Object ---
export const chatService = {
  getChatConversations: async (): Promise<ChatConversation[]> => {
    const { data } = await apolloClient.query({
      query: GET_CONVERSATIONS_QUERY,
      fetchPolicy: 'network-only',
    });
    // Filter out the mood tracker so we only see actual "human" chats
    return data.getConversations.items.filter(
      (chat: any) => !chat.participantIds.includes('moodtracker'),
    );
  },

  getChatMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    const { data } = await apolloClient.query({
      query: GET_MESSAGES_QUERY,
      variables: { conversationId },
      fetchPolicy: 'network-only',
    });
    // Sort messages by time so the newest are at the bottom
    return data.getMessages.items.toSorted((a: ChatMessage, b: ChatMessage) => a.sentAt - b.sentAt);
  },

  sendChatMessage: async (conversationId: string, content: string): Promise<ChatMessage> => {
    const { data } = await apolloClient.mutate({
      mutation: SEND_MESSAGE_MUTATION,
      variables: { conversationId, content },
    });
    return data.sendMessage;
  },
};
