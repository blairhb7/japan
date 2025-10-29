'use client';

import * as React from 'react';

const DEFAULT_RATE = 0.0066; // fallback if fetch fails (1 JPY ≈ 0.0066 USD)
const RATE_ENDPOINT = 'https://api.exchangerate.host/latest?base=JPY&symbols=USD';

function formatNumber(n, digits = 2) {
  if (n === '' || n === null || n === undefined || Number.isNaN(n)) return '';
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: digits }).format(n);
}

export default function MoneyConverterDrawer({ tripId = null }) {
  const [open, setOpen] = React.useState(false);
  const [rate, setRate] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('yen_usd_rate');
      if (saved) {
        const parsed = parseFloat(saved);
        if (!Number.isNaN(parsed) && parsed > 0) return parsed;
      }
    }
    // start with a sane default so the UI works immediately
    return DEFAULT_RATE;
  });
  const [fetchedAt, setFetchedAt] = React.useState(null);
  const [loadingRate, setLoadingRate] = React.useState(false);
  const [error, setError] = React.useState('');

  const [yen, setYen] = React.useState('');
  const [usd, setUsd] = React.useState('');

  // fetch fresh rate on mount (won't override user's custom rate)
  React.useEffect(() => {
    let cancelled = false;
    const fetchRate = async () => {
      try {
        setLoadingRate(true);
        setError('');
        const res = await fetch(RATE_ENDPOINT, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const live = data?.rates?.USD;
        if (!live || typeof live !== 'number') throw new Error('Bad rate payload');

        // Only update if user hasn't set a custom rate
        if (typeof window !== 'undefined') {
          const saved = window.localStorage.getItem('yen_usd_rate');
          const hasCustom = saved && !Number.isNaN(parseFloat(saved));
          if (hasCustom) return; // respect user's custom rate
        }
        if (!cancelled) {
          setRate(live);
          setFetchedAt(new Date().toISOString());
        }
      } catch (e) {
        if (!cancelled) {
          setError('Could not fetch latest rate (using default/custom).');
        }
      } finally {
        if (!cancelled) setLoadingRate(false);
      }
    };
    fetchRate();
    return () => { cancelled = true; };
  }, []);

  // conversions
  const onYenChange = (v) => {
    if (v === '') { setYen(''); setUsd(''); return; }
    const n = parseFloat(v);
    if (Number.isNaN(n)) return;
    setYen(v);
    if (rate > 0) setUsd((n * rate).toFixed(2));
  };

  const onUsdChange = (v) => {
    if (v === '') { setUsd(''); setYen(''); return; }
    const n = parseFloat(v);
    if (Number.isNaN(n)) return;
    setUsd(v);
    if (rate > 0) setYen((n / rate).toFixed(0));
  };

  // manual rate (persist)
  const onRateChange = (v) => {
    if (v === '') {
      setRate(DEFAULT_RATE);
      if (typeof window !== 'undefined') window.localStorage.removeItem('yen_usd_rate');
      // re-evaluate display with default
      if (yen !== '' && !Number.isNaN(parseFloat(yen))) setUsd((parseFloat(yen) * DEFAULT_RATE).toFixed(2));
      if (usd !== '' && !Number.isNaN(parseFloat(usd))) setYen((parseFloat(usd) / DEFAULT_RATE).toFixed(0));
      return;
    }
    const n = parseFloat(v);
    if (Number.isNaN(n) || n <= 0) return;
    setRate(n);
    if (typeof window !== 'undefined') window.localStorage.setItem('yen_usd_rate', String(n));

    if (yen !== '' && !Number.isNaN(parseFloat(yen))) setUsd((parseFloat(yen) * n).toFixed(2));
    else if (usd !== '' && !Number.isNaN(parseFloat(usd))) setYen((parseFloat(usd) / n).toFixed(0));
  };

  // keyboard: ESC to close when open
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {/* Floating toggle button */}
      <button
        type="button"
        aria-label={open ? 'Close money converter' : 'Open money converter'}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 rounded-full border bg-white px-4 py-2 shadow-md hover:bg-neutral-50"
      >
        {open ? 'Close ¥⇄$' : 'Open ¥⇄$'}
      </button>

      {/* Backdrop */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/30 transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        ].join(' ')}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <aside
        className={[
          "fixed right-0 top-0 z-50 h-screen w-[22rem] max-w-[90vw] bg-white border-l shadow-xl",
          "transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        ].join(' ')}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-semibold">JPY ⇄ USD Converter</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close converter"
            className="rounded-md border px-2 py-1 text-xs hover:bg-neutral-50"
          >
            Esc
          </button>
        </header>

        <div className="p-4 space-y-4">
          {/* Inputs */}
          <div className="grid grid-cols-1 gap-3">
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
          <div className="grid gap-2">
            <label className="text-xs text-neutral-600">
              Rate (auto or custom) <span className="text-neutral-400">(per 1 JPY)</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-neutral-700 whitespace-nowrap">1 JPY =</span>
                <input
                  inputMode="decimal"
                  className="w-28 rounded-xl border px-3 py-2 text-sm"
                  placeholder={String(DEFAULT_RATE)}
                  value={rate || ''}
                  onChange={(e) => onRateChange(e.target.value)}
                />
                <span className="text-sm text-neutral-700 whitespace-nowrap">USD</span>
              </div>
            </label>

            <div className="text-xs text-neutral-500">
              {error ? (
                <span className="text-red-600">{error}</span>
              ) : fetchedAt ? (
                <span>Fetched: {new Date(fetchedAt).toLocaleString()}</span>
              ) : (
                <span>Using {loadingRate ? 'live…' : 'default/custom'} rate</span>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="text-sm text-neutral-700 space-y-1">
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

          {/* Optional: tie to a trip (purely informational) */}
          {tripId && (
            <div className="text-[11px] text-neutral-500">
              Linked to trip <code className="bg-neutral-100 px-1 rounded">{tripId}</code>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
