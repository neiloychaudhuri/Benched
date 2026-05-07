import { gmail_v1 } from 'googleapis';
import { createGmailClient } from './client';
import { parseEmail } from './parse';
import { ParsedEmail } from '@/types';

const RECRUITING_QUERY =
  'subject:(application OR interview OR offer OR "your application" OR "we received" OR "thank you for applying" OR "moving forward" OR "next steps" OR position OR opportunity OR internship OR "co-op" OR job OR role OR hiring OR recruiter OR assessment OR rejected OR unfortunately)';

const MAX_RESULTS = 500;

export async function fetchEmails(
  accessToken: string,
  lastSyncedAt: Date | null
): Promise<ParsedEmail[]> {
  const gmail = createGmailClient(accessToken);

  let query = RECRUITING_QUERY;
  if (lastSyncedAt) {
    const epochSeconds = Math.floor(lastSyncedAt.getTime() / 1000);
    query += ` after:${epochSeconds}`;
  } else {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const epochSeconds = Math.floor(sixMonthsAgo.getTime() / 1000);
    query += ` after:${epochSeconds}`;
  }

  const messageIds: string[] = [];
  let pageToken: string | undefined;

  do {
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 100,
      pageToken,
    });

    const messages = res.data.messages || [];
    messageIds.push(...messages.map((m) => m.id!).filter(Boolean));
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken && messageIds.length < MAX_RESULTS);

  const limited = messageIds.slice(0, MAX_RESULTS);

  const parsed: ParsedEmail[] = [];
  const BATCH = 10;

  for (let i = 0; i < limited.length; i += BATCH) {
    const batch = limited.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map((id) =>
        gmail.users.messages.get({
          userId: 'me',
          id,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date'],
        })
      )
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const email = parseGmailMessage(result.value.data);
        if (email) parsed.push(email);
      }
    }
  }

  return parsed;
}

function parseGmailMessage(
  msg: gmail_v1.Schema$Message
): ParsedEmail | null {
  try {
    const headers = msg.payload?.headers || [];
    const get = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
        ?.value ?? '';

    return parseEmail({
      id: msg.id!,
      threadId: msg.threadId!,
      subject: get('Subject'),
      from: get('From'),
      date: get('Date'),
      snippet: msg.snippet ?? '',
    });
  } catch {
    return null;
  }
}
