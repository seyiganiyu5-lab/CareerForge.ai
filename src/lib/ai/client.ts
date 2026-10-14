/**
 * AI text generation through any OpenAI-compatible chat API.
 *
 * Works with Google Gemini (default), Groq, OpenRouter, Mistral, OpenAI,
 * and Claude's OpenAI-compatible endpoint. Switch provider in .env:
 *   AI_API_KEY   — the provider's API key (required)
 *   AI_BASE_URL  — the provider's OpenAI-compatible URL (default: Gemini)
 *   AI_MODEL     — the model name (default: gemini-3.8-flash)
 */

const DEFAULT_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai';
const DEFAULT_MODEL = 'gemini-3.8-flash';
const TIMEOUT_MS = 60_000;

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  /** Ask the model to reply with a JSON object */
  json?: boolean;
}

/** Thrown for any AI failure; `userMessage` is safe to show in the app. */
export class AIError extends Error {
  constructor(message: string, public userMessage: string, public status = 503) {
    super(message);
    this.name = 'AIError';
  }
}

export const AI_NOT_CONFIGURED_MESSAGE =
  'AI features are not set up yet. Add AI_API_KEY to your .env file to turn them on.';

export function isAIConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY);
}

/** Send a conversation to the AI and return its reply text. */
export async function generateText(messages: ChatMessage[], options: ChatOptions = {}): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new AIError('AI_API_KEY is not set', AI_NOT_CONFIGURED_MESSAGE, 503);
  }

  const baseUrl = (process.env.AI_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const body: Record<string, unknown> = {
    model: process.env.AI_MODEL || DEFAULT_MODEL,
    messages,
  };
  if (options.temperature !== undefined) body.temperature = options.temperature;
  if (options.maxTokens !== undefined) body.max_tokens = options.maxTokens;
  if (options.json) body.response_format = { type: 'json_object' };

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw new AIError(
      `AI request failed: ${error instanceof Error ? error.message : String(error)}`,
      'The AI service took too long or could not be reached. Please try again.'
    );
  }

  if (!response.ok) {
    const detail = (await response.text().catch(() => '')).slice(0, 500);
    if (response.status === 429) {
      throw new AIError(`AI rate limit (429): ${detail}`, 'The AI is busy right now (usage limit reached). Please try again in a minute.', 429);
    }
    if (response.status === 401 || response.status === 403) {
      throw new AIError(`AI auth failed (${response.status}): ${detail}`, 'The AI key is not valid. Check AI_API_KEY in your .env file.', 503);
    }
    if (response.status === 404) {
      throw new AIError(`AI model or URL not found (404): ${detail}`, 'The AI model was not found. Check AI_MODEL and AI_BASE_URL in your .env file.', 503);
    }
    throw new AIError(`AI request failed (${response.status}): ${detail}`, 'The AI service returned an error. Please try again.');
  }

  const data = await response.json().catch(() => null);
  const text: unknown = data?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) {
    throw new AIError('AI returned an empty reply', 'The AI did not return a reply. Please try again.');
  }
  return text.trim();
}

/** Parse a JSON reply, tolerating markdown code fences around it. */
export function parseJsonReply<T>(text: string): T {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned) as T;
}
