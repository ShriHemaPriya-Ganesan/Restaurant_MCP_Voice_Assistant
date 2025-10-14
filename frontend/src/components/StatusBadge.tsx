import React from 'react';
import { OrderStatus } from '../types';

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: 999,
      border: '1px solid #ccc',
      background: '#f6f6f6',
      fontSize: 12
    }}
  >
    {status.replace('_', ' ')}
  </span>
);
export default StatusBadge;
