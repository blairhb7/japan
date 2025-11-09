import HakoneOnsenSection from "./HakoneOnsenSection";

export async function fetchOnsenFromDB() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(url, anon);

  const { data: spots, error } = await supabase
    .from("onsen_spots")
    .select("id, name, slug, rating, tags, votes, location, summary, hours, admission, access, highlight, sources")
    .order("name", { ascending: true });
  if (error) { console.error(error); return []; }

  const { data: images, error: imgErr } = await supabase
    .from("onsen_spot_images")
    .select("spot_id, url, alt, sort")
    .order("sort", { ascending: true });
  if (imgErr) { console.error(imgErr); }

  const bySpot = (images || []).reduce((acc, img) => {
    (acc[img.spot_id] ||= []).push({ url: img.url, alt: img.alt, sort: img.sort });
    return acc;
  }, {});
  return (spots || []).map(s => ({ ...s, images: bySpot[s.id] || [] }));
}

export default async function HakoneOnsenServer() {
  const items = await fetchOnsenFromDB();
  return <HakoneOnsenSection items={items} />;
}
