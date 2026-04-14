import { NextRequest, NextResponse } from 'next/server';
import { getCalendarClient } from '@/lib/calendar';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { trailerId, startDate, endDate } = await req.json();

    // Diagnostic: confirm what the handler receives and what env vars are live
    console.log('[availability] trailerId received:', JSON.stringify(trailerId));
    console.log('[availability] TRAILER_1_CALENDAR_ID set:', !!process.env.TRAILER_1_CALENDAR_ID);
    console.log('[availability] TRAILER_2_CALENDAR_ID set:', !!process.env.TRAILER_2_CALENDAR_ID);

    if (!trailerId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // Evaluated inside the handler so it always reads live env vars
    const calendarMap: Record<string, string | undefined> = {
      'trailer-1': process.env.TRAILER_1_CALENDAR_ID,
      'trailer-2': process.env.TRAILER_2_CALENDAR_ID,
    };

    const calendarId = calendarMap[trailerId];

    console.log('[availability] resolved calendarId:', calendarId ? 'found' : 'undefined');

    if (!calendarId) {
      return NextResponse.json(
        { error: 'Calendar not configured for this trailer.' },
        { status: 500 }
      );
    }

    const calendar = await getCalendarClient();

    const timeMin = new Date(`${startDate}T00:00:00`).toISOString();
    const timeMax = new Date(`${endDate}T23:59:59`).toISOString();

    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    return NextResponse.json({
      available: events.length === 0,
    });
  } catch (error: any) {
    console.error('[availability] FULL ERROR:', error);
    console.error('[availability] error.message:', error?.message);
    console.error('[availability] error.code:', error?.code);
    console.error('[availability] error.response.data:', JSON.stringify(error?.response?.data ?? null));

    return NextResponse.json(
      {
        error: 'Failed to check availability.',
        details: error?.message,
        // googleapis wraps the real API error in error.response.data, not error.message
        apiError: error?.response?.data?.error?.message ?? error?.errors?.[0]?.message ?? null,
        code: error?.code ?? null,
      },
      { status: 500 }
    );
  }
}