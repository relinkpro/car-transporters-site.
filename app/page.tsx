'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Trailer = {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  uses: string[];
  features: string[];
  badge: string;
};

type AvailabilityResult = {
  status: 'available' | 'unavailable' | 'error';
  message: string;
};

const PHONE_NUMBER = '353872310184';

const TRAILERS: Trailer[] = [
  {
    id: 'trailer-1',
    name: 'Car Transporter Trailer 1',
    subtitle:
      'Ideal for cars, jeeps, vintage vehicles and light machinery with a clean, practical flatbed setup.',
    image: '/images/hero.jpg',
    badge: 'Popular for car moves',
    uses: [
      'Car transport',
      'Vintage vehicle moves',
      'Jeep and pickup transport',
      'Light machinery',
    ],
    features: [
      'Flatbed design',
      'Easy loading',
      'Secure tie-down points',
      'Based in Bunclody, Co. Wexford',
    ],
  },
  {
    id: 'trailer-2',
    name: 'Car Transporter Trailer 2',
    subtitle:
      'A rugged all-round option for private collections, trade moves, project vehicles and county-to-county jobs.',
    image: '/images/gallery1.jpg',
    badge: 'Heavy-duty option',
    uses: [
      'DoneDeal collections',
      'Project cars',
      'Trade collections',
      'County-to-county moves',
    ],
    features: [
      'Heavy-duty flatbed',
      'Multi-use transport',
      'Straightforward loading',
      'Flexible hire enquiries',
    ],
  },
];

const GALLERY = [
  '/images/hero.jpg',
  '/images/gallery1.jpg',
  '/images/gallery2.jpg',
  '/images/gallery3.jpg',
  '/images/gallery4.jpg',
];

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
}

