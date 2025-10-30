'use client';
import * as React from 'react';
import { supabase } from '../lib/supabaseClient/supabaseClient';

export default function DBDoctor({ tripId }) {
  const [status, setStatus] = React.useState('Idle');
  const [envOK, setEnvOK] = React.useState({ url: false, anon: false });
  const [writeRes, setWriteRes] = React.useState(null);
  const [readRes, setReadRes] = React.useState(null);

  const run = async () => {
    setStatus('Running…');
    setWriteRes(null);
    setReadRes(null);
    setEnvOK({
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });

    // 1) upsert one simple row for Tokyo
    const payload = {
      trip_id: tripId,
      city: 'Tokyo',
      data: { eat: [{ id: 'doctor-1', title: 'DBDoctor Test Item', order: 1 }] },
    };

    const up = await supabase
      .from('city_guides')
      .upsert(payload, { onConflict: 'trip_id,city' })
      .select('id, trip_id, city, updated_at');

    setWriteRes({ data: up.data, error: up.error });

    // 2) read back all rows for this trip
    const sel = await supabase
      .from('city_guides')
      .select('id, city, data')
      .eq('trip_id', tripId)
      .order('city', { ascending: true });

    setReadRes({ data: sel.data, error: sel.error });

    // Status summary
    if (up.error) setStatus('❌ Upsert FAILED (see details below)');
    else if (sel.error) setStatus('❌ Select FAILED (see details below)');
    else if (!sel.data || sel.data.length === 0) setStatus('⚠️ No rows returned for this tripId');
    else setStatus('✅ Success — rows returned for this tripId');
  };

  return (
    <div className="rounded-xl hidden border bg-white p-4 text-xs space-y-3">
      <div className="font-mono text-sm">DB Doctor</div>
      <div>ENV url present: <b>{String(envOK.url)}</b> | anon present: <b>{String(envOK.anon)}</b></div>
      <div>tripId: <code className="bg-neutral-100 px-1 rounded">{tripId}</code></div>
      <button onClick={run} className="rounded border px-2 py-1">Run DB Test</button>
      <div className="text-neutral-700">Status: {status}</div>

      <details className="rounded border p-2">
        <summary>Write result (upsert)</summary>
        <pre className="overflow-auto">{JSON.stringify(writeRes, null, 2)}</pre>
      </details>
      <details className="rounded border p-2">
        <summary>Read result (select)</summary>
        <pre className="overflow-auto">{JSON.stringify(readRes, null, 2)}</pre>
      </details>
    </div>
  );
}
