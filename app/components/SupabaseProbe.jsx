// app/components/SupabaseProbe.jsx
'use client';
import * as React from 'react';
import { supabase } from '../lib/supabaseClient/supabaseClient';

export default function SupabaseProbe({ tripId }) {
  const [msg, setMsg] = React.useState('Ready');

  const run = async () => {
    setMsg('Running… check console');

    // 1) basic env & client check
    console.log('[Probe] URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('[Probe] ANON present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    // 2) try upsert one city (Tokyo)
    const payload = {
      trip_id: tripId,
      city: 'Tokyo',
      data: { eat: [{ id: 'probe-1', title: 'Probe Save', address: 'Shibuya', order: 1 }] },
    };

    const up = await supabase
      .from('city_guides')
      .upsert(payload, { onConflict: 'trip_id,city' })
      .select('id, trip_id, city, updated_at');

    console.log('[Probe upsert] data:', up.data, 'error:', up.error);

    // 3) read-back rows
    const sel = await supabase
      .from('city_guides')
      .select('id, city, data')
      .eq('trip_id', tripId);

    console.log('[Probe select] data:', sel.data, 'error:', sel.error);

    // 4) helpful status message
    if (up.error) setMsg('Upsert FAILED — see console');
    else if (sel.error) setMsg('Select FAILED — see console');
    else if ((sel.data || []).length === 0) setMsg('No rows found for this tripId');
    else setMsg('SUCCESS — rows returned; data should sync across devices');
  };

  return (
    <div className="rounded-xl border p-3 text-xs space-y-2 hidden bg-white">
      <div className="font-mono">Supabase Probe</div>
      <div>tripId: <code className="bg-neutral-100 px-1 rounded">{tripId || '(missing)'}</code></div>
      <button onClick={run} className="rounded border px-2 py-1">Run Probe</button>
      <div className="text-neutral-600">{msg}</div>
    </div>
  );
}
