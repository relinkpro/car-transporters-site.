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

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function Page() {
  const generalEnquiryLink = buildWhatsAppUrl(
    "Hi, I’m looking to hire a car transporter in Bunclody, Co. Wexford. Can you send details, availability and price please?"
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-white">

      {/* HEADER */}
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

          <a
            href={generalEnquiryLink}
            target="_blank"
            className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            📲 WhatsApp
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-6 py-16">

        {/* 🔥 FIXED: H1 instead of H2 */}
        <h1 className="text-4xl font-bold md:text-6xl">
          Car transporter trailer hire in{" "}
          <span className="text-amber-300">Bunclody, Co. Wexford</span>
        </h1>

        <p className="mt-5 max-w-2xl text-white/70">
          A practical local hire setup for cars, jeeps, vintage vehicles and light machinery.
        </p>

        {/* 🔥 ADDED */}
        <p className="mt-3 text-white/60">
          Based in Bunclody — covering Wexford and surrounding areas.
        </p>

        <div className="mt-8 flex gap-4">
          <a href="#trailers" className="bg-white text-black px-6 py-3 rounded-xl">
            View trailers
          </a>

          {/* 🔥 FIXED CTA */}
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
                <button className="bg-white text-black px-4 py-2 rounded">
                  Check availability
                </button>

                {/* 🔥 FIXED CTA */}
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

        {/* 🔥 ADDED */}
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