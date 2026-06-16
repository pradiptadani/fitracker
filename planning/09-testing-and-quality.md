# 09 — Testing And Quality

## Test Strategy

Use tests to protect locked financial rules. Focus on accounting correctness, validation, privacy boundaries, and mobile-critical flows.

## Unit Tests

### Balance Calculation

Cases:

- debit increases ASSET
- credit decreases ASSET
- credit increases LIABILITY
- debit decreases LIABILITY
- soft-deleted transactions ignored
- soft-deleted account ignored
- foreign currency converted where report requires IDR

### Transfer Logic

Cases:

- creates exactly two rows
- both rows share `transfer_group_id`
- source is credit
- destination is debit
- source and destination cannot match
- failure rolls back both rows
- transfer excluded from reports
- transfer fee creates separate expense

### Validation

Cases:

- amount must be positive
- date required
- account required
- invalid UUID rejected
- invalid transaction type rejected
- Zod runs before Prisma write

### Soft Delete

Cases:

- account delete cascades transactions
- transaction delete sets `deleted_at`
- category delete hides category from active list
- budget delete hides budget from active list

### Reports

Cases:

- income total correct
- expense total correct
- net cashflow correct
- savings rate correct
- budget variance correct
- transfers excluded
- deleted records excluded
- MoM delta correct

### AI Categorizer

Cases:

- prompt includes only allowed fields
- category id must be from existing list
- low confidence can be returned
- accept suggestion updates transaction
- reject suggestion does not update transaction

### Email Parser

Cases:

- extracts IDR amount from `Rp55.000`
- extracts merchant
- extracts transaction date
- recognizes duplicate by reference
- creates draft, not transaction, before confirmation

## Integration Tests

Critical flows:

1. Login → create account → create expense → balance updates.
2. Login → create transfer → two rows created → report unchanged.
3. Login → soft-delete account → related transactions hidden.
4. Login → create budget → add expense → budget variance updates.
5. Login → uncategorized transaction → AI suggestion → accept category.
6. Login → parse email → review → accept → transaction created.
7. Run monthly summary → advice prompt uses summaries only.

## E2E Tests

Desktop:

- Login
- Add transaction
- Filter transactions
- View report
- Review email import candidates

Mobile viewport:

- Login
- Tap Add
- Add expense under required fields
- Save
- Confirm transaction appears
- Open reports

## Manual QA Checklist

### Accounting

- [ ] Balance never stored on Account.
- [ ] Account balance correct after debit/credit.
- [ ] Transfer does not affect income/expense.
- [ ] Transfer fee appears as expense.
- [ ] Deleted records do not appear.

### Mobile UX

- [ ] Bottom nav visible.
- [ ] Add button easy to tap.
- [ ] Amount input opens numeric keyboard.
- [ ] Save button sticky.
- [ ] No horizontal overflow.

### AI/Privacy

- [ ] Categorizer prompt excludes unrelated transactions.
- [ ] Monthly advice prompt excludes raw transactions.
- [ ] Email parser only creates draft before confirmation.
- [ ] Duplicate warning appears.

### Reports

- [ ] Monthly totals match transaction list.
- [ ] Category breakdown percentages sum correctly.
- [ ] Budget overrun visible.
- [ ] Last 6 months trend loads.

## Deployment Quality

Checks:

- Environment variables documented.
- Prisma migrations run cleanly.
- Docker build succeeds.
- App boots after restart.
- Postgres volume persists.
- HTTPS enforced by proxy.
- Backups documented.

## Performance Targets

- Dashboard loads within 2 seconds on VPS.
- Transaction list paginated.
- Reports aggregate in database where possible.
- AI calls async/loading state shown.
- Email parsing batch limited.

## Security Checks

- Session cookie HTTP-only.
- Session cookie secure in production.
- No secrets in client bundle.
- All API routes check auth.
- Zod validation before Prisma.
- No hard delete routes.
- LLM API key server-side only.
