import express from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const cache = new NodeCache({ stdTTL: 7 }); // default cache 7s

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Simple cache helper
async function cachedFetch(key, fn, ttl=7) {
  const val = cache.get(key);
  if (val) return val;
  const res = await fn();
  cache.set(key, res, ttl);
  return res;
}

// Proxy to CoinGecko global
app.get('/api/coingecko/global', async (req, res) => {
  try {
    const data = await cachedFetch('coingecko_global', async () => {
      const r = await axios.get('https://api.coingecko.com/api/v3/global');
      return r.data;
    }, 10);
    res.json({ success: true, data });
  } catch (e) { res.json({ success:false, error: e.toString() }); }
});

// CoinPaprika global
app.get('/api/coinpaprika/global', async (req, res) => {
  try {
    const data = await cachedFetch('coinpaprika_global', async () => {
      const r = await axios.get('https://api.coinpaprika.com/v1/global');
      return r.data;
    }, 10);
    res.json({ success: true, data });
  } catch (e) { res.json({ success:false, error: e.toString() }); }
});

// Coinglass endpoints (requires COINGLASS_KEY)
app.get('/api/coinglass/flow', async (req, res) => {
  try {
    const symbol = (req.query.symbol || '').toUpperCase();
    const key = process.env.COINGLASS_KEY;
    if (!key) return res.status(400).json({ success:false, error:'Missing COINGLASS_KEY in env' });
    const cacheKey = `coinglass_flow_${symbol||'all'}`;
    const data = await cachedFetch(cacheKey, async () => {
      const url = symbol ? `https://open-api.coinglass.com/api/pro/v1/coin/flow?symbol=${symbol}` : 'https://open-api.coinglass.com/api/pro/v1/coins/flow';
      const r = await axios.get(url, { headers:{ 'Accept':'application/json', 'coinglassSecret': key } });
      return r.data;
    }, 12);
    res.json({ success:true, data });
  } catch (e) { res.json({ success:false, error: e.toString() }); }
});

// Fear & Greed (alternative.me)
app.get('/api/fng', async (req, res) => {
  try {
    const data = await cachedFetch('fng', async () => {
      const r = await axios.get('https://api.alternative.me/fng/');
      return r.data;
    }, 60);
    res.json({ success:true, data });
  } catch (e) { res.json({ success:false, error: e.toString() }); }
});

// Altcoin Season (coin-stats)
app.get('/api/altseason', async (req, res) => {
  try {
    const data = await cachedFetch('altseason', async () => {
      const r = await axios.get('https://api.coin-stats.com/v2/ratings/altcoin-season');
      return r.data;
    }, 60);
    res.json({ success:true, data });
  } catch (e) { res.json({ success:false, error: e.toString() }); }
});

// MEXC orderbook proxy (public endpoints)
app.get('/api/mexc/depth', async (req, res) => {
  try {
    const symbol = req.query.symbol;
    if (!symbol) return res.status(400).json({ success:false, error:'Missing symbol param' });
    const cacheKey = `mexc_depth_${symbol}`;
    const data = await cachedFetch(cacheKey, async () => {
      const url = `https://api.mexc.com/api/v3/depth?symbol=${symbol}&limit=5000`;
      const r = await axios.get(url);
      return r.data;
    }, 5); // short TTL for orderbooks
    res.json({ success:true, data });
  } catch (e) { res.json({ success:false, error: e.toString() }); }
});

// Generic proxy (useful for other public endpoints)
app.get('/api/proxy', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ success:false, error:'Missing url param' });
    const data = await cachedFetch(`proxy_${url}`, async () => {
      const r = await axios.get(url);
      return r.data;
    }, 10);
    res.json({ success:true, data });
  } catch (e) { res.json({ success:false, error: e.toString() }); }
});

app.get('/api/health', (req,res) => res.json({ success:true, up:true, env: process.env.NODE_ENV || 'production' }));

// serve index.html for single-page
app.get('*', (req,res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Jarvis HUD backend listening on port ${PORT}`);
});