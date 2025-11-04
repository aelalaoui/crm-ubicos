import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SniperooService } from '../sniperoo/sniperoo.service';
import { SniperooPositionDTO, SniperooOrderDTO } from '@solana-trading-crm/types';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/socket.io',
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocketGateway.name);
  private userConnections: Map<string, Set<string>> = new Map();
  private sniperooWebSocketUrl: string;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private sniperooService: SniperooService,
  ) {
    this.sniperooWebSocketUrl =
      this.configService.get<string>('SNIPEROO_WS_URL') || 'wss://ws.sniperoo.app';
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const decoded = this.jwtService.verify(token);
      client.userId = decoded.sub;

      if (client.userId) {
        if (!this.userConnections.has(client.userId)) {
          this.userConnections.set(client.userId, new Set());
        }
        this.userConnections.get(client.userId)?.add(client.id);
        client.join(`user:${client.userId}`);
      }
      this.logger.log(`Client connected: ${client.id} (User: ${client.userId})`);
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const userSockets = this.userConnections.get(client.userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.userConnections.delete(client.userId);
        }
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:positions')
  async handleSubscribePositions(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { walletId?: string },
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    const room = data.walletId ? `positions:${data.walletId}` : `positions:user:${client.userId}`;
    client.join(room);

    try {
      const positions = await this.sniperooService.getPositions(data.walletId);
      return { success: true, positions: positions.positions };
    } catch (error) {
      this.logger.error('Error fetching positions:', error);
      return { error: 'Failed to fetch positions' };
    }
  }

  @SubscribeMessage('subscribe:orders')
  async handleSubscribeOrders(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { walletId?: string },
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    const room = data.walletId ? `orders:${data.walletId}` : `orders:user:${client.userId}`;
    client.join(room);

    try {
      const orders = await this.sniperooService.getOrders(data.walletId);
      return { success: true, orders: orders.orders };
    } catch (error) {
      this.logger.error('Error fetching orders:', error);
      return { error: 'Failed to fetch orders' };
    }
  }

  @SubscribeMessage('unsubscribe:positions')
  handleUnsubscribePositions(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { walletId?: string },
  ) {
    const room = data.walletId ? `positions:${data.walletId}` : `positions:user:${client.userId}`;
    client.leave(room);
    return { success: true };
  }

  @SubscribeMessage('unsubscribe:orders')
  handleUnsubscribeOrders(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { walletId?: string },
  ) {
    const room = data.walletId ? `orders:${data.walletId}` : `orders:user:${client.userId}`;
    client.leave(room);
    return { success: true };
  }

  emitPositionCreated(userId: string, position: SniperooPositionDTO): void {
    this.server.to(`user:${userId}`).emit('position:created', position);
  }

  emitPositionUpdated(userId: string, position: SniperooPositionDTO): void {
    this.server.to(`user:${userId}`).emit('position:updated', position);
  }

  emitPositionClosed(userId: string, position: SniperooPositionDTO): void {
    this.server.to(`user:${userId}`).emit('position:closed', position);
  }

  emitOrderExecuted(userId: string, order: SniperooOrderDTO): void {
    this.server.to(`user:${userId}`).emit('order:executed', order);
  }

  emitOrderFailed(userId: string, order: SniperooOrderDTO): void {
    this.server.to(`user:${userId}`).emit('order:failed', order);
  }
}
