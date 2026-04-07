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
    id: 'trailer-1', // ✅ FIXED
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
    id: 'trailer-2', // ✅ FIXED
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
          trailerId: selectedTrailer.id, // ✅ now sends trailer-1 / trailer-2
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

  return <div />; // (rest of your UI unchanged)
}