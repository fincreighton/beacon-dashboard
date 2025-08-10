// Cloudflare Pages Function: /yahoo
// Place this file at: functions/yahoo.js  in your repo connected to Cloudflare Pages.
// It proxies Yahoo Finance and adds CORS. No keys needed.

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get('symbol');
  const allowlist = new Set(['MSTR', 'MSTY']); // add more symbols if you like

  if (!symbol) {
    return new Response(JSON.stringify({ error: 'Missing ?symbol=' }), {
      status: 400,
      headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
    });
  }
  if (!allowlist.has(symbol.toUpperCase())) {
    return new Response(JSON.stringify({ error: 'Symbol not allowed' }), {
      status: 403,
      headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
    });
  }

  const target = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=max`;
  const upstream = await fetch(target, { headers: { 'user-agent': 'CF-Pages-Function/1.0' } });

  const body = await upstream.text();
  const contentType = upstream.headers.get('content-type') || 'application/json';

  return new Response(body, {
    status: upstream.status,
    headers: {
      'content-type': contentType,
      'access-control-allow-origin': '*',
      'cache-control': 'public, max-age=1800' // 30 minutes cache
    }
  });
}
