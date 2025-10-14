export type OrderStatus = 'queued' | 'in_progress' | 'ready' | 'served' | 'cancelled';

export interface Order {
  id: number;
  table_id: number;
  items: string[];
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
  notes?: string;
}
