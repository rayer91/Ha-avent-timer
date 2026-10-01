import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || process.env.INGRESS_PORT || 3000);
const isProd = process.env.NODE_ENV === 'production';

// Home Assistant Supervisor API credentials automatically injected by Supervisor
const SUPERVISOR_TOKEN = process.env.SUPERVISOR_TOKEN || process.env.HASSIO_TOKEN || '';
const SUPERVISOR_URL = process.env.SUPERVISOR_URL || 'http://supervisor';

/**
 * Endpoint to check if the app is currently running as a Home Assistant Add-on
 */
app.get('/api/ha/status', async (_req, res) => {
  const hasToken = Boolean(SUPERVISOR_TOKEN);
  let supervisorOnline = false;

  if (hasToken) {
    try {
      const resp = await fetch(`${SUPERVISOR_URL}/core/api/`, {
        headers: {
          Authorization: `Bearer ${SUPERVISOR_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
      supervisorOnline = resp.ok;
    } catch {
      supervisorOnline = false;
    }
  }

  res.json({
    inHomeAssistant: hasToken,
    supervisorOnline,
    supervisorUrl: SUPERVISOR_URL,
  });
});

/**
 * Fetch all available switch entities directly from Home Assistant
 * No webhook or token configuration needed by user!
 */
app.get('/api/ha/switches', async (_req, res) => {
  if (!SUPERVISOR_TOKEN) {
    return res.json({
      success: false,
      error: 'Not running inside Home Assistant Add-on environment (no SUPERVISOR_TOKEN)',
      entities: [],
    });
  }

  try {
    const response = await fetch(`${SUPERVISOR_URL}/core/api/states`, {
      headers: {
        Authorization: `Bearer ${SUPERVISOR_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `Supervisor API returned status ${response.status}`,
        entities: [],
      });
    }

    const states = await response.json();
    // Filter only switch entities (e.g. switch.tapo_p100, switch.cumisuveg_melegito)
    const switches = (states as any[])
      .filter((entity) => entity.entity_id.startsWith('switch.'))
      .map((entity) => ({
        entity_id: entity.entity_id,
        name: entity.attributes?.friendly_name || entity.entity_id,
        state: entity.state, // 'on' | 'off' | 'unavailable'
      }))
      .sort((a, b) => {
        // Prioritize Tapo switches first in sorting
        const aTapo = a.name.toLowerCase().includes('tapo') || a.entity_id.includes('tapo');
        const bTapo = b.name.toLowerCase().includes('tapo') || b.entity_id.includes('tapo');
        if (aTapo && !bTapo) return -1;
        if (!aTapo && bTapo) return 1;
        return a.name.localeCompare(b.name);
      });

    res.json({
      success: true,
      entities: switches,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to communicate with Home Assistant Core API',
      entities: [],
    });
  }
});

/**
 * Directly turn ON a switch in Home Assistant
 */
app.post('/api/ha/switch/turn_on', async (req, res) => {
  const { entity_id } = req.body;
  if (!entity_id) {
    return res.status(400).json({ success: false, error: 'entity_id is required' });
  }

  if (!SUPERVISOR_TOKEN) {
    return res.status(400).json({ success: false, error: 'SUPERVISOR_TOKEN not present' });
  }

  try {
    const response = await fetch(`${SUPERVISOR_URL}/core/api/services/switch/turn_on`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPERVISOR_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entity_id }),
    });

    res.json({ success: response.ok, status: response.status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

/**
 * Directly turn OFF a switch in Home Assistant
 */
app.post('/api/ha/switch/turn_off', async (req, res) => {
  const { entity_id } = req.body;
  if (!entity_id) {
    return res.status(400).json({ success: false, error: 'entity_id is required' });
  }

  if (!SUPERVISOR_TOKEN) {
    return res.status(400).json({ success: false, error: 'SUPERVISOR_TOKEN not present' });
  }

  try {
    const response = await fetch(`${SUPERVISOR_URL}/core/api/services/switch/turn_off`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPERVISOR_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entity_id }),
    });

    res.json({ success: response.ok, status: response.status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

/**
 * Send Home Assistant push notification
 */
app.post('/api/ha/notify', async (req, res) => {
  const { title, message } = req.body;
  if (!SUPERVISOR_TOKEN) {
    return res.status(400).json({ success: false, error: 'SUPERVISOR_TOKEN not present' });
  }

  try {
    const response = await fetch(`${SUPERVISOR_URL}/core/api/services/notify/notify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPERVISOR_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, message }),
    });

    res.json({ success: response.ok });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

async function startServer() {
  if (!isProd) {
    // Development mode with Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode serving built assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