function formatDisplayDate(date: string) {
  if (!date) return '';
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function Page() {
  const [selectedTrailer, setSelectedTrailer] = useState<Trailer | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    if (!selectedTrailer) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedTrailer(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedTrailer]);

  const openChecker = (trailer: Trailer) => {
    setSelectedTrailer(trailer);
    setStartDate('');
    setEndDate('');
    setResult(null);
    setLoading(false);
  };

  const closeChecker = () => {
    setSelectedTrailer(null);
    setStartDate('');
    setEndDate('');
    setResult(null);
    setLoading(false);
  };

  const generalEnquiryLink = buildWhatsAppUrl(
    'Hi, I’m looking to hire a car transporter in Bunclody, Co. Wexford. Can you send details, availability and price please?'
  );

  const selectedTrailerGeneralLink = selectedTrailer
    ? buildWhatsAppUrl(
        `Hi, I’m enquiring about ${selectedTrailer.name}. I’m looking to hire a trailer from Bunclody, Co. Wexford. Can you send availability and price please?`
      )
    : '#';

  const dateSpecificLink = selectedTrailer
    ? buildWhatsAppUrl(
        `Hi, I’m enquiring about ${selectedTrailer.name} from ${formatDisplayDate(
          startDate
        )} to ${formatDisplayDate(endDate)}. Can you confirm availability and send me the price please?`
      )
    : '#';

  const resultAwareLink = selectedTrailer
    ? buildWhatsAppUrl(
        result?.status === 'available'
          ? `Hi, I’m enquiring about ${selectedTrailer.name} from ${formatDisplayDate(
              startDate
            )} to ${formatDisplayDate(
              endDate
            )}. The website shows it as available. Can you confirm availability and send me the price please?`
          : result?.status === 'unavailable'
          ? `Hi, I’m enquiring about ${selectedTrailer.name} from ${formatDisplayDate(
              startDate
            )} to ${formatDisplayDate(
              endDate
            )}. The website shows it as unavailable. Do you have another trailer or another available date?`
          : `Hi, I’m enquiring about ${selectedTrailer.name} from ${formatDisplayDate(
              startDate
            )} to ${formatDisplayDate(
              endDate
            )}. I had an issue checking availability on the website. Can you confirm if it is free and send me the price please?`
      )
    : '#';

  const canSendDateSpecific = Boolean(selectedTrailer && startDate && endDate);

  const checkAvailability = async () => {
    if (!selectedTrailer || !startDate || !endDate) {
      setResult({
        status: 'error',
        message: 'Please select both a start date and end date.',
      });
      return;
    }

    if (endDate < startDate) {
      setResult({
        status: 'error',
        message: 'End date must be the same as or after the start date.',
      });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const response = await fetch('/api/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trailerId: selectedTrailer.id,
          startDate,
          endDate,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setResult({
          status: 'error',
          message:
            data?.error || 'There was a problem checking availability.',
        });
        return;
      }

      if (data?.available) {
        setResult({
          status: 'available',
          message: 'This trailer looks available for your selected dates.',
        });
      } else {
        setResult({
          status: 'unavailable',
          message: 'This trailer is not available for those selected dates.',
        });
      }
    } catch {
      setResult({
        status: 'error',
        message: 'There was a problem checking availability.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-white">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,170,0,0.16),transparent_35%),linear-gradient(180deg,#0a0a0b_0%,#0f0f11_100%)] shadow-2xl">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d4a63a]">
                Bunclody, Co. Wexford
              </p>
              <h1 className="mt-1 text-lg font-semibold text-white sm:text-xl">
                Car Transporters For Hire
              </h1>
            </div>

            <nav className="flex items-center gap-2">
              <a
                href="#trailers"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10"
              >
                Trailers
              </a>
              <a
                href="#gallery"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10"
              >
                Gallery
              </a>
              <a
                href={generalEnquiryLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition hover:opacity-90"
              >
                WhatsApp
              </a>
            </nav>
          </header>

          <div className="grid gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-12">
            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex w-fit rounded-full border border-[#d4a63a]/30 bg-[#d4a63a]/10 px-4 py-2 text-xs font-medium text-[#f0c76a]">
                Premium rugged trailer hire
              </div>

              <h2 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                Car transporter trailer
                <br />
                hire in{' '}
                <span className="text-[#ffbf2f]">Bunclody, Co. Wexford</span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                A practical local hire setup for cars, jeeps, vintage vehicles
                and light machinery. Check dates online, then message directly
                on WhatsApp for price and final confirmation.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#trailers"
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                >
                  View trailers
                </a>
                <a
                  href={generalEnquiryLink}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  General WhatsApp enquiry
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {['Cars', 'Jeeps', 'Vintage', 'Light plant'].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs text-white/80"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-xl overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-3 shadow-2xl">
                <img
                  src="/images/hero.jpg"
                  alt="Trailer hire Bunclody"
                  className="h-[420px] w-full rounded-[22px] object-cover"
                />
                <div className="absolute bottom-8 left-8 right-8 rounded-[20px] border border-white/10 bg-black/45 p-5 backdrop-blur-md">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d4a63a]">
                    Local trailer hire
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    Straightforward booking flow
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/75">
                    Pick your trailer, check your dates, then WhatsApp for price
                    and confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="trailers" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#d4a63a]">
            Available trailers
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Choose your trailer
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
            Suitable for local collections, trade moves, vintage projects and
            private transport jobs.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {TRAILERS.map((trailer) => (
            <article
              key={trailer.id}
              className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-xl transition hover:-translate-y-1 hover:bg-white/[0.06]"
            >
              <div className="relative">
                <img
                  src={trailer.image}
                  alt={trailer.name}
                  className="h-64 w-full object-cover"
                />
                <div className="absolute left-4 top-4 rounded-full border border-[#d4a63a]/30 bg-black/50 px-3 py-1 text-xs font-medium text-[#f1c766] backdrop-blur-sm">
                  {trailer.badge}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-semibold text-white">
                  {trailer.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  {trailer.subtitle}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d4a63a]">
                      Typical uses
                    </h4>
                    <ul className="mt-3 space-y-2 text-sm text-white/75">
                      {trailer.uses.map((use) => (
                        <li key={use}>• {use}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d4a63a]">
                      Features
                    </h4>
                    <ul className="mt-3 space-y-2 text-sm text-white/75">
                      {trailer.features.map((feature) => (
                        <li key={feature}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => openChecker(trailer)}
                    className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                  >
                    Check availability
                  </button>
                  <a
                    href={buildWhatsAppUrl(
                      `Hi, I’m enquiring about ${trailer.name}. Can you send details, availability and price please?`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="gallery" className="mx-auto max-w-7xl px-4 py-8 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#d4a63a]">
            Gallery
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Recent trailer images
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {GALLERY.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04]"
            >
              <img
                src={image}
                alt={`Trailer gallery ${index + 1}`}
                className="h-56 w-full object-cover transition duration-300 hover:scale-[1.03]"
              />
            </div>
          ))}
        </div>
      </section>

      {selectedTrailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div
            className="absolute inset-0"
            onClick={closeChecker}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/10 bg-[#111214] shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d4a63a]">
                  Availability checker
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {selectedTrailer.name}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
                  Select your dates below to check calendar availability. Then
                  send your enquiry directly on WhatsApp.
                </p>
              </div>

              <button
                onClick={closeChecker}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
              <div className="border-b border-white/10 p-6 md:border-b-0 md:border-r">
                <img
                  src={selectedTrailer.image}
                  alt={selectedTrailer.name}
                  className="h-56 w-full rounded-[20px] object-cover"
                />

                <div className="mt-5">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d4a63a]">
                      Trailer details
                    </p>
                    <p className="mt-3 text-sm leading-6 text-white/75">
                      {selectedTrailer.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="start-date"
                      className="mb-2 block text-sm font-medium text-white/80"
                    >
                      Start date
                    </label>
                    <input
                      id="start-date"
                      type="date"
                      min={today}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#d4a63a]/60"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="end-date"
                      className="mb-2 block text-sm font-medium text-white/80"
                    >
                      End date
                    </label>
                    <input
                      id="end-date"
                      type="date"
                      min={startDate || today}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#d4a63a]/60"
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={checkAvailability}
                    disabled={loading}
                    className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Checking...' : 'Check availability'}
                  </button>

                  <a
                    href={selectedTrailerGeneralLink}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    WhatsApp enquiry
                  </a>
                </div>

                {result && (
                  <div
                    className={`mt-6 rounded-2xl border p-4 text-sm leading-6 ${
                      result.status === 'available'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                        : result.status === 'unavailable'
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                        : 'border-red-500/30 bg-red-500/10 text-red-200'
                    }`}
                  >
                    <p className="font-medium">{result.message}</p>
                  </div>
                )}

                <div className="mt-6 grid gap-3">
                  <a
                    href={canSendDateSpecific ? dateSpecificLink : selectedTrailerGeneralLink}
                    target="_blank"
                    rel="noreferrer"
                    className={`rounded-2xl px-5 py-3 text-center text-sm font-semibold transition ${
                      canSendDateSpecific
                        ? 'bg-[#25D366] text-black hover:opacity-90'
                        : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {canSendDateSpecific
                      ? 'Send date enquiry on WhatsApp'
                      : 'Send general enquiry on WhatsApp'}
                  </a>

                  {result && canSendDateSpecific && (
                    <a
                      href={resultAwareLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-white/10"
                    >
                      Send result-aware WhatsApp message
                    </a>
                  )}
                </div>

                <p className="mt-6 text-xs leading-6 text-white/45">
                  Availability shown here is a guide based on the linked
                  calendar. Final booking is confirmed directly by WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}