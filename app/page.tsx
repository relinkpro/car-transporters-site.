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
        `Hi, I’m enquiring about ${selectedTrailer.name} from ${formatDisplayDate(
          startDate
        )} to ${formatDisplayDate(
          endDate
        )}. Can you confirm availability and send me the price please?`
      )
    : '#';

  const canSendDateSpecific = Boolean(selectedTrailer && startDate && endDate);

  const checkAvailability = async () => {
    if (!selectedTrailer || !startDate || !endDate) {
      setResult({
        status: 'error',
        message: 'Please select both dates.',
      });
      return;
    }

    if (endDate < startDate) {
      setResult({
        status: 'error',
        message: 'End date must be after start date.',
      });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const response = await fetch('/api/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trailerId: selectedTrailer.id,
          startDate,
          endDate,
        }),
      });

      const data = await response.json();

      setResult({
        status: data.available ? 'available' : 'unavailable',
        message: data.available
          ? 'Looks available for those dates.'
          : 'Not available for those dates.',
      });
    } catch {
      setResult({
        status: 'error',
        message: 'Error checking availability.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white">

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="text-4xl font-bold md:text-6xl">
          Car transporter trailer hire in{' '}
          <span className="text-amber-300">Bunclody, Co. Wexford</span>
        </h1>

        <p className="mt-5 max-w-2xl text-white/70">
          Trailer hire for cars, jeeps, vintage vehicles and machinery. Check
          dates online, then message directly on WhatsApp for price and
          confirmation.
        </p>

        <p className="mt-3 text-white/60">
          Based in Bunclody — covering Wexford and surrounding areas.
        </p>

        <div className="mt-8 flex gap-4">
          <a href="#trailers" className="bg-white text-black px-6 py-3 rounded-xl">
            View trailers
          </a>
          <a href={generalEnquiryLink} target="_blank" className="border px-6 py-3 rounded-xl">
            📲 Message on WhatsApp for price & availability
          </a>
        </div>
      </section>

      {/* TRAILERS */}
      <section id="trailers" className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {TRAILERS.map((trailer) => (
            <div key={trailer.id} className="border p-6 rounded-xl">
              <img src={trailer.image} className="mb-4 rounded" />

              <h2 className="text-2xl font-bold">{trailer.name}</h2>
              <p className="text-white/70 mt-2">{trailer.subtitle}</p>

              <div className="mt-6 flex gap-3">
                <button onClick={() => openChecker(trailer)} className="bg-white text-black px-4 py-2 rounded">
                  Check availability
                </button>

                <a href={generalEnquiryLink} target="_blank" className="border px-4 py-2 rounded">
                  📲 Message on WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Based in Bunclody, Co. Wexford</h2>

        <p className="mt-4 text-white/70">
          Message directly on WhatsApp for price and availability.
        </p>

        <p className="mt-2 text-white/60">
          Weekend bookings fill fast — message early.
        </p>

        <a href={generalEnquiryLink} className="inline-block mt-6 bg-white text-black px-6 py-3 rounded-xl">
          📲 Message on WhatsApp for price & availability
        </a>
      </section>
    </main>
  );
}