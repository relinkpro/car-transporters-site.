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

const PHONE_NUMBER = '353872310';

const TRAILERS: Trailer[] = [
  {
    id: 'flatbed-1',
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
    id: 'flatbed-2',
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
    "Hi, I’m looking to hire a car transporter in Bunclody, Co. Wexford. Can you send details, availability and price please?"
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
            data?.error || 'There was a problem checking availability. Please try again.',
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
        message: 'There was a problem checking availability. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.14),transparent_45%)]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-amber-300/90">
              Bunclody • Co. Wexford
            </p>
            <h1 className="mt-1 text-lg font-semibold tracking-wide text-white">
              Car Transporters For Hire
            </h1>
          </div>

          <nav className="hidden items-center gap-3 md:flex">
            <a
              href="#trailers"
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              Trailers
            </a>
            <a
              href="#gallery"
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              Gallery
            </a>
            <a
              href={generalEnquiryLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              WhatsApp
            </a>
          </nav>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-16 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-16">
        <div>
          <div className="inline-flex rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-1.5 text-sm text-amber-200">
            Premium rugged trailer hire
          </div>

          <h2 className="mt-6 max-w-4xl text-4xl font-bold leading-tight text-white md:text-6xl">
            Car transporter trailer hire in{' '}
            <span className="text-amber-300">Bunclody, Co. Wexford</span>
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
            
            A practical local hire setup for cars, jeeps, vintage
            vehicles and light machinery. Check dates online, then message directly
            on WhatsApp for price and final confirmation.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href="#trailers"
              className="rounded-2xl bg-white px-6 py-3 text-center font-semibold text-black transition hover:scale-[1.01]"
            >
              View trailers
            </a>
            <a
              href={generalEnquiryLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3 text-center font-medium text-white transition hover:border-white/20 hover:bg-white/5"
            >
              General WhatsApp enquiry
            </a>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {['Cars', 'Jeeps', 'Vintage', 'Light plant'].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-center text-sm text-white/80 shadow-[0_0_0_1px_rgba(255,255,255,0.01)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[2.25rem] bg-amber-400/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl">
            <img
              src="/images/hero.jpg"
              alt="Car transporter trailer ready for hire in Bunclody Co. Wexford"
              className="h-[320px] w-full object-cover md:h-[460px]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-6">
              <div className="max-w-md rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-amber-300">
                  Local trailer hire
                </p>
                <p className="mt-2 text-xl font-semibold text-white">
                  Straightforward booking flow
                </p>
                <p className="mt-1 text-sm text-white/70">
                  Pick your trailer, check your dates, then WhatsApp for price and
                  confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="trailers" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.22em] text-amber-300">
            Available trailers
          </p>
          <h3 className="mt-3 text-3xl font-bold md:text-4xl">
            Two premium rugged transporter options
          </h3>
          <p className="mt-4 max-w-2xl text-white/65">
            Clean, practical cards with a premium dark finish, ready for enquiries
            and date checks.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {TRAILERS.map((trailer) => {
            const trailerGeneralLink = buildWhatsAppUrl(
              `Hi, I’m enquiring about ${trailer.name}. I’m looking to hire a car transporter from Bunclody, Co. Wexford. Can you send availability and price please?`
            );

            return (
              <article
                key={trailer.id}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_20px_80px_-30px_rgba(0,0,0,0.85)]"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={trailer.image}
                    alt={trailer.name}
                    className="h-72 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute left-5 top-5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
                    {trailer.badge}
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-xs uppercase tracking-[0.24em] text-amber-300">
                    Flatbed transporter
                  </p>
                  <h4 className="mt-2 text-2xl font-semibold text-white">
                    {trailer.name}
                  </h4>
                  <p className="mt-3 text-white/70">{trailer.subtitle}</p>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                      <p className="mb-3 text-sm font-semibold text-white">Best for</p>
                      <ul className="space-y-2 text-sm text-white/70">
                        {trailer.uses.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-[2px] text-amber-300">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-semibold text-white">Highlights</p>
                      <ul className="space-y-2 text-sm text-white/70">
                        {trailer.features.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-[2px] text-amber-300">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => openChecker(trailer)}
                      className="rounded-2xl bg-white px-5 py-3 font-semibold text-black transition hover:scale-[1.01]"
                    >
                      Check availability
                    </button>

                    <a
                      href={trailerGeneralLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-center font-medium text-white transition hover:border-white/20 hover:bg-white/5"
                    >
                      WhatsApp enquiry
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="gallery" className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-amber-300">Gallery</p>
            <h3 className="mt-3 text-3xl font-bold md:text-4xl">
              Built for practical local work
            </h3>
            <p className="mt-4 max-w-xl text-white/70">
              From private collections and project cars to jeep moves and light
              machinery jobs, the setup is designed to feel solid, local and
              reliable.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                'DoneDeal collections',
                'Vintage transport',
                'Project cars',
                'Trade jobs',
                'Local and county runs',
                'Light machinery moves',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white/80"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {GALLERY.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className={`overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] ${
                  index === 0 ? 'col-span-2' : ''
                }`}
              >
                <img
                  src={src}
                  alt={`Trailer hire gallery image ${index + 1}`}
                  className={`w-full object-cover transition duration-500 hover:scale-[1.03] ${
                    index === 0 ? 'h-80' : 'h-48'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: '1. Pick your trailer',
              text: 'Choose the transporter that suits the vehicle or job.',
            },
            {
              title: '2. Check your dates',
              text: 'Use the built-in date checker connected to your availability route.',
            },
            {
              title: '3. WhatsApp to confirm',
              text: 'Send a prefilled message for price, confirmation or alternatives.',
            },
          ].map((step) => (
            <div
              key={step.title}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"
            >
              <p className="text-sm uppercase tracking-[0.22em] text-amber-300">How it works</p>
              <h4 className="mt-3 text-xl font-semibold text-white">{step.title}</h4>
              <p className="mt-3 text-white/70">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-6 pb-20 pt-6">
        <div className="grid items-center gap-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] p-8 md:p-10 lg:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-amber-300">Contact</p>
            <h3 className="mt-3 text-3xl font-bold md:text-4xl">
              Based in Bunclody, Co. Wexford
            </h3>
            <p className="mt-4 max-w-xl text-white/70">
              Message directly on WhatsApp for price, availability confirmation and
              general hire enquiries.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
            <a
              href={generalEnquiryLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-white px-6 py-4 text-center font-semibold text-black transition hover:scale-[1.01]"
            >
              Message on WhatsApp
            </a>
            <a
              href={`tel:+${PHONE_NUMBER}`}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 text-center font-medium text-white transition hover:border-white/20 hover:bg-white/5"
            >
              Call now
            </a>
          </div>
        </div>
      </section>

      {selectedTrailer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={closeChecker}
        >
          <div
            className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-neutral-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-amber-300">
                  Availability checker
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {selectedTrailer.name}
                </h3>
                <p className="mt-2 max-w-xl text-white/60">
                  Select your dates and check availability. Then send a prefilled
                  WhatsApp enquiry to confirm and get the price.
                </p>
              </div>

              <button
                onClick={closeChecker}
                aria-label="Close availability modal"
                className="rounded-full border border-white/10 px-3 py-2 text-xl leading-none text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="start-date" className="mb-2 block text-sm text-white/70">
                  Start date
                </label>
                <input
                  id="start-date"
                  type="date"
                  min={today}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-amber-300/40"
                />
              </div>

              <div>
                <label htmlFor="end-date" className="mb-2 block text-sm text-white/70">
                  End date
                </label>
                <input
                  id="end-date"
                  type="date"
                  min={startDate || today}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-amber-300/40"
                />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                onClick={checkAvailability}
                disabled={loading}
                className="rounded-2xl bg-white px-5 py-3 font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Checking...' : 'Check now'}
              </button>

              <a
                href={selectedTrailerGeneralLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-center font-medium text-white transition hover:border-white/20 hover:bg-white/5"
              >
                General enquiry
              </a>
            </div>

            {result && (
              <div
                className={`mt-5 rounded-2xl border p-5 ${
                  result.status === 'available'
                    ? 'border-emerald-400/25 bg-emerald-400/10'
                    : result.status === 'unavailable'
                    ? 'border-amber-400/25 bg-amber-400/10'
                    : 'border-red-400/25 bg-red-400/10'
                }`}
              >
                <p
                  className={`font-semibold ${
                    result.status === 'available'
                      ? 'text-emerald-200'
                      : result.status === 'unavailable'
                      ? 'text-amber-200'
                      : 'text-red-200'
                  }`}
                >
                  {result.message}
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={resultAwareLink}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-white px-5 py-3 text-center font-semibold text-black transition hover:scale-[1.01]"
                  >
                    Message about these dates
                  </a>

                  <a
                    href={dateSpecificLink}
                    target="_blank"
                    rel="noreferrer"
                    className={`rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-center font-medium text-white transition hover:border-white/20 hover:bg-white/5 ${
                      !canSendDateSpecific ? 'pointer-events-none opacity-50' : ''
                    }`}
                  >
                    Send date-specific enquiry
                  </a>
                </div>
              </div>
            )}

            {!result && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm text-white/65">
                  You can also skip the checker and send a date-specific WhatsApp
                  enquiry directly once your dates are selected.
                </p>

                <div className="mt-4">
                  <a
                    href={dateSpecificLink}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-center font-medium text-white transition hover:border-white/20 hover:bg-white/5 ${
                      !canSendDateSpecific ? 'pointer-events-none opacity-50' : ''
                    }`}
                  >
                    Send date-specific enquiry
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}