import { GoogleGenerativeAI } from '@google/generative-ai';
import { ClassificationResult, ParsedEmail } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are an expert at analyzing job application emails for university students. Your job is to classify each email as either recruiting-related or not, and if recruiting-related, extract structured data from it.

For each email, return a JSON object with these exact fields:
{
  "is_recruiting_related": boolean,
  "company_name": string | null,
  "role_title": string | null,
  "stage": one of: "applied" | "recruiter_outreach" | "phone_screen" | "interview_scheduled" | "assessment" | "final_round" | "offer" | "rejected" | null,
  "confidence": number between 0 and 1,
  "reasoning": string (one sentence)
}

Stage classification rules:
- "applied": application confirmation, "we received your application", "thank you for applying"
- "recruiter_outreach": a recruiter reaching out to the candidate proactively
- "phone_screen": scheduling or confirming a phone/video screening call
- "interview_scheduled": a formal interview (technical, behavioral, panel) scheduled or confirmed
- "assessment": a take-home assignment, coding challenge, or online test
- "final_round": final interview stage or superday
- "offer": a job or internship offer extended
- "rejected": rejection at any stage, "we've decided to move forward with other candidates"

If the email is not related to recruiting, job applications, or career opportunities, set is_recruiting_related to false and all other fields to null.

Do not classify automated newsletters, job alerts, or LinkedIn digests as recruiting-related unless they represent direct outreach from a recruiter.`;

const BATCH_SIZE = 10;
const PARALLEL = 5; // run 5 batches concurrently

export async function classifyEmails(
  emails: ParsedEmail[]
): Promise<(ClassificationResult | null)[]> {
  const batches: ParsedEmail[][] = [];
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    batches.push(emails.slice(i, i + BATCH_SIZE));
  }

  const results: (ClassificationResult | null)[] = new Array(emails.length).fill(null);

  for (let i = 0; i < batches.length; i += PARALLEL) {
    const chunk = batches.slice(i, i + PARALLEL);
    const settled = await Promise.allSettled(chunk.map((b) => classifyBatch(b)));
    for (let j = 0; j < settled.length; j++) {
      const batchIndex = i + j;
      const startIdx = batchIndex * BATCH_SIZE;
      if (settled[j].status === 'fulfilled') {
        const batchResults = (settled[j] as PromiseFulfilledResult<(ClassificationResult | null)[]>).value;
        batchResults.forEach((r, k) => { results[startIdx + k] = r; });
      }
    }
  }

  return results;
}

const BATCH_TIMEOUT_MS = 30_000;

async function classifyBatch(
  emails: ParsedEmail[]
): Promise<(ClassificationResult | null)[]> {
  const emailsText = emails
    .map(
      (email, idx) =>
        `Email ${idx + 1}:\nFrom: ${email.from_name} <${email.from_email}>\nSubject: ${email.subject}\nSnippet: ${email.snippet}`
    )
    .join('\n\n');

  const prompt = `Classify the following emails. Return a JSON array where each element corresponds to one email in order.\n\n${emailsText}`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        // @ts-expect-error - thinkingConfig is supported but not yet typed
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini timeout')), BATCH_TIMEOUT_MS)
      ),
    ]);
    const text = result.response.text();

    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed)) {
      return emails.map(() => null);
    }

    return parsed.map((item) => {
      if (!item || typeof item !== 'object') return null;
      return item as ClassificationResult;
    });
  } catch (err) {
    console.error('Gemini classification error:', err);
    return emails.map(() => null);
  }
}
