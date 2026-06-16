# 05 — AI And Email Plan

## Goals

1. AI categorizer reduces manual category selection.
2. Email fetcher finds finance-related emails and creates draft transactions.
3. Monthly AI advisor gives useful advice from aggregated summaries only.
4. Privacy boundary stays strict and visible.

## AI Categorizer

### Flow

1. User creates transaction without category, or email import creates draft.
2. App checks local matching rules first.
3. If no strong local match, app calls LLM categorizer.
4. LLM returns category suggestion, confidence, and reason.
5. User accepts or changes category.
6. Accepted category updates Transaction.
7. Local pattern cache/rules can improve future suggestions if schema allows later.

### Categorizer Input

Allowed:

- transaction amount
- currency
- date
- notes
- account name/type
- known categories
- merchant/payee text from email extraction

Avoid:

- full unrelated transaction history
- unrelated email content
- secrets/tokens
- login/session data

### Categorizer Output

```json
{
  "categoryId": "uuid",
  "categoryName": "Food & Drinks",
  "confidence": 0.87,
  "reason": "Merchant text looks like restaurant or food delivery."
}
```

### Prompt Rules

- Choose only from provided category list.
- Return JSON only.
- If unclear, return low confidence.
- Never invent category id.
- Prefer user-confirmed local rule when available.

### Batch Categorization

Batch endpoint should:

- Limit batch size, e.g. 20 transactions.
- Include category list once.
- Return suggestion per transaction id.
- Continue if one item unclear.

## Email Finance Fetcher

### Purpose

Email feature helps user find finance-related messages and turn them into transaction drafts. It must not auto-create real transactions without user confirmation.

### Search Sources

Possible providers/integrations:

- Gmail API through user-approved OAuth/app password flow if implemented later
- Manual paste/import as first simple version
- IMAP only if user explicitly wants it later

Do not suggest cloud database or third-party finance sync.

### Finance Email Detection

Search keywords:

- transaction
- payment
- pembayaran
- transaksi
- berhasil
- receipt
- invoice
- tagihan
- kartu kredit
- debit
- credit
- transfer
- GoPay
- OVO
- DANA
- BCA
- Mandiri
- Tokopedia
- Shopee
- Grab
- Gojek
- PLN
- Telkomsel

Sender patterns:

- bank domains
- e-wallet domains
- marketplace domains
- subscription services
- utility companies

### Extraction Flow

1. Fetch/search candidate emails.
2. Deduplicate by provider message id where possible.
3. Parse email snippet/body.
4. Extract amount/date/merchant/payment method/reference.
5. Classify as likely expense/income/transfer/unknown.
6. Build draft transaction.
7. Show review UI.
8. User accepts, edits, ignores, or marks duplicate.
9. Accepted draft creates normal Transaction using API rules.

### Extraction Output

```json
{
  "providerMessageId": "abc123",
  "sender": "noreply@example.com",
  "subject": "Payment successful",
  "receivedAt": "2026-04-18T10:15:00+07:00",
  "merchant": "Gojek",
  "amount": 55000,
  "currency": "IDR",
  "transactionDate": "2026-04-18T10:10:00+07:00",
  "accountHint": "GoPay",
  "paymentMethodHint": "e-wallet",
  "referenceNumber": "REF123",
  "suggestedType": "expense",
  "suggestedCategoryName": "Transport",
  "confidence": 0.82,
  "rawSnippet": "Payment Rp55.000 to Gojek successful"
}
```

### Duplicate Detection

Check:

1. Same provider message id.
2. Same reference number.
3. Same amount + same date + similar merchant/notes.
4. Same amount within ±1 day and same account hint.

Duplicate action:

- Show as possible duplicate.
- Do not create transaction unless user overrides.

## Monthly AI Advice

### Flow

1. End-of-month cron runs report aggregation.
2. App creates or updates `MonthlySummary`.
3. App fetches last 6 `MonthlySummary` records.
4. App sends only summary payloads to LLM.
5. LLM returns advice.
6. App stores result in `MonthlySummary.ai_advice_given`.

