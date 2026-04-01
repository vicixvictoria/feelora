import { notificationService } from '@/features/notifications/api/notification-service';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface WebsocketContextType {
  websocket: any;
  messages: string[];
  connected: boolean;
  nextToken?: string | null;
}

const WebsocketContext = createContext<WebsocketContextType | undefined>(undefined);

export function WebsocketProvider({ children }: { children: React.ReactNode }) {
  const [websocket, setWebsocket] = useState<any>(null);
  const [websocketToken, setWebsocketToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [nextToken, setNextToken] = useState<string | null | undefined>(null);
  let isWebsocketConnected = websocket != null;

  const { isAuthenticated } = useAuth();

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    const notifications = await notificationService.getNotifications({
      limit: 50,
      nextToken: undefined,
    });
    console.log(`[WS] Initial notifications fetched:`, notifications);

    setMessages((prevMessages) => [...prevMessages, ...notifications.notifications]);
    setNextToken(notifications.nextToken);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const getWebsocketToken = async () => {
    if (!isAuthenticated) return;
    let now = new Date().getTime();

    // notificationService is used to avoid method duplication (same logic for therapists)
    const newWebsocketToken = await notificationService.generateWebsocketToken();

    //! Testing log for performance
    console.log(`[WS] New Websocket Token, took ${new Date().getTime() - now}ms`);

    setWebsocketToken(newWebsocketToken);
  };

  useEffect(() => {
    if (!websocketToken) {
      if (websocket != null) setWebsocket(null);
      getWebsocketToken();
    } else if (websocket === null) {
      let now = Date.now();
      let newWebsocket = new WebSocket(
        `${import.meta.env.VITE_WEBSOCKET_API_URL}?token=${websocketToken}`,
      );
      setWebsocket(newWebsocket);

      //! Testing logs for performance (do not delete the setMessages line)
      newWebsocket.onopen = () =>
        console.log(`[WS] Connected to WebSocket server, took ${Date.now() - now}ms`);
      newWebsocket.onmessage = (event: any) => {
        console.log(`[WS] Received message from WebSocket server`, event.data);
        setMessages((prevMessages) => [...prevMessages, JSON.parse(event.data)]);
      };
      newWebsocket.onclose = () =>
        console.log(`[WS] Disconnected from WebSocket server, took ${Date.now() - now}ms`);
    }
  }, [isAuthenticated, websocket, websocketToken]);

  return (
    <WebsocketContext.Provider
      value={{ websocket, messages, connected: isWebsocketConnected, nextToken }}
    >
      {children}
    </WebsocketContext.Provider>
  );
}

export function useWebsocket() {
  const context = useContext(WebsocketContext);
  if (context === undefined) {
    throw new Error('useWebsocket must be used within a WebsocketProvider');
  }
  return context;
}
