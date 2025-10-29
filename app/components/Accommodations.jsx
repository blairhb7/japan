// app/components/AccommodationsStatic.jsx
'use client';

import * as React from 'react';

function gmaps(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
function amap(query) {
  return `https://maps.apple.com/?q=${encodeURIComponent(query)}`;
}

const STAYS = [
  {
    city: 'Tokyo (Asakusa)',
    name: 'Hop Inn Tokyo Asakusa',
    start: '2025-11-10',
    end: '2025-11-12',
    address: '1-7-8 Hanakawado, Asakusa, Taito 111-0033 Tokyo Prefecture',
    priceNote: '',
    website: 'https://www.hopinnhotel.com/our-hotels/hop-inn-tokyo-asakusa?sjrncid=GA_22321112553&sjrnaid=GA_738065098497&gclsrc=aw.ds&gad_source=1&gad_campaignid=22321112553&gbraid=0AAAAA_BvKT07per9FMolr7UlMenOuKxEP&gclid=CjwKCAjw04HIBhB8EiwA8jGNbYzJxWtVxJ6C946WG6FPDMcfJYeb4CGfi2QoZQhHfSMoi5RhOue2NBoChwMQAvD_BwE', // add if you want
    image: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/520010878.jpg?k=5898ae52b47c52dc05a32062a75a79eb048b3e0c64012ce3fcd3ebd123cd581f&o=&hp=1', // Asakusa Senso-ji
  },
  {
    city: 'Kyoto',
    name: 'Kyoto Stay',
    start: '2025-11-12',
    end: '2025-11-15',
    address: '606-8395, Kyōto-fu, Sakyō-ku, Kyōto-shi, 14-6 Higashimarutachō, Japan',
    priceNote: '',
    website: 'https://www.airbnb.com/rooms/30838656?viralityEntryPoint=1&unique_share_id=22C23F00-F2AF-434E-87DC-0277E3A0F736&slcid=2a16bb524dd64fca9f235497578f3483&s=76&adults=1&slug=V8zoKNWR&source_impression_id=p3_1761689815_P3jzdVB4QKvwBzAe',
    image: 'https://a0.muscache.com/im/pictures/8354de98-bc30-4f92-a0b9-59d90738f3a5.jpg?im_w=720',
  },
  {
    city: 'Osaka',
    name: 'Osaka Stay',
    start: '2025-11-15',
    end: '2025-11-18',
    address: '2-chōme-11-5 Hanazonokita, Nishinari Ward, Osaka, Osaka 557-0016, Japan',
    priceNote: '$571.99 total',
    website: 'https://www.airbnb.com/rooms/1246812363459315424?viralityEntryPoint=1&unique_share_id=C7BD4D80-33C6-44CF-8353-727D8BC2C029&slcid=dd4e9310fef447f88cf6f396656acaad&s=76&adults=1&slug=PanYfnIx&source_impression_id=p3_1761690151_P3AV6SdDkx3bmjqc',
    image: 'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTI0NjgxMjM2MzQ1OTMxNTQyNA%3D%3D/original/6b69f20c-4795-4dd8-90b0-9b26f26f720a.jpeg?im_w=1200', // Osaka Dotonbori
  },
  {
    city: 'Hakone',
    name: 'Hakone Stay',
    start: '2025-11-18',
    end: '2025-11-20',
    address: '1304-70 Gora, Hakone, Kanagawa Prefecture 250-0408, Japan',
    priceNote: '$398.89 total',
    website: 'https://www.airbnb.com/rooms/960666106881267632?viralityEntryPoint=1&unique_share_id=8C23BA84-F239-4512-BF50-C0684CF95597&slcid=fe6962827c4d4c11a0cb589bddbf154f&s=76&adults=1&slug=aOkHDwyK&source_impression_id=p3_1761689933_P3IrBx4K3ImHJ-NS',
    image: 'https://a0.muscache.com/im/pictures/miso/Hosting-960666106881267632/original/29323674-bf6b-4ef4-904c-ba6512138b90.jpeg?im_w=1200', // Hakone / Mt Fuji vibe
  },
  {
    city: 'Tokyo (Ikebukuro)',
    name: 'Tokyu Stay Ikebukuro',
    start: '2025-11-20',
    end: '2025-11-22',
    address: '2-12-2 Ikebukuro, Toshima 171-0014 Tokyo Prefecture',
    priceNote: '',
    website: 'https://www.tokyustay.co.jp/en/hotel/ikebukuro-tokyo/',
    image: 'https://images.trvl-media.com/lodging/5000000/4200000/4191200/4191173/9ab5f0dc.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill', // Tokyo city
  },
];

function formatRange(startISO, endISO) {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const opts = { month: 'short', day: 'numeric' };
  const sStr = s.toLocaleDateString(undefined, opts);
  const eStr = e.toLocaleDateString(undefined, opts);
  return `${sStr} → ${eStr}`;
}

export default function AccommodationsStatic({ className }) {
  return (
    <section className={["space-y-6", className].filter(Boolean).join(' ')}>
      <header className="flex items-end justify-between">
        <div>
          <h2 className= "text-2xl md:text-5xl  xl:text-8xl font-bold">Accommodations</h2>
          <p className="text-sm text-neutral-600">Hard-coded stays for Nov 10–22, 2025</p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STAYS.map((stay) => (
          <article key={stay.name + stay.start} className="rounded-2xl overflow-hidden border bg-white shadow-sm">
            {stay.image ? (
              <div className="aspect-video bg-neutral-100">
                <img
                  src={stay.image}
                  alt={`${stay.name} photo`}
                  className="h-full w-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            ) : null}

            <div className="p-4 space-y-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-neutral-500">{stay.city}</div>
                <h3 className="text-2xl font-semibold leading-snug">{stay.name}</h3>
                <div className="text-lg text-neutral-600">{formatRange(stay.start, stay.end)}</div>
                {stay.priceNote ? (
                  <div className="mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
                    {stay.priceNote}
                  </div>
                ) : null}
              </div>

              <div className="text-sm">
                <div className="text-neutral-600">{stay.address}</div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs">
                  <a
                    href={gmaps(stay.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Google Maps
                  </a>
                  <a
                    href={amap(stay.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Apple Maps
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                {stay.website ? (
                  <a
                    href={stay.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border px-3 py-1 text-xs hover:bg-neutral-50"
                  >
                    Website
                  </a>
                ) : (
                  <span className="text-xs text-neutral-400">Website not set</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
