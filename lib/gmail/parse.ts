import { ParsedEmail } from '@/types';

interface RawMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

export function parseEmail(raw: RawMessage): ParsedEmail {
  const { from_name, from_email } = parseFrom(raw.from);

  return {
    gmail_message_id: raw.id,
    gmail_thread_id: raw.threadId,
    subject: raw.subject || '(no subject)',
    from_email,
    from_name,
    received_at: new Date(raw.date || Date.now()),
    snippet: raw.snippet,
  };
}

function parseFrom(from: string): { from_name: string; from_email: string } {
  // Formats: "Name <email@example.com>" or just "email@example.com"
  const match = from.match(/^(.*?)\s*<([^>]+)>$/);
  if (match) {
    return {
      from_name: match[1].trim().replace(/^"|"$/g, ''),
      from_email: match[2].trim().toLowerCase(),
    };
  }
  return {
    from_name: '',
    from_email: from.trim().toLowerCase(),
  };
}
