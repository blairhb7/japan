'use client';

import * as React from 'react';
import { supabase } from '../lib/supabaseClient/supabaseClient';

const RATE_ENDPOINT = 'https://api.exchangerate.host/latest?base=JPY&symbols=USD';

function formatNumber(n, digits = 2) {
  if (n === '' || n === null || n === undefined || Number.isNaN(n)) return '';
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: digits }).format(n);
}

export default function MoneyConverter({ className, tripId = null }) {
  const [rate, setRate] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('yen_usd_rate');
      if (saved) {
        const parsed = parseFloat(saved);
        if (!Number.isNaN(parsed)) return parsed;
      }
    }
    return 0; // filled by fetch
  });
  const [fetchedAt, setFetchedAt] = React.useState(null);
  const [loadingRate, setLoadingRate] = React.useState(false);
  const [error, setError] = React.useState('');

  const [yen, setYen] = React.useState('');
  const [usd, setUsd] = React.useState('');

  const [logging, setLogging] = React.useState(false);
  const [logs, setLogs] = React.useState([]); // recent fx_logs

  const fetchRate = React.useCallback(async () => {
    try {
      setLoadingRate(true);
      setError('');
      const res = await fetch(RATE_ENDPOINT, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const r = data?.rates?.USD;
      if (!r || typeof r !== 'number') throw new Error('Bad rate payload');
      setRate(r);
      setFetchedAt(new Date().toISOString());
    } catch (e) {
      setError('Could not fetch latest rate. You can enter a custom rate below.');
    } finally {
      setLoadingRate(false);
    }
  }, []);

  React.useEffect(() => {
    if (!rate || rate <= 0) fetchRate();
  }, [rate, fetchRate]);

  // Load latest logs (most recent first)
  const loadLogs = React.useCallback(async () => {
    const q = supabase
      .from('fx_logs')
      .select('id, trip_id, source_currency, target_currency, source_amount, target_amount, rate, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    const { data, error } = tripId ? await q.eq('trip_id', tripId) : await q;
    if (!error && Array.isArray(data)) setLogs(data);
  }, [tripId]);

  React.useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Conversions
  const onYenChange = (v) => {
    if (v === '') {
      setYen('');
      setUsd('');
      return;
    }
    const n = parseFloat(v);
    if (Number.isNaN(n)) return;
    setYen(v);
    if (rate > 0) setUsd((n * rate).toFixed(2));
  };

  const onUsdChange = (v) => {
    if (v === '') {
      setUsd('');
      setYen('');
      return;
    }
    const n = parseFloat(v);
    if (Number.isNaN(n)) return;
    setUsd(v);
    if (rate > 0) setYen((n / rate).toFixed(0)); // whole yen
  };

  // Manual rate override
  const onRateChange = (v) => {
    if (v === '') {
      setRate(0);
      if (typeof window !== 'undefined') window.localStorage.removeItem('yen_usd_rate');
      return;
    }
    const n = parseFloat(v);
    if (Number.isNaN(n) || n <= 0) return;
    setRate(n);
    if (typeof window !== 'undefined') window.localStorage.setItem('yen_usd_rate', String(n));

    // Recompute outputs
    if (yen !== '' && !Number.isNaN(parseFloat(yen))) {
      setUsd((parseFloat(yen) * n).toFixed(2));
    } else if (usd !== '' && !Number.isNaN(parseFloat(usd))) {
      setYen((parseFloat(usd) / n).toFixed(0));
    }
  };

  // Log current conversion to Supabase
  const logConversion = async () => {
    if (!(rate > 0)) return;
    const jpy = parseFloat(yen);
    const dollars = parseFloat(usd);
    // Require at least one side
    if (Number.isNaN(jpy) && Number.isNaN(dollars)) return;

    // Normalize to one direction (prefer what the user just typed)
    let source_currency, target_currency, source_amount, target_amount;
    if (!Number.isNaN(jpy)) {
      source_currency = 'JPY';
      target_currency = 'USD';
      source_amount = jpy;
      target_amount = Number.isNaN(dollars) ? jpy * rate : dollars;
    } else {
      source_currency = 'USD';
      target_currency = 'JPY';
      source_amount = dollars;
      target_amount = Number.isNaN(jpy) ? dollars / rate : jpy;
    }

    setLogging(true);
    const payload = {
      trip_id: tripId ?? null,
      source_currency,
      target_currency,
      source_amount,
      target_amount,
      rate,
    };
    const { data, error } = await supabase
      .from('fx_logs')
      .insert([payload])
      .select('id, trip_id, source_currency, target_currency, source_amount, target_amount, rate, created_at')
      .single();

    setLogging(false);
    if (error) {
      console.error('fx_logs insert error:', error);
      return;
    }
    // Optimistically add to list
    setLogs(prev => [data, ...prev].slice(0, 10));
  };

  return (
    <section className={["rounded-2xl border p-4 shadow-sm bg-white max-w-2xl", className].filter(Boolean).join(' ')}>
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">JPY ⇄ USD Converter</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border px-2 py-1 text-xs hover:bg-neutral-50"
            onClick={fetchRate}
            disabled={loadingRate}
          >
            {loadingRate ? 'Refreshing…' : 'Refresh rate'}
          </button>
        </div>
      </header>

      {/* Amount inputs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-xs text-neutral-600">
          Japanese Yen (JPY)
          <input
            inputMode="decimal"
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="e.g., 10000"
            value={yen}
            onChange={(e) => onYenChange(e.target.value)}
          />
        </label>

        <label className="text-xs text-neutral-600">
          US Dollar (USD)
          <input
            inputMode="decimal"
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="e.g., 65.00"
            value={usd}
            onChange={(e) => onUsdChange(e.target.value)}
          />
        </label>
      </div>

      {/* Rate */}
      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="text-xs text-neutral-600">
          Rate (auto or custom) <span className="text-neutral-400">(per 1 JPY)</span>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-neutral-700 whitespace-nowrap">1 JPY =</span>
            <input
              inputMode="decimal"
              className="w-28 rounded-xl border px-3 py-2 text-sm"
              placeholder="0.0065"
              value={rate || ''}
              onChange={(e) => onRateChange(e.target.value)}
            />
            <span className="text-sm text-neutral-700 whitespace-nowrap">USD</span>
          </div>
        </label>

        <div className="text-xs text-neutral-500 sm:text-right">
          {error ? (
            <span className="text-red-600">{error}</span>
          ) : fetchedAt ? (
            <span>Fetched: {new Date(fetchedAt).toLocaleString()}</span>
          ) : (
            <span>Fetching latest rate…</span>
          )}
        </div>
      </div>

      {/* Quick preview */}
      <div className="mt-4 text-sm text-neutral-700">
        {yen && rate > 0 && (
          <div>
            {formatNumber(parseFloat(yen), 0)} JPY ≈ ${formatNumber(parseFloat(yen) * rate, 2)} USD
          </div>
        )}
        {usd && rate > 0 && (
          <div>
            ${formatNumber(parseFloat(usd), 2)} USD ≈ ¥{formatNumber(parseFloat(usd) / rate, 0)} JPY
          </div>
        )}
      </div>

      {/* Log button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={logConversion}
          disabled={logging || !(rate > 0) || (yen === '' && usd === '')}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
        >
          {logging ? 'Logging…' : 'Log this conversion'}
        </button>
        {tripId && (
          <span className="ml-3 text-xs text-neutral-500">
            (Logs will be associated with trip <code className="bg-neutral-100 px-1 rounded">{tripId}</code>)
          </span>
        )}
      </div>

      {/* Recent logs */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold mb-2">Recent conversions</h3>
        {logs.length === 0 ? (
          <div className="text-xs text-neutral-500">No logs yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-neutral-500">
                <tr>
                  <th className="py-1 pr-4">When</th>
                  <th className="py-1 pr-4">From</th>
                  <th className="py-1 pr-4">To</th>
                  <th className="py-1 pr-4">Rate</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-1 pr-4">{new Date(row.created_at).toLocaleString()}</td>
                    <td className="py-1 pr-4">
                      {formatNumber(Number(row.source_amount), row.source_currency === 'JPY' ? 0 : 2)} {row.source_currency}
                    </td>
                    <td className="py-1 pr-4">
                      {formatNumber(Number(row.target_amount), row.target_currency === 'JPY' ? 0 : 2)} {row.target_currency}
                    </td>
                    <td className="py-1 pr-4">
                      1 JPY = {formatNumber(Number(row.rate), 6)} USD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
