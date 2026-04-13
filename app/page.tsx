'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Trailer = {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  badge: string;
};

type AvailabilityResult = {
  status: 'available' | 'unavailable' | 'error';
  message: string;
};

const TRAILERS: Trailer[] = [
  {
    id: 'trailer-1',
    name: 'Car Transporter Trailer 1',
    subtitle: 'Ideal for cars, jeeps and light machinery.',
    image: '/images/hero.jpg',
    badge: 'Popular',
  },
  {
    id: 'trailer-2',
    name: 'Car Transporter Trailer 2',
    subtitle: 'Heavy-duty option for trade and long distance.',
    image: '/images/gallery1.jpg',
    badge: 'Heavy Duty',
  },
];

export default function Page() {
  const [selectedTrailer, setSelectedTrailer] = useState<Trailer | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const checkAvailability = async () => {
    if (!selectedTrailer || !startDate || !endDate) {
      setResult({
        status: 'error',
        message: 'Please select dates.',
      });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const res = await fetch('/api/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trailerId: selectedTrailer.id,
          startDate,
          endDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({
          status: 'error',
          message: data.error || 'Error checking availability',
        });
        return;
      }

      setResult({
        status: data.available ? 'available' : 'unavailable',
        message: data.available
          ? 'Available for selected dates'
          : 'Not available for those dates',
      });
    } catch {
      setResult({
        status: 'error',
        message: 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Trailer Hire Bunclody</h1>

      {/* TRAILERS */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        {TRAILERS.map((trailer) => (
          <div
            key={trailer.id}
            style={{
              border: '1px solid #ccc',
              padding: '15px',
              width: '250px',
            }}
          >
            <img
              src={trailer.image}
              alt={trailer.name}
              style={{ width: '100%', height: '150px', objectFit: 'cover' }}
            />
            <h3>{trailer.name}</h3>
            <p>{trailer.subtitle}</p>
            <button onClick={() => setSelectedTrailer(trailer)}>
              Check Availability
            </button>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedTrailer && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ background: '#fff', padding: '20px', width: '300px' }}>
            <h2>{selectedTrailer.name}</h2>

            <input
              type="date"
              min={today}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <input
              type="date"
              min={startDate || today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ marginTop: '10px' }}
            />

            <div style={{ marginTop: '10px' }}>
              <button onClick={checkAvailability} disabled={loading}>
                {loading ? 'Checking...' : 'Check'}
              </button>

              <button
                onClick={() => setSelectedTrailer(null)}
                style={{ marginLeft: '10px' }}
              >
                Close
              </button>
            </div>

            {result && (
              <p style={{ marginTop: '10px' }}>{result.message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}