### Allowed Monthly Advice Input

- total income
- total expenses
- net cashflow
- savings rate
- category totals
- budget variance
- month-over-month deltas
- last 6 monthly summaries

Forbidden:

- raw transaction rows
- full notes list
- raw email content
- personally sensitive email text

### Advice Output Format

```json
{
  "summary": "Spending improved compared to last month, mainly from lower transport cost.",
  "wins": ["Expenses dropped 8% MoM"],
  "risks": ["Food spending is 25% over budget"],
  "recommendations": [
    "Set Food & Drinks budget to Rp2.000.000 or reduce restaurant orders."
  ],
  "nextMonthFocus": ["Food & Drinks", "Subscriptions"]
}
```

## Privacy Notes

- Categorizer may use one transaction context.
- Email parser may inspect one candidate email snippet/body.
- Monthly advisor may use summaries only.
- User should see what data is sent before enabling AI/email features.

---

## LLM Provider Strategy

## Decision

Use **OpenRouter** as the LLM abstraction layer. This gives access to multiple models through one API key and one endpoint, with easy switching.

## Provider Configuration

| Setting | Value |
|---|---|
| Provider | OpenRouter (https://openrouter.ai/api/v1) |
| API Key Env | `OPENROUTER_API_KEY` |
| Categorizer Model | `google/gemini-2.0-flash-001` (fast, cheap, good at classification) |
| Monthly Advice Model | `anthropic/claude-sonnet-4` (better reasoning for advice) |
| Fallback Model | `google/gemini-2.0-flash-001` (if primary fails) |

## Why OpenRouter

- Single API key for all models
- Compatible with OpenAI SDK format
- Easy model switching without code changes
- Cost tracking dashboard built-in
- No vendor lock-in

## Categorizer Configuration

```typescript
const CATEGORIZER_CONFIG = {
  model: process.env.AI_CATEGORIZER_MODEL || 'google/gemini-2.0-flash-001',
  maxTokens: 500,
  temperature: 0.1,  // low — classification needs consistency
  timeout: 15_000,   // 15 seconds
  retries: 2,
};
```

### Prompt Template

```
You are a transaction categorizer for a personal finance app.
User is in Jakarta, Indonesia. Primary currency is IDR.

Assign exactly ONE category from the list below to this transaction.

Transaction:
- Amount: {amount} {currency}
- Date: {date}
- Account: {accountName} ({accountType})
- Notes: {notes}
- Merchant hint: {merchantHint}

Available categories (id | name):
{categoryList}

Rules:
- Pick ONLY from the provided list
- If unsure, return confidence below 0.5
- Return JSON only, no explanation outside JSON

Respond in this exact JSON format:
{
  "categoryId": "uuid-from-list",
  "categoryName": "name-from-list",
  "confidence": 0.0-1.0,
  "reason": "brief explanation in one sentence"
}
```

### Cost Estimate

- Average prompt: ~300 tokens input, ~100 tokens output
- Gemini Flash cost: ~$0.0001 per categorization
- 100 transactions/month ≈ $0.01/month

## Monthly Advice Configuration

```typescript
const ADVICE_CONFIG = {
  model: process.env.AI_ADVICE_MODEL || 'anthropic/claude-sonnet-4',
  maxTokens: 2000,
  temperature: 0.4,  // moderate — advice benefits from some creativity
  timeout: 60_000,   // 60 seconds
  retries: 1,
};
```

### Prompt Template

```
You are a personal finance advisor for a user in Jakarta, Indonesia.
Primary currency is IDR (Indonesian Rupiah).
Income is often irregular (freelance/gig work).

Analyze the last 6 months of financial summaries below and provide actionable advice.

{summaries}

Respond in this exact JSON format:
{
  "summary": "2-3 sentence overview of financial health and trend",
  "wins": ["positive observation 1", "positive observation 2"],
  "risks": ["concern 1", "concern 2"],
  "recommendations": ["specific action 1", "specific action 2", "specific action 3"],
  "nextMonthFocus": ["category to watch 1", "category to watch 2"]
}

Rules:
- Be specific with IDR amounts
- Reference actual numbers from the summaries
- Keep advice practical and actionable
- Consider Indonesian context (e-wallets, irregular income)
- Never fabricate data not present in summaries
```

### Cost Estimate

- Average prompt: ~2000 tokens input (6 months), ~500 tokens output
- Claude Sonnet cost: ~$0.03 per advice call
- 1 call/month ≈ $0.03/month

## Rate Limiting

### API-Side Limits

```typescript
const RATE_LIMITS = {
  categorize: {
    maxPerMinute: 20,
    maxPerHour: 200,
    maxPerDay: 1000,
  },
  batchCategorize: {
    maxPerMinute: 5,
    maxBatchSize: 20,
  },
  monthlyAdvice: {
    maxPerDay: 3,  // regenerate up to 3x
  },
};
```

### Implementation

Simple in-memory counter per route. Since single-user, no complex rate limiter needed. Reset on app restart is acceptable.

```typescript
// src/lib/ai/rate-limit.ts
const counters = new Map<string, { count: number; resetAt: Date }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = new Date();
  const entry = counters.get(key);
  
  if (!entry || now > entry.resetAt) {
    counters.set(key, { count: 1, resetAt: new Date(now.getTime() + windowMs) });
    return true;
  }
  
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
```

## Error Handling

```typescript
export class LLMError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly retryable: boolean
  ) {
    super(message);
  }
}

async function callLLM(config: LLMConfig, prompt: string): Promise<string> {
  for (let attempt = 0; attempt <= config.retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.timeout);
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'Financial Tracker',
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: config.maxTokens,
          temperature: config.temperature,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      
      if (response.status === 429) {
        throw new LLMError('Rate limited by provider', 429, true);
      }
      if (!response.ok) {
        throw new LLMError(`LLM API error: ${response.status}`, response.status, response.status >= 500);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
      
    } catch (error) {
      if (error instanceof LLMError && !error.retryable) throw error;
      if (attempt === config.retries) throw error;
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw new LLMError('All retries exhausted', 500, false);
}
```

## Cost Guard

Monthly spend ceiling stored in environment:

```env
AI_MONTHLY_BUDGET_USD=5.00
```

Track spend in a simple JSON file or in-memory counter. If ceiling reached, disable AI features with user-visible message until next month.

## Environment Variables

```env
# Required
OPENROUTER_API_KEY=sk-or-...

# Optional (defaults shown)
AI_CATEGORIZER_MODEL=google/gemini-2.0-flash-001
AI_ADVICE_MODEL=anthropic/claude-sonnet-4
AI_MONTHLY_BUDGET_USD=5.00
AI_ENABLED=true
```

## Fallback Strategy

1. Primary model fails → retry with backoff
2. All retries fail → try fallback model
3. Fallback model fails → return error to user
4. Monthly budget exceeded → disable AI, show message
5. Provider down → show "AI temporarily unavailable" in UI

---

## Email Integration Details

## Phase Strategy

### Phase 1 — Manual Paste (MVP)

User copies email content and pastes into the app. App parses it and shows candidate transactions.

No external integration needed. No OAuth. No credentials.

### Phase 2 — Gmail API (post-MVP)

Connect Gmail account via OAuth 2.0. App searches finance-related emails automatically.

### Phase 3 — IMAP (optional, if user wants other providers)

Generic IMAP connection for Outlook, Yahoo, etc.

---

## Phase 1: Manual Paste

### Flow

1. User opens Email Imports page
2. Taps "Paste Email" button
3. Pastes email content (plain text or HTML)
4. App runs parser on pasted content
5. Parser extracts candidate transaction fields
6. Shows preview card with extracted data
7. User edits fields if needed
8. User taps Accept → creates real transaction
9. User taps Ignore → discards

### Parser Implementation

```typescript
// src/lib/email/parse.ts

interface ParsedTransaction {
  merchant: string | null;
  amount: number | null;
  currency: string;
  date: Date | null;
  accountHint: string | null;
  paymentMethod: string | null;
  referenceNumber: string | null;
  suggestedType: 'expense' | 'income' | 'transfer' | 'unknown';
  suggestedCategory: string | null;
  confidence: number;
}

export function parseFinanceEmail(text: string): ParsedTransaction {
  const result: ParsedTransaction = {
    merchant: null,
    amount: null,
    currency: 'IDR',
    date: null,
    accountHint: null,
    paymentMethod: null,
    referenceNumber: null,
    suggestedType: 'unknown',
    suggestedCategory: null,
    confidence: 0,
  };

  // Extract amount patterns
  // "Rp55.000" or "Rp 55.000" or "IDR 55,000" or "55000"
  const amountPatterns = [
    /Rp\s?(\d{1,3}(?:\.\d{3})+)/i,     // Rp55.000 or Rp 55.000
    /IDR\s?(\d{1,3}(?:[.,]\d{3})*)/i,  // IDR 55.000
    /(\d{1,3}(?:\.\d{3})+)\s?(?:rupiah|IDR)/i,
  ];

  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.amount = parseInt(match[1].replace(/\./g, ''), 10);
      result.currency = 'IDR';
      result.confidence += 0.3;
      break;
    }
  }

  // Extract merchant patterns
  const merchantPatterns = [
    /(?:kepada|to|merchant|pembayaran ke|payment to)[:\s]+([^\n,]+)/i,
    /(?:dari|from)[:\s]+([^\n,]+)/i,
  ];
  // ... extract merchant

  // Extract account hints
  const accountKeywords: Record<string, string> = {
    'bca': 'BCA',
    'mandiri': 'Mandiri',
    'gopay': 'GoPay',
    'ovo': 'OVO',
    'dana': 'DANA',
    'credit card': 'Credit Card',
    'kartu kredit': 'Credit Card',
  };
  for (const [keyword, account] of Object.entries(accountKeywords)) {
    if (text.toLowerCase().includes(keyword)) {
      result.accountHint = account;
      result.confidence += 0.1;
      break;
    }
  }

  // Determine type
  if (/pembayaran|payment|purchase|debit|pengeluaran/i.test(text)) {
    result.suggestedType = 'expense';
    result.confidence += 0.2;
  } else if (/penerimaan|received|kredit|income|gaji|salary/i.test(text)) {
    result.suggestedType = 'income';
    result.confidence += 0.2;
  } else if (/transfer/i.test(text)) {
    result.suggestedType = 'transfer';
    result.confidence += 0.1;
  }

  // Extract date
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    /(\d{4})-(\d{2})-(\d{2})/,
  ];
  // ... extract date

  // Extract reference number
  const refMatch = text.match(/(?:ref|reference|no\.?\s?transaksi)[:\s]*([A-Z0-9\-]+)/i);
  if (refMatch) {
    result.referenceNumber = refMatch[1];
    result.confidence += 0.1;
  }

  result.confidence = Math.min(result.confidence, 1);
  return result;
}
```

### UI

```
┌─────────────────────────────────┐
│ Email Imports                    │
├─────────────────────────────────┤
│ [+ Paste Email]                 │
│                                 │
│ No imports yet.                 │
│ Paste a finance email to        │
│ extract transaction data.       │
└─────────────────────────────────┘
```

After paste:

```
┌─────────────────────────────────┐
│ Review Extracted Data           │
├─────────────────────────────────┤
│ Merchant:  Gojek         ✏️    │
│ Amount:    Rp55.000      ✏️    │
│ Date:      18 Apr 2026   ✏️    │
│ Account:   GoPay         ✏️    │
│ Type:      Expense       ✏️    │
│ Category:  Transport     ✏️    │
│ Confidence: 82%                │
│                                 │
│ [Accept]  [Edit]  [Ignore]     │
└─────────────────────────────────┘
```

---

## Phase 2: Gmail API

### OAuth Flow

1. User clicks "Connect Gmail" in Settings
2. App redirects to Google OAuth consent screen
3. Scopes requested: `gmail.readonly`
4. User grants permission
5. App receives access token + refresh token
6. Tokens stored encrypted in Setting table or env

### Token Storage

```typescript
// Stored in Setting table as encrypted JSON
{
  "key": "gmail_tokens",
  "value": {
    "access_token": "encrypted...",
    "refresh_token": "encrypted...",
    "expires_at": "2026-04-18T12:00:00Z",
    "email": "user@gmail.com"
  }
}
```

Encryption key from `GMAIL_ENCRYPTION_KEY` env var.

### Gmail Search Queries

```typescript
const FINANCE_SEARCH_QUERIES = [
  'from:(noreply@bca.co.id OR noreply@bankmandiri.co.id)',
  'from:(noreply@gopay.co.id OR noreply@ovo.id)',
  'subject:(transaksi OR pembayaran OR payment OR receipt)',
  'from:Tokopedia subject:pesanan',
  'from:Shopee subject:pesanan',
  'from:Grab subject:receipt',
  'from:Gojek subject:receipt',
  'subject:(tagihan OR invoice OR billing)',
];
```

### Fetch Flow

```typescript
async function fetchFinanceEmails(after?: Date): Promise<EmailCandidate[]> {
  const tokens = await getGmailTokens();
  if (!tokens) throw new Error('Gmail not connected');

  const query = FINANCE_SEARCH_QUERIES.join(' OR ');
  const afterParam = after ? ` after:${Math.floor(after.getTime() / 1000)}` : '';

  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query + afterParam)}&maxResults=20`,
    { headers: { Authorization: `Bearer ${tokens.access_token}` } }
  );

  const { messages } = await response.json();
  
  const candidates: EmailCandidate[] = [];
  for (const msg of messages || []) {
    const detail = await fetchMessageDetail(msg.id, tokens.access_token);
    const parsed = parseFinanceEmail(detail.snippet);
    candidates.push({
      providerMessageId: msg.id,
      sender: detail.from,
      subject: detail.subject,
      receivedAt: new Date(detail.internalDate),
      ...parsed,
    });
  }

  return candidates;
}
```

### Environment Variables

```env
GMAIL_CLIENT_ID=***
GMAIL_CLIENT_SECRET=***
GMAIL_REDIRECT_URI=https://yourdomain.com/api/email/gmail/callback
GMAIL_ENCRYPTION_KEY=***
```

### Error Handling

- Token expired → refresh automatically
- Refresh fails → mark as disconnected, show in Settings
- Rate limited by Gmail → show "Try again in X minutes"
- No emails found → show empty state

---

## Duplicate Detection

Before creating any transaction from email:

```typescript
async function checkDuplicate(candidate: ParsedTransaction): Promise<boolean> {
  // Check 1: Same provider message ID already processed
  if (candidate.referenceNumber) {
    const existing = await prisma.transaction.findFirst({
      where: {
        deleted_at: null,
        notes: { contains: candidate.referenceNumber },
      },
    });
    if (existing) return true;
  }

  // Check 2: Same amount + same date + similar merchant
  if (candidate.amount && candidate.date) {
    const startOfDay = new Date(candidate.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(candidate.date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await prisma.transaction.findFirst({
      where: {
        deleted_at: null,
        amount: candidate.amount,
        date: { gte: startOfDay, lte: endOfDay },
        notes: candidate.merchant ? { contains: candidate.merchant } : undefined,
      },
    });
    if (existing) return true;
  }

  return false;
}
```
