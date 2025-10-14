import { useEffect, useState } from 'react';
import { Order, OrderStatus } from '../types';
import StatusBadge from './StatusBadge';
import { useSocket } from '../hooks/useSocket';
import './OrdersTable.css';

export default function OrdersTable() {
  const liveOrders = useSocket();
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => setOrders(liveOrders), [liveOrders]);

  async function create(table_id: number, items: string[]) {
    await fetch('/api/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table_id, items })
    });
  }
  async function changeStatus(id: number, status: OrderStatus) {
    await fetch(`/api/orders/${id}/status`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  }
  async function addItem(id: number) {
    const item = prompt('Add which item?');
    if (!item) return;
    await fetch(`/api/orders/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ add_items: [item] })
    });
  }
  async function removeItem(id: number) {
    const item = prompt('Remove which item (exact name)?');
    if (!item) return;
    await fetch(`/api/orders/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remove_items: [item] })
    });
  }
  async function cancel(id: number) {
    await fetch(`/api/orders/${id}`, { method: 'DELETE' });
  }

  const [t, setT] = useState<number | ''>('');
  const [itemsCSV, setItemsCSV] = useState('');

  return (
    <div>
      <h2>Orders Admin</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input type="number" placeholder="Table ID" value={t} onChange={e => setT(Number(e.target.value))} />
        <input type="text" placeholder="Items (comma separated)" value={itemsCSV} onChange={e => setItemsCSV(e.target.value)} />
        <button onClick={() => {
          if (!t) return alert('Enter table id');
          const list = itemsCSV.split(',').map(s => s.trim()).filter(Boolean);
          if (!list.length) return alert('Enter at least one item');
          create(Number(t), list); setT(''); setItemsCSV('');
        }}>Create Order</button>
      </div>

      <table  className="orders-table">
        <thead>
          <tr><th>ID</th><th>Table</th><th>Items</th><th>Status</th><th>Actions</th><th>Updated</th></tr>
        </thead>
        <tbody> 
          {orders.sort((a,b)=>a.id-b.id).map(o => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.table_id}</td>
              <td>{o.items.map((i,idx) =>
                <span key={idx} style={{ marginRight: 6, padding: '2px 8px', borderRadius: 999, border: '1px solid #ddd' }}>{i}</span>
              )}</td>
              <td>
                <select value={o.status} onChange={e => changeStatus(o.id, e.target.value as OrderStatus)}>
                  {(['queued','in_progress','ready','served','cancelled'] as OrderStatus[]).map(s =>
                    <option key={s} value={s}>{s.replace('_',' ')}</option>
                  )}
                </select>
                &nbsp;<StatusBadge status={o.status} />
              </td>
              <td>
                <button onClick={() => addItem(o.id)}>+ Item</button>
                <button onClick={() => removeItem(o.id)}>- Item</button>
                <button onClick={() => cancel(o.id)}>Cancel</button>
              </td>
              <td>{new Date(o.updated_at || o.created_at).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
