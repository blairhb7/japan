'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../lib/supabaseClient/supabaseClient';

// Embeds (CSR)
const YouTubeEmbed = dynamic(
  async () => (await import('react-social-media-embed')).YouTubeEmbed,
  { ssr: false }
);
const TikTokEmbed = dynamic(
  async () => (await import('react-social-media-embed')).TikTokEmbed,
  { ssr: false }
);
const InstagramEmbed = dynamic(
  async () => (await import('react-social-media-embed')).InstagramEmbed,
  { ssr: false }
);

const CITIES = ['Tokyo', 'Kyoto', 'Osaka', 'Hakone', 'Kobe', 'Wakayama'];
const CATEGORIES = ['Eat', 'Shop', 'Drink', 'Visit', 'Onsen'];

/* ---------- helpers ---------- */
function debounce(fn, delay = 700) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
function uid() {
  return (globalThis.crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : `id_${Math.random().toString(36).slice(2)}${Date.now()}`;
}
function gmaps(q) { return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`; }
function amap(q)  { return `https://maps.apple.com/?q=${encodeURIComponent(q)}`; }
function detectPlatform(url='') {
  const u = url.toLowerCase();
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('instagram.com')) return 'instagram';
  return 'unknown';
}

function emptyGuide() {
  const data = {};
  CATEGORIES.forEach(cat => { data[cat.toLowerCase()] = []; });
  return data;
}
function ensureGuideData(json) {
  const safe = json && typeof json === 'object' ? json : {};
  return {
    eat:   Array.isArray(safe.eat)   ? safe.eat   : [],
    shop:  Array.isArray(safe.shop)  ? safe.shop  : [],
    drink: Array.isArray(safe.drink) ? safe.drink : [],
    visit: Array.isArray(safe.visit) ? safe.visit : [],
    onsen: Array.isArray(safe.onsen) ? safe.onsen : [],
  };
}
function normalizeItems(arr) {
  return (Array.isArray(arr) ? arr : []).map((item, idx) => ({
    id: item.id || uid(),
    title: item.title || '',
    embed_url: item.embed_url || '',
    address: item.address || '',
    price_estimate: item.price_estimate || '',
    notes: item.notes || '',
    order: item.order || idx + 1,
  }));
}
function normalizeCityData(cityBlock) {
  const src = cityBlock || {};
  return {
    eat:   normalizeItems(src.eat),
    shop:  normalizeItems(src.shop),
    drink: normalizeItems(src.drink),
    visit: normalizeItems(src.visit),
    onsen: normalizeItems(src.onsen),
  };
}

/* ---------- component ---------- */
export default function CityExplorer({
  tripId,
  className,
  initialData = null,          // your static dataset
  autoApplyInitialData = false, // overwrite DB on first load (optional)
  requireDB = false             // if true, don't render items unless DB loads
}) {
  const [activeCity, setActiveCity] = React.useState(CITIES[0]);
  const [activeCat, setActiveCat]   = React.useState('Eat');

  const [rows, setRows] = React.useState(null); // [{id, city, data, updated_at}]
  const [loading, setLoading] = React.useState(true);
  const [savingIds, setSavingIds] = React.useState(new Set());
  const [lastError, setLastError] = React.useState('');
  const [appliedFromProp, setAppliedFromProp] = React.useState(false);

  // --- optimistic: show initialData immediately so it's never blank ---
// A) Auto-apply initialData -> DB once rows exist


React.useEffect(() => {
  (async () => {
    if (!autoApplyInitialData) return;
    if (appliedFromProp) return;
    if (!tripId || !initialData) return;
    if (!rows || rows.length === 0) return;

    // overwrite only cities present in initialData
    const entries = Object.entries(initialData).filter(([city]) => [
      'Tokyo','Kyoto','Osaka','Hakone','Kobe','Wakayama'
    ].includes(city));

    for (const [city, block] of entries) {
      const r = rows.find(row => row.city === city);
      if (!r) continue;
      const payload = normalizeCityData(block);
      const { error } = await supabase
        .from('city_guides')
        .upsert({ trip_id: tripId, city, data: payload }, { onConflict: 'trip_id,city' });
      if (error) { setLastError(error.message || `Apply failed for ${city}`); }
    }

    // refresh to replace synthetic ids
    const { data: refreshed } = await supabase
      .from('city_guides')
      .select('id, trip_id, city, data, updated_at')
      .eq('trip_id', tripId);
    if (refreshed) {
      setRows(refreshed
        .sort((a, b) => ['Tokyo','Kyoto','Osaka','Hakone','Kobe','Wakayama'].indexOf(a.city)
                      - ['Tokyo','Kyoto','Osaka','Hakone','Kobe','Wakayama'].indexOf(b.city))
        .map(r => ({ ...r, data: ensureGuideData(r.data) })));
    }
    setAppliedFromProp(true);
  })();
}, [autoApplyInitialData, appliedFromProp, initialData, rows, tripId]);

// B) If any synthetic rows remain after first render, push them automatically
const [autoPushedSynthetic, setAutoPushedSynthetic] = React.useState(false);

React.useEffect(() => {
  (async () => {
    if (autoPushedSynthetic) return;
    if (!tripId || !rows || rows.length === 0) return;
    const hasSynthetic = rows.some(r => String(r.id).startsWith('synthetic-'));
    if (!hasSynthetic) return;

    const payload = rows.map(r => ({
      trip_id: tripId,
      city: r.city,
      data: r.data
    }));
    const { error } = await supabase
      .from('city_guides')
      .upsert(payload, { onConflict: 'trip_id,city' });
    if (error) { setLastError(error.message || 'Bulk upsert failed'); return; }

    const { data: refreshed } = await supabase
      .from('city_guides')
      .select('id, trip_id, city, data, updated_at')
      .eq('trip_id', tripId);
    if (refreshed) {
      setRows(refreshed
        .sort((a, b) => ['Tokyo','Kyoto','Osaka','Hakone','Kobe','Wakayama'].indexOf(a.city)
                      - ['Tokyo','Kyoto','Osaka','Hakone','Kobe','Wakayama'].indexOf(b.city))
        .map(r => ({ ...r, data: ensureGuideData(r.data) })));
    }
    setAutoPushedSynthetic(true);
  })();
}, [rows, tripId, autoPushedSynthetic]);







  React.useEffect(() => {
    if (!initialData || rows) return;
    const synthetic = CITIES.map(city => {
      const block = initialData[city];
      if (!block) {
        return {
          id: `synthetic-${city}`,
          trip_id: tripId || 'local',
          city,
          data: emptyGuide(),
          updated_at: new Date().toISOString()
        };
      }
      return {
        id: `synthetic-${city}`,
        trip_id: tripId || 'local',
        city,
        data: normalizeCityData(block),
        updated_at: new Date().toISOString()
      };
    });
    setRows(synthetic);
    setLoading(false);
  }, [initialData, rows, tripId]);

  const markSaving = React.useCallback((id, isSaving) => {
    setSavingIds(prev => {
      const next = new Set(prev);
      if (isSaving) next.add(id); else next.delete(id);
      return next;
    });
  }, []);

  // Load from Supabase (then replace synthetic)
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!tripId) {
        if (requireDB) {
          setLastError('Missing tripId prop');
          setLoading(false);
        }
        return; // keep optimistic render
      }
      setLoading(true);
      setLastError('');

      const { data, error } = await supabase
        .from('city_guides')
        .select('id, trip_id, city, data, updated_at')
        .eq('trip_id', tripId)
        .in('city', CITIES)
        .order('city', { ascending: true });

      if (error) {
        console.error('[city_guides select]', error);
        setLastError(error.message || 'Select failed');
        setLoading(false);
        return;
      }

      // insert missing rows
      const existingCities = new Set(data?.map(r => r.city) || []);
      const toInsert = CITIES
        .filter(c => !existingCities.has(c))
        .map(c => ({ trip_id: tripId, city: c, data: emptyGuide() }));

      let inserted = [];
      if (toInsert.length > 0) {
        const ins = await supabase
          .from('city_guides')
          .insert(toInsert)
          .select('id, trip_id, city, data, updated_at')
          .order('city', { ascending: true });
        if (ins.error) {
          console.error('[city_guides insert]', ins.error);
          setLastError(ins.error.message || 'Insert failed');
        } else {
          inserted = ins.data || [];
        }
      }

      const all = [...(data || []), ...inserted]
        .sort((a, b) => CITIES.indexOf(a.city) - CITIES.indexOf(b.city))
        .map(r => ({ ...r, data: ensureGuideData(r.data) }));

      if (!mounted) return;
      if (all.length > 0) setRows(all); // replace synthetic with real DB rows
      setLoading(false);
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, requireDB]);

  // Auto-apply initialData -> DB (optional)
  React.useEffect(() => {
    (async () => {
      if (!autoApplyInitialData || appliedFromProp) return;
      if (!initialData || !rows || rows.length === 0 || !tripId) return;
      await applyProvidedData();
      setAppliedFromProp(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoApplyInitialData, initialData, rows, tripId]);

  // Realtime (DB rows only)
  React.useEffect(() => {
    if (!tripId) return;
    const channel = supabase
      .channel(`city-guides:${tripId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'city_guides', filter: `trip_id=eq.${tripId}` },
        payload => {
          setRows(prev => {
            if (!prev) return prev;
            const idx = prev.findIndex(r => r.id === payload.new.id);
            if (idx === -1) return prev;
            const prevRow = prev[idx];
            if (new Date(payload.new.updated_at).getTime() <= new Date(prevRow.updated_at).getTime()) return prev;
            const next = [...prev];
            next[idx] = { ...payload.new, data: ensureGuideData(payload.new.data) };
            return next;
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tripId]);
// inside CityExplorer component
const saveRow = React.useMemo(
    () => debounce(async (row) => {
      try {
        if (!tripId) return;
  
        const isSynthetic = String(row.id).startsWith('synthetic-');
        if (isSynthetic) {
          // First write for this city: create/overwrite the DB row
          const payload = { trip_id: tripId, city: row.city, data: row.data };
          const { data, error } = await supabase
            .from('city_guides')
            .upsert(payload, { onConflict: 'trip_id,city' })
            .select('id, trip_id, city, data, updated_at')
            .maybeSingle();
  
          if (error) { setLastError(error.message || 'Upsert failed'); return; }
  
          // Replace synthetic row with the real DB row
          setRows(prev => {
            if (!prev) return prev;
            const idx = prev.findIndex(r => r.city === row.city);
            if (idx === -1) return prev;
            const next = [...prev];
            next[idx] = { ...data, data: ensureGuideData(data.data) };
            return next;
          });
          return;
        }
  
        // Normal update
        markSaving(row.id, true);
        const { data, error } = await supabase
          .from('city_guides')
          .update({ data: row.data })
          .eq('id', row.id)
          .select('id, updated_at')
          .maybeSingle();
        if (error) { setLastError(error.message || 'Update failed'); return; }
  
        setRows(prev => {
          if (!prev) return prev;
          const idx = prev.findIndex(r => r.id === row.id);
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = { ...prev[idx], updated_at: data.updated_at };
          return next;
        });
      } finally {
        markSaving(row.id, false);
      }
    }, 600),
    [markSaving, tripId]
  );
  
  const updateCityData = React.useCallback((city, updater) => {
    setRows(prev => {
      if (!prev) return prev;
      const idx = prev.findIndex(r => r.city === city);
      if (idx === -1) return prev;
      const next = [...prev];
      const updated = { ...next[idx], data: updater(ensureGuideData(next[idx].data)) };
      next[idx] = updated;
      saveRow(updated);
      return next;
    });
  }, [saveRow]);

  // CRUD (single declarations)
  const addItem = React.useCallback((city, cat) => {
    updateCityData(city, (data) => {
      const key = cat.toLowerCase();
      const order = (data[key].reduce((m, it) => Math.max(m, it.order || 0), 0) || 0) + 1;
      const item = { id: uid(), title: '', embed_url: '', address: '', price_estimate: '', notes: '', order };
      return { ...data, [key]: [...data[key], item] };
    });
  }, [updateCityData]);

  const removeItem = React.useCallback((city, cat, id) => {
    updateCityData(city, (data) => {
      const key = cat.toLowerCase();
      return { ...data, [key]: data[key].filter(i => i.id !== id) };
    });
  }, [updateCityData]);

  const patchItem = React.useCallback((city, cat, id, patch) => {
    updateCityData(city, (data) => {
      const key = cat.toLowerCase();
      return { ...data, [key]: data[key].map(i => (i.id === id ? { ...i, ...patch } : i)) };
    });
  }, [updateCityData]);

  const currentRow = React.useMemo(
    () => rows?.find(r => r.city === activeCity) || null,
    [rows, activeCity]
  );
  const items = React.useMemo(() => {
    if (!currentRow) return [];
    const key = activeCat.toLowerCase();
    return (currentRow.data[key] || []).slice().sort((a,b) => (a.order||0) - (b.order||0));
  }, [currentRow, activeCat]);

  // Overwrite DB with your initialData for the cities you provided
  const applyProvidedData = async () => {
    try {
      if (!initialData || !rows || !tripId) return;
      const entries = Object.entries(initialData).filter(([city]) => CITIES.includes(city));
      for (const [city, block] of entries) {
        const r = rows.find(row => row.city === city && !String(row.id).startsWith('synthetic-'));
        if (!r) continue;
        const payload = normalizeCityData(block);
        const { error } = await supabase.from('city_guides').update({ data: payload }).eq('id', r.id);
        if (error) {
          console.error('[applyProvidedData]', city, error);
          setLastError(error.message || `Failed to apply data for ${city}`);
        }
      }
      const { data: refreshed } = await supabase
        .from('city_guides')
        .select('id, trip_id, city, data, updated_at')
        .eq('trip_id', tripId)
        .in('city', CITIES);
      if (refreshed) {
        setRows(
          refreshed
            .sort((a, b) => CITIES.indexOf(a.city) - CITIES.indexOf(b.city))
            .map(r => ({ ...r, data: ensureGuideData(r.data) }))
        );
      }
    } catch (e) {
      console.error(e);
      setLastError(String(e));
    }
  };

  return (
    <section className={["space-y-4", className].filter(Boolean).join(' ')}>
      {/* Debug / controls */}
      <div className="flex flex-wrap items-center gap-2 text-xs rounded-xl border bg-white px-3 py-2">
        <div><span className="text-neutral-500">tripId:</span> <code className="bg-neutral-100 px-1 rounded">{tripId || '—(optimistic)'}</code></div>
        <div className="hidden sm:block text-neutral-300">•</div>
        <div><span className="text-neutral-500">rows:</span> {rows ? rows.length : (loading ? 'loading…' : '0')}</div>
        {lastError ? (<><div className="hidden sm:block text-neutral-300">•</div><div className="text-red-600">error: {lastError}</div></>) : null}
        <div className="ml-auto flex gap-2">
          {initialData && tripId ? (
            <button
              type="button"
              onClick={applyProvidedData}
              className="rounded-lg border px-2 py-1 hover:bg-neutral-50"
              title="Overwrite DB with your provided dataset"
            >
              Apply Provided Data
            </button>
          ) : null}
        </div>
      </div>

      {/* City tabs */}
      <nav className="flex flex-wrap gap-2">
        {CITIES.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => setActiveCity(c)}
            className={[
              "rounded-full border px-3 py-1 text-xs",
              activeCity === c ? 'bg-black text-white' : 'hover:bg-neutral-50'
            ].join(' ')}
          >
            {c}
          </button>
        ))}
      </nav>

      {/* Category tabs */}
      <nav className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCat(cat)}
            className={[
              "rounded-full border px-3 py-1 text-xs",
              activeCat === cat ? 'bg-black text-white' : 'hover:bg-neutral-50'
            ].join(' ')}
          >
            {cat}
          </button>
        ))}
        {currentRow ? (
          <button
            type="button"
            onClick={() => addItem(activeCity, activeCat)}
            className="ml-auto rounded-full border px-3 py-1 text-xs hover:bg-neutral-50"
          >
            + Add {activeCat}
          </button>
        ) : null}
      </nav>

      {/* Grid */}
      {!rows ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl border bg-white animate-pulse" />
          ))}
        </div>
      ) : !currentRow ? (
        <div className="rounded-xl border bg-white p-4 text-sm">No data yet.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {currentRow.data[activeCat.toLowerCase()]?.slice().sort((a,b) => (a.order||0)-(b.order||0)).map(item => (
            <Card
              key={item.id}
              item={item}
              onPatch={(patch) => patchItem(activeCity, activeCat, item.id, patch)}
              onDelete={() => removeItem(activeCity, activeCat, item.id)}
            />
          ))}
          {currentRow.data[activeCat.toLowerCase()]?.length === 0 && (
            <div className="col-span-full text-sm text-neutral-500">
              No items yet. Click “+ Add {activeCat}”.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ---------- Card ---------- */
function Card({ item, onPatch, onDelete }) {
  const platform = detectPlatform(item.embed_url || '');

  return (
    <article className="rounded-2xl overflow-hidden border bg-white shadow-sm">
      {/* Embed */}
      <div className="bg-neutral-100  flex items-center justify-center">
        {platform === 'youtube' && item.embed_url ? (
          <div className="w-full h-full p-2">
            <YouTubeEmbed url={item.embed_url} width="100%" height="500" />
          </div>
        ) : platform === 'tiktok' && item.embed_url ? (
          <div className="w-full h-full p-2">
            <TikTokEmbed url={item.embed_url} width="100%" />
          </div>
        ) : platform === 'instagram' && item.embed_url ? (
          <div className="w-full h-full p-2">
            <InstagramEmbed url={item.embed_url} width="100%" />
          </div>
        ) : (
          <div className="p-4 text-xs text-neutral-500 text-center">
            Paste a TikTok / YouTube / Instagram URL to preview
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <label className="text-xs text-neutral-600 block">
          Title
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="e.g., Ichiran Ramen Shibuya"
            value={item.title || ''}
            onChange={(e) => onPatch({ title: e.target.value })}
          />
        </label>

        <label className="text-xs text-neutral-600 block">
          TikTok / YouTube / Instagram URL
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="https://www.tiktok.com/... • https://youtu.be/... • https://www.instagram.com/reel/..."
            value={item.embed_url || ''}
            onChange={(e) => onPatch({ embed_url: e.target.value })}
          />
        </label>

        <label className="text-xs text-neutral-600 block">
          Address (or place)
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="Type address or place"
            value={item.address || ''}
            onChange={(e) => onPatch({ address: e.target.value })}
          />
          {item.address ? (
            <div className="mt-1 flex gap-3 text-xs">
              <a className="underline" target="_blank" rel="noopener noreferrer" href={gmaps(item.address)}>Google Maps</a>
              <a className="underline" target="_blank" rel="noopener noreferrer" href={amap(item.address)}>Apple Maps</a>
            </div>
          ) : null}
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-neutral-600">
            Est. Price
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="$, ¥, or range"
              value={item.price_estimate || ''}
              onChange={(e) => onPatch({ price_estimate: e.target.value })}
            />
          </label>
          <label className="text-xs text-neutral-600">
            Notes
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="Reservation #, timing, etc."
              value={item.notes || ''}
              onChange={(e) => onPatch({ notes: e.target.value })}
            />
          </label>
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border px-3 py-1 text-xs text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
