import { io, Socket } from 'socket.io-client';
import { SniperooPositionDTO, SniperooOrderDTO } from '@solana-trading-crm/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(SOCKET_URL, {
          auth: {
            token,
          },
          reconnection: true,
          reconnectionDelay: this.reconnectDelay,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: this.maxReconnectAttempts,
        });

        this.socket.on('connect', () => {
          console.log('Socket connected');
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          reject(error);
        });

        this.socket.on('disconnect', () => {
          console.log('Socket disconnected');
        });

        this.socket.on('reconnect_attempt', () => {
          this.reconnectAttempts++;
          console.log(`Reconnection attempt ${this.reconnectAttempts}`);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribePositions(walletId?: string): void {
    if (this.socket) {
      this.socket.emit('subscribe:positions', { walletId });
    }
  }

  unsubscribePositions(walletId?: string): void {
    if (this.socket) {
      this.socket.emit('unsubscribe:positions', { walletId });
    }
  }

  subscribeOrders(walletId?: string): void {
    if (this.socket) {
      this.socket.emit('subscribe:orders', { walletId });
    }
  }

  unsubscribeOrders(walletId?: string): void {
    if (this.socket) {
      this.socket.emit('unsubscribe:orders', { walletId });
    }
  }

  onPositionCreated(callback: (position: SniperooPositionDTO) => void): void {
    if (this.socket) {
      this.socket.on('position:created', callback);
    }
  }

  onPositionUpdated(callback: (position: SniperooPositionDTO) => void): void {
    if (this.socket) {
      this.socket.on('position:updated', callback);
    }
  }

  onPositionClosed(callback: (position: SniperooPositionDTO) => void): void {
    if (this.socket) {
      this.socket.on('position:closed', callback);
    }
  }

  onOrderExecuted(callback: (order: SniperooOrderDTO) => void): void {
    if (this.socket) {
      this.socket.on('order:executed', callback);
    }
  }

  onOrderFailed(callback: (order: SniperooOrderDTO) => void): void {
    if (this.socket) {
      this.socket.on('order:failed', callback);
    }
  }

  offPositionCreated(callback: (position: SniperooPositionDTO) => void): void {
    if (this.socket) {
      this.socket.off('position:created', callback);
    }
  }

  offPositionUpdated(callback: (position: SniperooPositionDTO) => void): void {
    if (this.socket) {
      this.socket.off('position:updated', callback);
    }
  }

  offPositionClosed(callback: (position: SniperooPositionDTO) => void): void {
    if (this.socket) {
      this.socket.off('position:closed', callback);
    }
  }

  offOrderExecuted(callback: (order: SniperooOrderDTO) => void): void {
    if (this.socket) {
      this.socket.off('order:executed', callback);
    }
  }

  offOrderFailed(callback: (order: SniperooOrderDTO) => void): void {
    if (this.socket) {
      this.socket.off('order:failed', callback);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
