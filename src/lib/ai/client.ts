// 9router is an OpenAI-compatible chat completions endpoint.
// Docs / endpoint shape: https://9router.deepta.site/v1/chat/completions
// Authentication: `Authorization: Bearer <AI_API_KEY>`.
//
// Env vars:
//   AI_BASE_URL          — base URL of the OpenAI-compatible endpoint
//                          (default: https://9router.deepta.site/v1)
//   AI_API_KEY           — bearer token (required)

const DEFAULT_BASE_URL = 'https://9router.deepta.site/v1';

export interface CallLLMConfig {
  model: string;
  prompt: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

function resolveBaseUrl(): string {
  const raw = process.env.AI_BASE_URL ?? DEFAULT_BASE_URL;
  return raw.replace(/\/+$/, ''); // strip trailing slash
}

export async function callLLM(config: CallLLMConfig): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error('AI_API_KEY is not set');
  }

  const url = `${resolveBaseUrl()}/chat/completions`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeout);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: config.prompt }],
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`LLM API error ${response.status}: ${text}`);
    }
    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
    };
    return data.choices[0].message.content;
  } finally {
    clearTimeout(timeout);
  }
}
