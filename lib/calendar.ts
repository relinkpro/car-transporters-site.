import { google } from 'googleapis';

export async function getCalendarClient() {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;

  console.log('[calendar] GOOGLE_CLIENT_EMAIL present:', !!email);
  console.log('[calendar] GOOGLE_PRIVATE_KEY present:', !!rawKey);
  console.log('[calendar] Key begins correctly:', rawKey?.includes('BEGIN PRIVATE KEY'));
  console.log('[calendar] Key ends correctly:', rawKey?.includes('END PRIVATE KEY'));

  if (!email || !rawKey) {
    throw new Error(
      `Missing Google credentials — CLIENT_EMAIL: ${!!email}, PRIVATE_KEY: ${!!rawKey}`
    );
  }

  const key = rawKey
    .replace(/^["']|["']$/g, '') // strip surrounding quotes if accidentally included when adding to Vercel
    .replace(/\\n/g, '\n')        // convert literal \n to real newlines
    .trim();

  // Verify key shape after processing — catches quote-stripping failures and bad formatting
  console.log('[calendar] key first 30 chars:', JSON.stringify(key.slice(0, 30)));
  console.log('[calendar] key last 30 chars:', JSON.stringify(key.slice(-30)));
  console.log('[calendar] key has valid PEM header:', key.startsWith('-----BEGIN PRIVATE KEY-----'));
  console.log('[calendar] key has valid PEM footer:', key.includes('-----END PRIVATE KEY-----'));

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  });

  try {
    await auth.authorize();
    console.log('[calendar] auth.authorize() succeeded');
  } catch (authErr: any) {
    console.error('[calendar] auth.authorize() FAILED');
    console.error('[calendar] auth error message:', authErr?.message);
    console.error('[calendar] auth error code:', authErr?.code);
    console.error('[calendar] auth error response:', JSON.stringify(authErr?.response?.data ?? null));
    throw authErr;
  }

  return google.calendar({ version: 'v3', auth });
}