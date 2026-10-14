/**
 * AI text generation through any OpenAI-compatible chat API.
 *
 * Works with Google Gemini (default), Groq, OpenRouter, Mistral, OpenAI,
 * and Claude's OpenAI-compatible endpoint. Switch provider in .env:
 *   AI_API_KEY   — the provider's API key (required)
 *   AI_BASE_URL  — the provider's OpenAI-compatible URL (default: Gemini)
 *   AI_MODEL     — the model name (default: gemini-3.8-flash)
 *   AI_FALLBACK_MODELS — backup models to try when the main one is busy,
 *                  comma-separated (default: gemini-3.5-flash; "" for none)
 */

const DEFAULT_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai';
const DEFAULT_MODEL = 'gemini-3.8-flash';
const DEFAULT_FALLBACK_MODELS = 'gemini-3.5-flash';
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
  retryable: boolean;
  tryNextModel: boolean;

  constructor(
    message: string,
    public userMessage: string,
    public status = 503,
    flags: { retryable?: boolean; tryNextModel?: boolean } = {}
  ) {
    super(message);
    this.name = 'AIError';
    this.retryable = flags.retryable ?? false;
    this.tryNextModel = flags.tryNextModel ?? false;
  }
}

export const AI_NOT_CONFIGURED_MESSAGE =
  'AI features are not set up yet. Add AI_API_KEY to your .env file to turn them on.';

export function isAIConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY);
}

/** Statuses worth retrying: rate limited, or the model is overloaded. */
const RETRYABLE = new Set([429, 500, 502, 503, 504]);
/** Wait between attempts on the same model (ms). */
const RETRY_DELAYS = [1000, 3000];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** The main model followed by any backups from AI_FALLBACK_MODELS (comma-separated). */
function modelsToTry(): string[] {
  const primary = process.env.AI_MODEL || DEFAULT_MODEL;
  const fallbacks = (process.env.AI_FALLBACK_MODELS ?? DEFAULT_FALLBACK_MODELS)
    .split(',')
    .map(m => m.trim())
    .filter(m => m && m !== primary);
  return [primary, ...fallbacks];
}

/**
 * Send a conversation to the AI and return its reply text.
 * Busy or overloaded models are retried a couple of times, then the
 * backup models are tried in order.
 */
export async function generateText(messages: ChatMessage[], options: ChatOptions = {}): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new AIError('AI_API_KEY is not set', AI_NOT_CONFIGURED_MESSAGE, 503);
  }

  let lastError: AIError | undefined;
  for (const model of modelsToTry()) {
    for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
      if (attempt > 0) await sleep(RETRY_DELAYS[attempt - 1]);
      try {
        return await requestOnce(apiKey, model, messages, options);
      } catch (error) {
        if (!(error instanceof AIError)) throw error;
        lastError = error;
        if (error.retryable) continue; // same model again
        if (error.tryNextModel) break; // move on to the backup model
        throw error;
      }
    }
  }
  throw lastError!;
}

async function requestOnce(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  options: ChatOptions
): Promise<string> {
  const baseUrl = (process.env.AI_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const body: Record<string, unknown> = { model, messages };
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
      `AI request to ${model} failed: ${error instanceof Error ? error.message : String(error)}`,
      'The AI service took too long or could not be reached. Please try again.',
      503,
      { tryNextModel: true }
    );
  }

  if (!response.ok) {
    const detail = (await response.text().catch(() => '')).slice(0, 500);
    if (RETRYABLE.has(response.status)) {
      throw new AIError(
        `AI model ${model} busy (${response.status}): ${detail}`,
        'The AI is very busy right now. Please try again in a minute.',
        503,
        { retryable: true, tryNextModel: true }
      );
    }
    if (response.status === 401 || response.status === 403) {
      throw new AIError(`AI auth failed (${response.status}): ${detail}`, 'The AI key is not valid. Check AI_API_KEY in your .env file.', 503);
    }
    if (response.status === 404) {
      throw new AIError(
        `AI model ${model} or URL not found (404): ${detail}`,
        'The AI model was not found. Check AI_MODEL and AI_BASE_URL in your .env file.',
        503,
        { tryNextModel: true }
      );
    }
    throw new AIError(`AI request to ${model} failed (${response.status}): ${detail}`, 'The AI service returned an error. Please try again.');
  }

  const data = await response.json().catch(() => null);
  const text: unknown = data?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) {
    throw new AIError(`AI model ${model} returned an empty reply`, 'The AI did not return a reply. Please try again.', 503, { tryNextModel: true });
  }
  return text.trim();
}

/** Parse a JSON reply, tolerating markdown code fences around it. */
export function parseJsonReply<T>(text: string): T {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned) as T;
}
