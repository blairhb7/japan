'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ChevronDown,
  Instagram,
  Youtube,
  Twitter,
  Github,
  Mail,
  MapPin,
} from 'lucide-react';

/* ==========================================
   Fixed Navbar (tailored for your Japan trip site)
   - sticky/fixed at top with blur + border
   - active link highlight using usePathname
   - mobile drawer
   - keyboard-accessible Cities dropdown (Tokyo, Kyoto, Osaka, Hakone, Kobe, Wakayama)
   Usage: place <Navbar /> inside your root layout, then add pt-16 (or pt-20) to your main wrapper so content isn't hidden behind the nav.
   ========================================== */
export function Navbar({
  links = [
    { href: '#Itinerary', label: 'Itinerary' },
    
    { href: '#accommodations', label: 'Accommodations' },
    { href: '#events', label: 'Events' },
  ],
  
  logo = (
    <span className="font-extrabold tracking-tight">JapanTrip</span>
  ),
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [citiesOpen, setCitiesOpen] = React.useState(false);
  const citiesBtnRef = React.useRef(null);
  const citiesPanelRef = React.useRef(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    // close mobile on route change
    setOpen(false);
    setCitiesOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setCitiesOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50',
        'border-b',
        'backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90',
        scrolled ? 'shadow-sm' : '',
      ].join(' ')}
      role="banner"
    >
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6" aria-label="Main">
        <div className="flex flex-1 items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-lg">
            {logo}
          </Link>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex md:items-center md:gap-1">
          {links.map((l) => {
            if (l.children?.length) {
              const active = l.children.some((c) => pathname?.startsWith(c.href));
              return (
                <div
                  key={l.label}
                  className="relative"
                  onMouseEnter={() => setCitiesOpen(true)}
                  onMouseLeave={() => setCitiesOpen(false)}
                >
                  <button
                    ref={citiesBtnRef}
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={citiesOpen}
                    onClick={() => setCitiesOpen((v) => !v)}
                    className={[
                      'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm',
                      active ? 'bg-black text-white' : 'text-neutral-700 hover:bg-neutral-100',
                    ].join(' ')}
                  >
                    {l.label}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {/* Dropdown panel */}
                  <div
                    ref={citiesPanelRef}
                    role="menu"
                    className={[
                      'absolute left-0 mt-2 w-56 overflow-hidden rounded-xl border bg-white shadow-md',
                      citiesOpen ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 -translate-y-1',
                      'transition'
                    ].join(' ')}
                  >
                    <ul className="p-1 text-sm">
                      {l.children.map((c) => (
                        <li key={c.href}>
                          <Link
                            href={c.href}
                            role="menuitem"
                            className={[
                              'block rounded-lg px-3 py-2',
                              pathname?.startsWith(c.href)
                                ? 'bg-black text-white'
                                : 'text-neutral-700 hover:bg-neutral-100',
                            ].join(' ')}
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            }
            const active = pathname === l.href || (l.href !== '/' && pathname?.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  'rounded-full px-3 py-1.5 text-sm',
                  active ? 'bg-black text-white' : 'text-neutral-700 hover:bg-neutral-100',
                ].join(' ')}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* CTA + Mobile toggle */}
        <div className="ml-auto flex items-center gap-2">
         
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex md:hidden items-center justify-center rounded-xl border p-2"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile panel */}
      <div
        id="mobile-nav"
        className={[
          'md:hidden overflow-hidden border-t',
          open ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0',
          'transition-all duration-300 ease-out',
          'bg-white',
        ].join(' ')}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-1">
            {/* Flatten desktop links for mobile; show Cities children inline */}
            {links.map((l) => (
              l.children?.length ? (
                <details key={l.label} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                    <span>{l.label}</span>
                    <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                  </summary>
                  <div className="px-2 pb-2">
                    {l.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={[
                          'block rounded-lg px-3 py-2 text-sm',
                          pathname?.startsWith(c.href) ? 'bg-black text-white' : 'text-neutral-700 hover:bg-neutral-100',
                        ].join(' ')}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </details>
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  className={[
                    'w-full rounded-lg px-3 py-2 text-sm',
                    pathname === l.href || (l.href !== '/' && pathname?.startsWith(l.href))
                      ? 'bg-black text-white'
                      : 'text-neutral-700 hover:bg-neutral-100',
                  ].join(' ')}
                >
                  {l.label}
                </Link>
              )
            ))}
           
          </div>
        </div>
      </div>
    </header>
  );
}

/* ==========================================
   Footer (tailored)
   - four-column responsive grid
   - newsletter form (no backend wired)
   - social icons
   Usage: place <Footer /> at the end of your layout. Add `scroll-mt-20` to headings if you link to anchors behind the fixed nav.
   ========================================== */
export function Footer({
  brand = 'JapanTrip',
  description = 'Curated city guides, food finds, and travel tools for exploring Japan.',
  columns = [
    {
      title: 'Cities',
      links: [
        { href: '/tokyo', label: 'Tokyo' },
        { href: '/kyoto', label: 'Kyoto' },
        { href: '/osaka', label: 'Osaka' },
        { href: '/hakone', label: 'Hakone' },
        { href: '/kobe', label: 'Kobe' },
        { href: '/wakayama', label: 'Wakayama' },
      ],
    },
    {
      title: 'Explore',
      links: [
        { href: '/guides', label: 'Guides' },
        { href: '/food-finds', label: 'Food Finds' },
        { href: '/experiences', label: 'Experiences' },
        { href: '/deals', label: 'Deals' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { href: '/rail-passes', label: 'Rail Passes' },
        { href: '/packing', label: 'Packing List' },
        { href: '/itinerary', label: 'Itinerary Builder' },
        { href: '/faq', label: 'FAQ' },
      ],
    },
    {
      title: 'Company',
      links: [
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
        { href: '/privacy', label: 'Privacy' },
        { href: '/terms', label: 'Terms' },
      ],
    },
  ],
  address = 'Vallejo, CA',
  email = 'hello@example.com',
  socials = [
    { href: 'https://instagram.com', label: 'Instagram', icon: Instagram },
    { href: 'https://youtube.com', label: 'YouTube', icon: Youtube },
    { href: 'https://twitter.com', label: 'Twitter / X', icon: Twitter },
    { href: 'https://github.com', label: 'GitHub', icon: Github },
  ],
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="text-xl font-bold">{brand}</div>
            <p className="text-sm text-white">{description}</p>
            <div className="flex items-center gap-2 text-sm text-white">
              <MapPin className="h-4 w-4" /> {address}
            </div>
            <div className="flex items-center gap-2 text-sm text-white">
              <Mail className="h-4 w-4" />
              <a className="underline" href={`mailto:${email}`}>{email}</a>
            </div>
          </div>

          {/* Columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <div className="text-sm font-semibold text-white">{col.title}</div>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link className="text-white hover:text-neutral-900" href={l.href}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-10 rounded-2xl border p-4">
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const input = form.querySelector('input[name=email]');
              // TODO: wire to your backend/email service
              input?.blur();
              alert('Thanks! We\'ll keep you posted.');
            }}
          >
            <label className="sr-only" htmlFor="newsletter">Email</label>
            <input
              id="newsletter"
              name="email"
              type="email"
              required
              placeholder="Get travel tips in your inbox"
              className="flex-1 rounded-xl border px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-xl border border-black px-4 py-2 text-sm font-medium hover:bg-black hover:text-white">
              Subscribe
            </button>
          </form>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-6 text-sm text-neutral-600 sm:flex-row">
          <p>© {year} {brand}. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {socials.map((s) => (
              <Link key={s.href} href={s.href} aria-label={s.label} className="rounded-lg p-1.5 hover:bg-neutral-100">
                <s.icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ==========================================
   Example usage in a layout (app/layout.jsx)
   ========================================== */
export default function LayoutExample({ children }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      {/* add top padding to prevent content from sitting under the fixed nav */}
      <main className="pt-16">{children}</main>
      <Footer />
    </div>
  );
}
