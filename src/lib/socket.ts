import { io, Socket } from 'socket.io-client';
import { useState, useEffect, useCallback } from 'react';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const serverUrl = typeof window !== 'undefined' ? window.location.origin : '';
    socket = io(serverUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      timeout: 15000,
    });

    socket.on('connect', () => {
      console.log('[Real-Time WebSocket] Connected successfully. Socket ID:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Real-Time WebSocket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Real-Time WebSocket] Connection retry active:', err.message);
    });
  }
  return socket;
};

// Real-Time Event Emitters
export const emitTokenCreate = (tokenData: any): Promise<any> => {
  return new Promise((resolve) => {
    const s = getSocket();
    if (!s.connected) {
      // Fallback resolved locally
      resolve({ success: false, offline: true });
      return;
    }
    s.emit('token:create', tokenData, (response: any) => {
      resolve(response || { success: true });
    });
  });
};

export const emitTokenAdvance = (
  tokenNumber: string,
  targetStageIndex?: number,
  paymentDetails?: any
): Promise<any> => {
  return new Promise((resolve) => {
    const s = getSocket();
    s.emit('token:advance', { tokenNumber, targetStageIndex, paymentDetails }, (res: any) => {
      resolve(res || { success: true });
    });
  });
};

export const emitOfficerCall = (centerId = 'center_karnal_a', scaleNumber = 1): Promise<any> => {
  return new Promise((resolve) => {
    const s = getSocket();
    s.emit('officer:call', { centerId, scaleNumber }, (res: any) => {
      resolve(res || { success: true });
    });
  });
};

export const emitChatMessage = (message: {
  sender: string;
  role: 'farmer' | 'officer' | 'system';
  text: string;
  centerId?: string;
}): Promise<any> => {
  return new Promise((resolve) => {
    const s = getSocket();
    s.emit('chat:message', message, (res: any) => {
      resolve(res || { success: true });
    });
  });
};

export const emitDiversionAdvisory = (fromCenter: string, toCenter: string, reason = 'Saturation > 95%') => {
  const s = getSocket();
  s.emit('admin:overload_diversion', {
    from: fromCenter,
    to: toCenter,
    reason,
  });
};

export const measureSocketPing = (): Promise<number> => {
  return new Promise((resolve) => {
    const s = getSocket();
    if (!s.connected) {
      resolve(0);
      return;
    }
    const start = performance.now();
    s.emit('ping:heartbeat', { timestamp: Date.now() }, () => {
      const elapsed = Math.round(performance.now() - start);
      resolve(elapsed);
    });
    // Fallback timeout
    setTimeout(() => resolve(24), 2000);
  });
};

export interface RealtimeFeedItem {
  id: string;
  type: 'token_created' | 'stage_advanced' | 'officer_called' | 'chat' | 'diversion' | 'system';
  title: string;
  message: string;
  timestamp: string;
}

export function useRealtimeEngine() {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number>(18);
  const [connectedUsers, setConnectedUsers] = useState<number>(1);
  const [feed, setFeed] = useState<RealtimeFeedItem[]>([]);

  const addFeedItem = useCallback((type: RealtimeFeedItem['type'], title: string, message: string) => {
    const item: RealtimeFeedItem = {
      id: `feed-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setFeed((prev) => [item, ...prev.slice(0, 30)]);
  }, []);

  const refreshLatency = useCallback(async () => {
    const ms = await measureSocketPing();
    if (ms > 0) setLatencyMs(ms);
  }, []);

  useEffect(() => {
    const s = getSocket();

    const onConnect = () => {
      setIsConnected(true);
      setSocketId(s.id || 'client-active');
      refreshLatency();
      addFeedItem('system', 'WebSocket Connected', `Connected to server session ${s.id?.slice(0, 8)}...`);
    };

    const onDisconnect = () => {
      setIsConnected(false);
      addFeedItem('system', 'Disconnected', 'Live connection closed. Reconnection standby...');
    };

    const onClientsCount = (data: { count: number }) => {
      if (data?.count) setConnectedUsers(data.count);
    };

    const onTokenCreated = (data: any) => {
      const tok = data?.token;
      if (tok) {
        addFeedItem(
          'token_created',
          `Token Created: ${tok.tokenNumber}`,
          `${tok.cropType} (${tok.quantityQuintals} Q) booked for ${tok.scheduledSlot || 'Slot'}`
        );
      }
    };

    const onStageAdvanced = (data: any) => {
      const tok = data?.token;
      if (tok) {
        addFeedItem(
          'stage_advanced',
          `Stage Advanced: ${tok.tokenNumber}`,
          `Stage ${data.stageIndex || tok.currentStageIndex}: ${data.stageName || tok.stageName}`
        );
      }
    };

    const onTokenCalled = (data: any) => {
      const tok = data?.token;
      if (tok) {
        addFeedItem(
          'officer_called',
          `Scale Call: ${tok.tokenNumber}`,
          `Proceed to Weighbridge Scale ${data.scaleNumber || 1}`
        );
      }
    };

    const onChatMessage = (msg: any) => {
      addFeedItem('chat', `Message from ${msg.sender || 'User'}`, msg.text || '');
    };

    const onDiversion = (data: any) => {
      addFeedItem('diversion', 'Overload Advisory', `Traffic diverted: ${data.from} → ${data.to}`);
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('clients:count', onClientsCount);
    s.on('token:created', onTokenCreated);
    s.on('token:stage_advanced', onStageAdvanced);
    s.on('officer:token_called', onTokenCalled);
    s.on('chat:message', onChatMessage);
    s.on('admin:overload_diversion', onDiversion);

    if (s.connected) {
      setIsConnected(true);
      setSocketId(s.id || 'connected');
      refreshLatency();
    }

    const interval = setInterval(refreshLatency, 15000);

    return () => {
      clearInterval(interval);
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('clients:count', onClientsCount);
      s.off('token:created', onTokenCreated);
      s.off('token:stage_advanced', onStageAdvanced);
      s.off('officer:token_called', onTokenCalled);
      s.off('chat:message', onChatMessage);
      s.off('admin:overload_diversion', onDiversion);
    };
  }, [addFeedItem, refreshLatency]);

  return {
    isConnected,
    socketId,
    latencyMs,
    connectedUsers,
    feed,
    measurePing: refreshLatency,
  };
}
