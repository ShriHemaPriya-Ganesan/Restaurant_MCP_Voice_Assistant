import React from 'react';
import { useSocket } from '../hooks/useSocket';
import { Order, OrderStatus } from '../types';
import StatusBadge from './StatusBadge';

export default function KitchenBoard() {
  const orders = useSocket();

  async function setStatus(id: number, status: OrderStatus) {
    await fetch(`/api/orders/${id}/status`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  }

  return (
    <div>
      <h2>Kitchen Display</h2>
      <p style={{ color: '#666' }}>Orders update in real time.</p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 12
      }}>
        {orders.sort((a,b) => a.id - b.id).map((o: Order) => (
          <div key={o.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
            <div><strong>#{o.id}</strong> • Table {o.table_id} <StatusBadge status={o.status} /></div>
            <ul style={{ marginTop: 8 }}>
              {o.items.map((i, idx) => <li key={idx}>{i}</li>)}
            </ul>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {(['queued','in_progress','ready','served','cancelled'] as OrderStatus[]).map(s => (
                <button key={s} onClick={() => setStatus(o.id, s)}>
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 6 }}>
              {new Date(o.updated_at || o.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
