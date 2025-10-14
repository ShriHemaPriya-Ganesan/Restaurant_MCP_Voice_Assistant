import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Order } from '../types';

export function useSocket() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const socket: Socket = io();
    socket.on('orders_updated', (data: Order[]) => setOrders(data));
    return () => {
      socket.off('orders_updated');
      socket.disconnect();
    };
  }, []);

  return orders;
}
