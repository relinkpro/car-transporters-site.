import { NextRequest, NextResponse } from 'next/server';
import { getCalendarClient } from '@/lib/calendar';

export const runtime = 'nodejs';

const calendarMap: Record<string, string | undefined> = {
  'flatbed-1': process.env.TRAILER_1_CALENDAR_ID,
  'flatbed-2': process.env.TRAILER_2_CALENDAR_ID,
};

export async function POST(req: NextRequest) {
  try {
    const { trailerId, startDate, endDate } = await req.json();

    if (!trailerId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    if (endDate < startDate) {
      return NextResponse.json(
        { error: 'End date must be after start date.' },
        { status: 400 }
      );
    }

    const calendarId = calendarMap[trailerId];

    if (!calendarId) {
      return NextResponse.json(
        { error: 'Invalid trailer ID.' },
        { status: 400 }
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
    const available = events.length === 0;

    return NextResponse.json({ available });
  } catch (error: any) {
    console.error('Availability check failed:', error?.response?.data || error?.message || error);

    return NextResponse.json(
      {
        error: 'Failed to check availability.',
        details: error?.response?.data || error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}