import { google } from 'googleapis';

export async function getCalendarClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail) {
    throw new Error('Missing GOOGLE_CLIENT_EMAIL in .env.local');
  }

  if (!privateKey) {
    throw new Error('Missing GOOGLE_PRIVATE_KEY in .env.local');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  });

  // ✅ FIX: pass auth directly (NOT authClient)
  return google.calendar({
    version: 'v3',
    auth,
  });
}