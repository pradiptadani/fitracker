import { parseAsBoolean, parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import type { TransactionFilters } from "./query-keys";

const transactionFilterParsers = {
  account: parseAsString,
  category: parseAsString,
  from: parseAsString,
  to: parseAsString,
  q: parseAsString,
  transfers: parseAsBoolean.withDefault(false),
  limit: parseAsInteger.withDefault(20),
  cursor: parseAsString,
};

export function useTransactionFilters() {
  const [filters, setFilters] = useQueryStates(transactionFilterParsers, {
    shallow: false,
  });

  const cleanFilters: TransactionFilters = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== null && value !== undefined && value !== ""),
  );

  return {
    filters: cleanFilters,
    setFilters,
    resetFilters: () =>
      setFilters({
        account: null,
        category: null,
        from: null,
        to: null,
        q: null,
        transfers: false,
        limit: 20,
        cursor: null,
      }),
  };
}
