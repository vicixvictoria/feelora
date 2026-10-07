import { notificationService } from '@/features/notifications/api/notification-service';
import { createContext, useContext, useEffect, useState } from 'react';
// import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

interface WebsocketContextType {
  websocket: any;
  messages: WebsocketNotification[];
  connected: boolean;
  nextToken?: string | null;
}

interface NotificationData {
  recipientId?: string;
  sk?: string;
  type?: string;
  conversationId?: string;
  count?: number;
  senderName?: string;
  matchedId?: string;
  unmatchedId?: string;
  createdAt?: string;
  updatedAt?: string;
  bookingId?: string;
  homeworkId?: string;
}

interface WebsocketNotification {
  type: string;
  data: NotificationData;
}

const WebsocketContext = createContext<WebsocketContextType | undefined>(undefined);

export function WebsocketProvider({ children }: { children: React.ReactNode }) {
  // PORTFOLIO DEMO MODE: the websocket backend is offline. The token request,
  // socket connection and reconnect logic are commented out below (not
  // deleted); notifications still load once on login from the demo
  // notificationService, the live push channel just stays disconnected.
//   const [websocket, setWebsocket] = useState<any>(null);
  const [websocket] = useState<any>(null);
//   const websocketRef = useRef<WebSocket | null>(null);
//   const [websocketToken, setWebsocketToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<WebsocketNotification[]>([]);
  const [nextToken, setNextToken] = useState<string | null | undefined>(null);
  let isWebsocketConnected = websocket?.readyState === WebSocket.OPEN;

  const { isAuthenticated } = useAuth();

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    const notifications = await notificationService.getNotifications({
      limit: 50,
      nextToken: undefined,
    });
    console.log(`[WS] Initial notifications fetched:`, notifications);

    const normalizedNotifications: WebsocketNotification[] = notifications.notifications.map(
      (notification: NotificationData) => ({
        type: 'notification',
        data: notification,
      }),
    );

    setMessages((prevMessages) => [...prevMessages, ...normalizedNotifications]);
    setNextToken(notifications.nextToken);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      // Demo logout stays in-app (no Cognito redirect/reload), so drop the
      // previous demo user's notifications before the next one logs in.
      setMessages([]);
    }
  }, [isAuthenticated]);

//   const getWebsocketToken = async () => {
//     if (!isAuthenticated) return;
//     let now = new Date().getTime();
//
//     // notificationService is used to avoid method duplication (same logic for therapists)
//     const newWebsocketToken = await notificationService.generateWebsocketToken();
//
//     //! Testing log for performance
//     console.log(`[WS] New Websocket Token, took ${new Date().getTime() - now}ms`);
//
//     setWebsocketToken(newWebsocketToken);
//   };
//
//   const connectWebsocket = () => {
//     if (!websocketToken) return;
//
//     let now = Date.now();
//
//     const ws = new WebSocket(
//       `${import.meta.env.VITE_WEBSOCKET_API_URL}?token=${websocketToken}`,
//     );
//
//     websocketRef.current = ws;
//     setWebsocket(ws);
//
//     ws.onopen = () => {
//       console.log(`[WS] Connected, took ${Date.now() - now}ms`);
//       setWebsocket(ws);
//     };
//
//     ws.onmessage = (event) => {
//       console.log('[WS] Message', event.data);
//       setMessages((prev) => [...prev, JSON.parse(event.data)]);
//     };
//
//     ws.onclose = () => {
//       console.log('[WS] Closed');
//
//       websocketRef.current = null;
//       setWebsocket(null);
//     };
//
//     ws.onerror = () => {
//       console.log('[WS] Error');
//       ws.close();
//     };
//   };
//
//   const ensureWebsocketAlive = async () => {
//     const ws = websocketRef.current;
//
//     if (!ws) {
//       console.log('[WS] Missing websocket, reconnecting...');
//
//       await getWebsocketToken();
//       return;
//     }
//
//     if (ws.readyState !== WebSocket.OPEN) {
//       console.log('[WS] Dead websocket, reconnecting...');
//       try {
//         ws.close();
//       } catch {}
//       await getWebsocketToken();
//     }
//   };
//
//   useEffect(() => {
//     if (!isAuthenticated) return;
//
//     if (!websocketToken) {
//       getWebsocketToken();
//       return;
//     }
//
//     if (!websocket || websocket.readyState === WebSocket.CLOSED || websocket.readyState === WebSocket.CLOSING) {
//       connectWebsocket();
//     }
//   }, [isAuthenticated, websocketToken]);
//
//   useEffect(() => {
//     const handleVisibility = () => {
//       if (document.visibilityState === 'visible') {
//         console.log('[WS] Tab became visible');
//         ensureWebsocketAlive();
//       }
//     };
//
//     document.addEventListener('visibilitychange', handleVisibility);
//
//     return () => {
//       document.removeEventListener('visibilitychange', handleVisibility);
//     };
//   }, [websocket]);
//
//   useEffect(() => {
//     let inactivityTimer: ReturnType<typeof setTimeout>;
//     let wasIdle = false;
//
//     const markActivity = () => {
//       clearTimeout(inactivityTimer);
//
//       if (wasIdle) {
//         console.log('[WS] User became active again');
//         ensureWebsocketAlive();
//         wasIdle = false;
//       }
//
//       inactivityTimer = setTimeout(() => {
//         wasIdle = true;
//         console.log('[WS] User idle');
//       }, 60000); // 1 minute
//     };
//
//     window.addEventListener('mousemove', markActivity);
//     window.addEventListener('keydown', markActivity);
//     window.addEventListener('click', markActivity);
//     window.addEventListener('scroll', markActivity);
//
//     markActivity();
//
//     return () => {
//       clearTimeout(inactivityTimer);
//
//       window.removeEventListener('mousemove', markActivity);
//       window.removeEventListener('keydown', markActivity);
//       window.removeEventListener('click', markActivity);
//       window.removeEventListener('scroll', markActivity);
//     };
//   }, [websocket]);

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
