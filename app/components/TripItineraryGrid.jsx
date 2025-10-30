// app/components/TripItineraryGrid.jsx
'use client';

import * as React from 'react';
import { supabase } from '../lib/supabaseClient/supabaseClient';

const DEFAULT_DAYS = 14;

// 👇 Customize your preset city list here
const CITY_OPTIONS = [
  'Tokyo',
  'Kyoto',
  'Osaka',
  'Hakone',
  'Nara',
  'Kobe',
  'Yokohama',
  'Nagoya',
  'Hiroshima',
  'Sapporo',
  'Fukuoka',
];

/* ----------------------- helpers ----------------------- */
function debounce(fn, delay = 800) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

function newEvent(order, kind = 'event') {
  return {
    id: crypto.randomUUID(),
    kind,           // 'event' | 'dinner' | 'note'
    title: '',
    time: '',
    notes: '',
    address: '',    // address/place or direct map URL
    order,
  };
}

function ensureDayData(data) {
  return {
    city: (data && data.city) || '',
    events: Array.isArray(data && data.events) ? data.events : [],
  };
}

function buildGoogleMapsUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
function buildAppleMapsUrl(query) {
  return `https://maps.apple.com/?q=${encodeURIComponent(query)}`;
}
function getMapLinks(addressOrUrl) {
  if (!addressOrUrl || !addressOrUrl.trim()) return null;
  const v = addressOrUrl.trim();
  if (/^https?:\/\//i.test(v)) return { direct: v }; // user pasted a full URL
  return { google: buildGoogleMapsUrl(v), apple: buildAppleMapsUrl(v) };
}

/* ----------------------- component ----------------------- */
export default function TripItineraryGrid({ tripId, days = DEFAULT_DAYS, className }) {
  const [trip, setTrip] = React.useState(null); // holds arrival_text, departure_text
  const [rows, setRows] = React.useState(null); // itinerary_days
  const [loading, setLoading] = React.useState(true);
  const [savingIds, setSavingIds] = React.useState(new Set());
  const [activeCity, setActiveCity] = React.useState('All');

  const markSaving = React.useCallback((id, isSaving) => {
    setSavingIds(prev => {
      const next = new Set(prev);
      if (isSaving) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const saveTrip = React.useMemo(
    () =>
      debounce(async (tid, patch) => {
        const { error } = await supabase.from('trips').update(patch).eq('id', tid);
        if (error) console.error('supabase trips update error:', error);
      }, 600),
    []
  );

  // initial load or seed
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);

      // fetch or create trip row (with arrival/departure fields)
      const { data: tripRow, error: tripErr } = await supabase
        .from('trips')
        .select('id,name,arrival_text,departure_text')
        .eq('id', tripId)
        .maybeSingle();

      if (tripErr) console.error(tripErr);

      if (!tripRow) {
        const { data: inserted, error: insTripErr } = await supabase
          .from('trips')
          .insert([{ id: tripId, name: 'My Trip', arrival_text: '', departure_text: '' }])
          .select('id,name,arrival_text,departure_text')
          .maybeSingle();
        if (insTripErr) { console.error(insTripErr); return; }
        if (mounted) setTrip(inserted);
      } else {
        if (mounted) setTrip(tripRow);
      }

      // fetch or seed days
      const { data, error } = await supabase
        .from('itinerary_days')
        .select('id, trip_id, day_index, data, updated_at')
        .eq('trip_id', tripId)
        .order('day_index', { ascending: true });

      if (error) {
        console.error(error);
        if (mounted) { setRows([]); setLoading(false); }
        return;
      }

      if (!data || data.length === 0) {
        const seed = Array.from({ length: days }, (_, i) => ({
          trip_id: tripId,
          day_index: i + 1,
          data: { city: '', events: [] },
        }));
        const { data: insertedDays, error: insErr } = await supabase
          .from('itinerary_days')
          .insert(seed)
          .select('id, trip_id, day_index, data, updated_at')
          .order('day_index', { ascending: true });

        if (insErr) {
          console.error(insErr);
          if (mounted) { setRows([]); setLoading(false); }
          return;
        }
        if (mounted) {
          setRows(insertedDays.map(r => ({ ...r, data: ensureDayData(r.data) })));
          setLoading(false);
        }
      } else {
        if (mounted) {
          setRows(data.map(r => ({ ...r, data: ensureDayData(r.data) })));
          setLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, [tripId, days]);

  // realtime for itinerary_days
  React.useEffect(() => {
    if (!tripId) return;
    const channel = supabase
      .channel(`itinerary_days:${tripId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'itinerary_days', filter: `trip_id=eq.${tripId}` },
        payload => {
          setRows(prev => {
            if (!prev) return prev;
            const row = payload.new;
            const idx = prev.findIndex(r => r.id === row.id);
            if (idx === -1) return prev;
            const prevRow = prev[idx];
            if (new Date(row.updated_at).getTime() <= new Date(prevRow.updated_at).getTime()) {
              return prev; // keep our newer copy
            }
            const next = [...prev];
            next[idx] = { ...row, data: ensureDayData(row.data) };
            return next;
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tripId]);

  const saveDay = React.useMemo(
    () =>
      debounce(async (row) => {
        try {
          markSaving(row.id, true);
          const { data, error } = await supabase
            .from('itinerary_days')
            .update({ data: row.data })
            .eq('id', row.id)
            .select('id, updated_at')
            .maybeSingle();

          if (error) {
            console.error(error);
            return;
          }

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
      }, 700),
    [markSaving]
  );

  const updateDay = (dayId, updater) => {
    setRows(prev => {
      if (!prev) return prev;
      const idx = prev.findIndex(r => r.id === dayId);
      if (idx === -1) return prev;
      const next = [...prev];
      const updated = { ...next[idx], data: updater(next[idx].data) };
      next[idx] = updated;
      saveDay(updated);
      return next;
    });
  };

  const addEvent = (dayId, kind = 'event') => {
    updateDay(dayId, (d) => {
      const maxOrder = d.events.reduce((m, e) => Math.max(m, e.order || 0), 0);
      return { ...d, events: [...d.events, newEvent(maxOrder + 1, kind)] };
    });
  };
  const removeEvent = (dayId, eventId) => {
    updateDay(dayId, (d) => ({ ...d, events: d.events.filter(e => e.id !== eventId) }));
  };
  const updateEvent = (dayId, eventId, patch) => {
    updateDay(dayId, (d) => ({
      ...d,
      events: d.events.map(e => (e.id === eventId ? { ...e, ...patch } : e)),
    }));
  };

  // compute tabs from unique city values
  const cities = React.useMemo(() => {
    if (!rows) return [];
    const unique = new Set();
    rows.forEach(r => {
      const c = (r.data && r.data.city ? r.data.city.trim() : '');
      if (c) unique.add(c);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  // filter rows by activeCity (All shows everything)
  const rowsToShow = React.useMemo(() => {
    if (!rows) return [];
    if (activeCity === 'All') return rows;
    return rows.filter(r => (r.data && r.data.city ? r.data.city.trim() : '') === activeCity);
  }, [rows, activeCity]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: days }).map((_, i) => (
          <div key={i} className="rounded-2xl border p-4 animate-pulse h-56" />
        ))}
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return <div className="text-sm text-neutral-500">No itinerary days found.</div>;
  }

  return (
    <div className={["space-y-4", className].filter(Boolean).join(' ')}>
      {/* ---------------- Tabs (Cities) ---------------- */}
      <nav className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCity('All')}
          className={[
            "rounded-full border px-3 py-1 text-xs",
            activeCity === 'All' ? 'bg-black text-white' : 'hover:bg-neutral-50'
          ].join(' ')}
        >
          All
        </button>
        {cities.map(city => (
          <button
            key={city}
            type="button"
            onClick={() => setActiveCity(city)}
            className={[
              "rounded-full border px-3 py-1 text-xs",
              activeCity === city ? 'bg-black text-white' : 'hover:bg-neutral-50'
            ].join(' ')}
          >
            {city}
          </button>
        ))}
      </nav>

      {/* ---------------- Grid ---------------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rowsToShow.slice(0, days).map((row) => {
          const isFirst = row.day_index === 1;
          const isLast  = row.day_index === days;
          return (
            <DayCard
              key={row.id}
              row={row}
              isFirst={isFirst}
              isLast={isLast}
              arrivalText={trip?.arrival_text || ''}
              departureText={trip?.departure_text || ''}
              onChangeArrival={(val) => {
                setTrip(prev => ({ ...prev, arrival_text: val }));
                saveTrip(tripId, { arrival_text: val });
              }}
              onChangeDeparture={(val) => {
                setTrip(prev => ({ ...prev, departure_text: val }));
                saveTrip(tripId, { departure_text: val });
              }}
              onUpdateCity={(val) => updateDay(row.id, d => ({ ...d, city: val }))}
              onAddEvent={(kind) => addEvent(row.id, kind)}
              onRemoveEvent={(eid) => removeEvent(row.id, eid)}
              onUpdateEvent={(eid, patch) => updateEvent(row.id, eid, patch)}
              isSaving={savingIds.has(row.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------- DayCard ----------------------- */
function DayCard({
  row,
  isFirst,
  isLast,
  arrivalText,
  departureText,
  onChangeArrival,
  onChangeDeparture,
  onUpdateCity,     // update city per day
  onAddEvent,
  onRemoveEvent,
  onUpdateEvent,
  isSaving
}) {
  const { day_index, data } = row;
  const isCityPreset = CITY_OPTIONS.includes((data.city || '').trim());
  const selectValue = isCityPreset ? data.city : (data.city ? '__other__' : '');

  const linksFor = (address) => getMapLinks(address || '');

  const handleCitySelect = (e) => {
    const val = e.target.value;
    if (val === '__other__') {
      // reveal custom input; don't overwrite whatever custom city might already exist
      if (!data.city || CITY_OPTIONS.includes(data.city)) {
        onUpdateCity(''); // start blank for custom
      }
    } else if (val === '') {
      onUpdateCity('');
    } else {
      onUpdateCity(val);
    }
  };

  return (
    <section className="rounded-2xl border p-4 shadow-sm bg-amber-400 text-black font-bold">
      <header className="flex items-center justify-between mb-3">
        <h3 className="text-2xl font-semibold">Day {day_index}</h3>
        <span className="text-xs text-neutral-500" aria-live="polite">
          {isSaving ? 'saving…' : 'saved'}
        </span>
      </header>

      {/* City select (per day) */}
      <div className="mb-3">
        <label className="text-xs text-black">
          City
          <div className="mt-1 flex gap-2">
            <select
              className="rounded-xl border px-3 py-2 text-sm"
              value={selectValue}
              onChange={handleCitySelect}
            >
              <option value="">— Select a city —</option>
              {CITY_OPTIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="__other__">Other / Custom…</option>
            </select>

            {/* When 'Other' chosen, show a custom text field bound to data.city */}
            {selectValue === '__other__' && (
              <input
                className="flex-1 rounded-xl border px-3 py-2 text-sm"
                placeholder="Type custom city (e.g., Nikko)"
                value={data.city || ''}
                onChange={(e) => onUpdateCity(e.target.value)}
              />
            )}
          </div>
        </label>
      </div>

      {/* Show Arrival only on Day 1; Departure only on Day N (trip-level fields) */}
      {(isFirst || isLast) && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {isFirst && (
            <label className="text-xs text-black">
              Arrival
              <input
                className="mt-1 md:w-auto rounded-xl border px-3 py-2 text-sm"
                value={arrivalText}
                placeholder="e.g., HND 10:15 AM"
                onChange={(e) => onChangeArrival(e.target.value)}
              />
            </label>
          )}
          {isLast && (
            <label className="text-xs text-neutral-600">
              Departure
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                value={departureText}
                placeholder="e.g., NRT 7:45 PM"
                onChange={(e) => onChangeDeparture(e.target.value)}
              />
            </label>
          )}
        </div>
      )}

      {/* actions */}
      <div className="mb-2 flex gap-2">
        <button
          type="button"
          className="rounded-xl border px-3 py-1 text-xs hover:bg-neutral-50"
          onClick={() => onAddEvent('event')}
          aria-label="Add event"
        >
          + Event
        </button>
        <button
          type="button"
          className="rounded-xl border px-3 py-1 text-xs hover:bg-neutral-50"
          onClick={() => onAddEvent('dinner')}
          aria-label="Add dinner reservation"
        >
          + Dinner
        </button>
        <button
          type="button"
          className="rounded-xl border px-3 py-1 text-xs hover:bg-neutral-50"
          onClick={() => onAddEvent('note')}
          aria-label="Add note"
        >
          + Note
        </button>
      </div>

      {/* events list (with address + maps links) */}
      {(data.events || [])
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((ev) => {
          const links = linksFor(ev.address);
          return (
            <div key={ev.id} className="rounded-xl bg-white flex-col border my-4 p-2">
              <div className="grid grid-cols-1 gap-2">
                <select
                  className="rounded-lg border grid grid-cols-1  px-2 py-1 text-xs"
                  value={ev.kind}
                  onChange={(e) => onUpdateEvent(ev.id, { kind: e.target.value })}
                  aria-label="Event type"
                >
                  <option value="event">Event</option>
                  <option value="dinner">Dinner</option>
                  <option value="note">Note</option>
                </select>
                <input
                  className=" grid grid-cols-1 rounded-lg border px-3 py-1 text-sm"
                  placeholder={ev.kind === 'dinner' ? 'Dinner reservation (place)' : 'Title'}
                  value={ev.title}
                  onChange={(e) => onUpdateEvent(ev.id, { title: e.target.value })}
                  aria-label="Event title"
                />
              </div>

              <div className="mt-2 grid grid-cols-1  whitespace-normal justify-start gap-2">
                <input
                  className="w-28 rounded-lg border px-2 py-1 text-xs"
                  placeholder="Time"
                  value={ev.time || ''}
                  onChange={(e) => onUpdateEvent(ev.id, { time: e.target.value })}
                  aria-label="Event time"
                />
                  <textarea
                    className="h-60 rounded-lg border px-3 py-1 font-semibold text-sm resize-none leading-tight"
                    placeholder="Notes (people, confirmation #, etc.)"
                    value={ev.notes || ''}
                    onChange={(e) => onUpdateEvent(ev.id, { notes: e.target.value })}
                    aria-label="Event notes"
                  />
              </div>

              {/* Address / Place + auto map links */}
              <div className="mt-2">
                <input
                  className="w-full rounded-lg border px-3 py-1 text-xs"
                  placeholder="Address or place (paste a Maps URL or type 'Sushi Saito, Minato')"
                  value={ev.address || ''}
                  onChange={(e) => onUpdateEvent(ev.id, { address: e.target.value })}
                  aria-label="Event address"
                />
                {links && (
                  <div className="mt-1 flex items-center gap-3 text-xs">
                    {links.direct ? (
                      <a
                        href={links.direct}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Open Map
                      </a>
                    ) : (
                      <>
                        <a
                          href={links.google}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          Google Maps
                        </a>
                        <span className="text-neutral-400">•</span>
                        <a
                          href={links.apple}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          Apple Maps
                        </a>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-2">
                <button
                  type="button"
                  className="rounded-lg border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  onClick={() => onRemoveEvent(ev.id)}
                  aria-label="Delete event"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
    </section>
  );
}
