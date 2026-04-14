import { NextRequest, NextResponse } from 'next/server';
import { getCalendarClient } from '@/lib/calendar';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { trailerId, startDate, endDate } = await req.json();

    console.log('[availability] trailerId received:', trailerId);

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

    const calendarMap: Record<string, string | undefined> = {
      'trailer-1': process.env.TRAILER_1_CALENDAR_ID,
      'trailer-2': process.env.TRAILER_2_CALENDAR_ID,
    };

    console.log(
      '[availability] TRAILER_1_CALENDAR_ID set:',
      !!process.env.TRAILER_1_CALENDAR_ID
    );
    console.log(
      '[availability] TRAILER_2_CALENDAR_ID set:',
      !!process.env.TRAILER_2_CALENDAR_ID
    );

    const calendarId = calendarMap[trailerId];

    console.log(
      '[availability] resolved calendarId:',
      calendarId ? 'found' : 'missing'
    );

    if (!calendarId) {
      return NextResponse.json(
        { error: 'Calendar not configured for this trailer.' },
        { status: 500 }
      );
    }

    // Stage: Google auth — isolated so auth failures are distinct from calendar errors
    let calendar: Awaited<ReturnType<typeof getCalendarClient>>;
    try {
      calendar = await getCalendarClient();
      console.log('[availability] getCalendarClient() succeeded');
    } catch (authErr: any) {
      const googleErr = authErr?.response?.data?.error ?? null;
      console.error('[availability] AUTH STAGE failed:', authErr?.message);
      return NextResponse.json(
        {
          error: 'Google authentication failed.',
          stage: 'auth',
          details: authErr?.message ?? 'Unknown auth error',
          code: authErr?.code ?? null,
          apiError: googleErr,
        },
        { status: 500 }
      );
    }

    // Stage: calendar.events.list — isolated so permission/sharing errors are distinct
    const timeMin = new Date(`${startDate}T00:00:00`).toISOString();
    const timeMax = new Date(`${endDate}T23:59:59`).toISOString();

    console.log('[availability] calling events.list for calendarId:', calendarId);

    let available = false;
    try {
      const response = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });
      console.log('[availability] events.list succeeded');
      available = (response.data.items ?? []).length === 0;
    } catch (calErr: any) {
      const googleErr = calErr?.response?.data?.error ?? null;
      console.error('[availability] CALENDAR STAGE failed:', calErr?.message);
      console.error('[availability] calendar error status:', googleErr?.status);
      console.error('[availability] calendar error message:', googleErr?.message);
      return NextResponse.json(
        {
          error: 'Google Calendar lookup failed.',
          stage: 'events.list',
          details: calErr?.message ?? 'Unknown calendar error',
          code: calErr?.code ?? googleErr?.code ?? null,
          apiError: googleErr,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ available });
  } catch (error: any) {
    // Fallback for unexpected errors outside the staged blocks
    console.error('[availability] unexpected error:', error?.message);
    return NextResponse.json(
      {
        error: 'Unexpected error checking availability.',
        stage: 'unknown',
        details: error?.message ?? 'Unknown error',
        code: error?.code ?? null,
        apiError: error?.response?.data?.error ?? null,
      },
      { status: 500 }
    );
  }
}