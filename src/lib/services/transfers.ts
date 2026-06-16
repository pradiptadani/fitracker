import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { Decimal } from "decimal.js";

export interface CreateTransferInput {
  source_account_id: string;
  destination_account_id: string;
  amount: number;
  currency: string;
  exchange_rate: number;
  date: Date;
  notes?: string | null;
  fee?: {
    amount: number;
    account_id: string;
    category_id: string;
    notes?: string | null;
  };
}

export async function createTransfer(input: CreateTransferInput) {
  const groupId = randomUUID();
  const amount = new Decimal(input.amount);

  const ops: Prisma.PrismaPromise<unknown>[] = [
    prisma.transaction.create({
      data: {
        account_id: input.source_account_id,
        amount: amount.toNumber(),
        currency: input.currency,
        exchange_rate: input.exchange_rate,
        type: "credit",
        transfer_group_id: groupId,
        date: input.date,
        notes: input.notes ?? "Transfer out",
      },
    }),
    prisma.transaction.create({
      data: {
        account_id: input.destination_account_id,
        amount: amount.toNumber(),
        currency: input.currency,
        exchange_rate: input.exchange_rate,
        type: "debit",
        transfer_group_id: groupId,
        date: input.date,
        notes: input.notes ?? "Transfer in",
      },
    }),
  ];

  if (input.fee) {
    ops.push(
      prisma.transaction.create({
        data: {
          account_id: input.fee.account_id,
          amount: input.fee.amount,
          currency: input.currency,
          exchange_rate: input.exchange_rate,
          type: "credit",
          transfer_group_id: groupId,
          category_id: input.fee.category_id,
          date: input.date,
          notes: input.fee.notes ?? "Transfer fee",
        },
      }),
    );
  }

  const results = await prisma.$transaction(ops);
  return { groupId, transactions: results };
}
