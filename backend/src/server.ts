import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import bodyParser from 'body-parser';
import { OpenAI } from 'openai';

// ---------- Configs ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

type OrderStatus = 'queued' | 'in_progress' | 'ready' | 'served' | 'cancelled';

interface Order {
  id: number;
  table_id: number;
  items: string[];
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
  notes?: string;
}

// ---------- Loads Menu Data ----------
const menu = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../data/menu.json'), 'utf-8')
);

let orders: Order[] = [];
let nextOrderId = 1;

// ---------- Creates HTTP + Socket.IO Server ----------
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });

function broadcastOrders() {
  io.emit('orders_updated', orders);
}

// ---------- MCP Tool Implementations ----------
function search_menu({ query }: { query: string }) {
  const q = (query || '').toLowerCase();
  const results = menu.filter(
    (m: any) =>
      m.name.toLowerCase().includes(q) ||
      m.ingredients.join(' ').toLowerCase().includes(q)
  );
  return { results };
}

function create_orders({ table_id, items }: { table_id: number; items: string[] }): Order {
  if (!table_id || !Array.isArray(items) || items.length === 0)
    throw new Error('table_id and items[] are required');

  const order: Order = {
    id: nextOrderId++,
    table_id: Number(table_id),
    items: [...items],
    status: 'queued',
    created_at: new Date().toISOString(),
  };
  orders.push(order);
  broadcastOrders();
  return order;
}

function modify_orders({
  order_id,
  add_items = [],
  remove_items = [],
  notes,
}: {
  order_id: number;
  add_items?: string[];
  remove_items?: string[];
  notes?: string;
}): Order {
  const order = orders.find((o) => o.id === Number(order_id));
  if (!order) throw new Error('Order not found');

  order.items = [...order.items, ...add_items].filter(
    (i) => !remove_items.includes(i)
  );
  if (notes) order.notes = notes;
  order.updated_at = new Date().toISOString();
  broadcastOrders();
  return order;
}

function cancel_orders({ order_id }: { order_id: number }) {
  const idx = orders.findIndex((o) => o.id === Number(order_id));
  if (idx === -1) throw new Error('Order not found');
  const [removed] = orders.splice(idx, 1);
  broadcastOrders();
  return { cancelled: true, order: removed };
}

function update_order_status({
  order_id,
  status,
}: {
  order_id: number;
  status: OrderStatus;
}): Order {
  const order = orders.find((o) => o.id === Number(order_id));
  if (!order) throw new Error('Order not found');

  const valid: OrderStatus[] = ['queued', 'in_progress', 'ready', 'served', 'cancelled'];
  if (!valid.includes(status)) throw new Error('Invalid status');

  order.status = status;
  order.updated_at = new Date().toISOString();
  broadcastOrders();
  return order;
}

// ---------- REST APIs ----------
app.get('/api/menu', (_req: Request, res: Response) => res.json(menu));
app.get('/api/orders', (_req: Request, res: Response) => res.json(orders));

app.post('/api/orders', (req: Request, res: Response) => {
  try {
    res.json(create_orders(req.body));
  } catch (e: any) {
    res.status(400).json({ error: String(e.message || e) });
  }
});

app.put('/api/orders/:id', (req: Request, res: Response) => {
  try {
    res.json(modify_orders({ order_id: Number(req.params.id), ...req.body }));
  } catch (e: any) {
    res.status(400).json({ error: String(e.message || e) });
  }
});

app.delete('/api/orders/:id', (req: Request, res: Response) => {
  try {
    res.json(cancel_orders({ order_id: Number(req.params.id) }));
  } catch (e: any) {
    res.status(400).json({ error: String(e.message || e) });
  }
});

app.post('/api/orders/:id/status', (req: Request, res: Response) => {
  try {
    res.json(
      update_order_status({ order_id: Number(req.params.id), status: req.body.status })
    );
  } catch (e: any) {
    res.status(400).json({ error: String(e.message || e) });
  }
});

// ---------- AI Assistant Endpoint ----------
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const toolsForOpenAI = [
  {
    type: 'function',
    function: {
      name: 'search_menu',
      description: 'Search for menu items by name or ingredient',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string' } },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_orders',
      description: 'Create a new order',
      parameters: {
        type: 'object',
        properties: {
          table_id: { type: 'number' },
          items: { type: 'array', items: { type: 'string' } },
        },
        required: ['table_id', 'items'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'modify_orders',
      description: 'Modify an existing order',
      parameters: {
        type: 'object',
        properties: {
          order_id: { type: 'number' },
          add_items: { type: 'array', items: { type: 'string' } },
          remove_items: { type: 'array', items: { type: 'string' } },
          notes: { type: 'string' },
        },
        required: ['order_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'cancel_orders',
      description: 'Cancel an order',
      parameters: {
        type: 'object',
        properties: { order_id: { type: 'number' } },
        required: ['order_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_order_status',
      description: 'Update order status',
      parameters: {
        type: 'object',
        properties: {
          order_id: { type: 'number' },
          status: {
            type: 'string',
            enum: ['queued', 'in_progress', 'ready', 'served', 'cancelled'],
          },
        },
        required: ['order_id', 'status'],
      },
    },
  },
];

const toolExec: Record<string, Function> = {
  search_menu,
  create_orders,
  modify_orders,
  cancel_orders,
  update_order_status,
};

// ---------- POST /assistant ----------
app.post('/assistant', async (req: Request, res: Response) => {
  const { message, table_id } = req.body as { message: string; table_id?: number };

  if (!openai) {
    return res.json({
      reply: `I heard: "${message}".`,
    });
  }

  const system = `You are a helpful restaurant assistant.`;

  try {
    const first = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: message },
      ],
      tools: toolsForOpenAI,
      tool_choice: 'auto',
    });

    const firstMsg: any = first.choices[0].message;
    if (firstMsg.tool_calls?.length) {
      const toolMessages: any[] = [];

      for (const call of firstMsg.tool_calls) {
        const { name, arguments: argsJson } = call.function;
        const args = JSON.parse(argsJson || '{}');
        if (name === 'create_orders' && args.table_id == null && table_id != null)
          args.table_id = table_id;

        let result: any;
        try {
          result = toolExec[name](args);
        } catch (e: any) {
          result = { error: e.message || String(e) };
        }

        toolMessages.push({
          role: 'tool',
          tool_call_id: call.id,
          name,
          content: JSON.stringify(result, null, 2),
        });
      }

      const second = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: message },
          firstMsg,
          ...toolMessages,
        ],
      });

      return res.json({ reply: second.choices[0].message.content });
    }

    return res.json({ reply: firstMsg.content });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Assistant error', detail: String(err.message || err) });
  }
});

// ---------- MCP Tool Registry ----------
app.get('/mcp/tools', (_req, res) => {
  res.json({
    tools: Object.keys(toolExec).map((name) => ({
      name,
      description: `Tool for ${name}`,
    })),
  });
});

app.post('/mcp/call', (req, res) => {
  const { name, args } = req.body || {};
  const fn = toolExec[name];
  if (!fn) return res.status(404).json({ error: `No such tool: ${name}` });

  try {
    const result = fn(args || {});
    res.json({ ok: true, result });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: String(e.message || e) });
  }
});

// ---------- WebSocket Events ----------
io.on('connection', (socket) => {
  socket.emit('orders_updated', orders);
});

// ---------- Starts Server ----------
server.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
  console.log(`→ Assistant: POST /assistant`);
  console.log(`→ REST:      /api/orders | /api/menu`);
  console.log(`→ MCP:       GET /mcp/tools | POST /mcp/call`);
});
