import 'dotenv/config';
import { PrismaClient, AccountType, NormalBalance } from '@prisma/client';

const prisma = new PrismaClient();

const defaultAccounts = [
  { name: 'BCA',         type: AccountType.ASSET,     normal_balance: NormalBalance.debit },
  { name: 'Mandiri',     type: AccountType.ASSET,     normal_balance: NormalBalance.debit },
  { name: 'GoPay',       type: AccountType.ASSET,     normal_balance: NormalBalance.debit },
  { name: 'OVO',         type: AccountType.ASSET,     normal_balance: NormalBalance.debit },
  { name: 'Dana',        type: AccountType.ASSET,     normal_balance: NormalBalance.debit },
  { name: 'Cash',        type: AccountType.ASSET,     normal_balance: NormalBalance.debit },
  { name: 'Credit Card', type: AccountType.LIABILITY, normal_balance: NormalBalance.credit },
];

async function main() {
  console.log('🌱 Seeding default Indonesian accounts...');

  for (const account of defaultAccounts) {
    const existing = await prisma.account.findFirst({
      where: {
        name: account.name,
        deleted_at: null,
      },
    });

    if (existing) {
      console.log(`  ⏭️  Skipped "${account.name}" (already exists)`);
      continue;
    }

    await prisma.account.create({
      data: {
        name: account.name,
        type: account.type,
        normal_balance: account.normal_balance,
        currency: 'IDR',
      },
    });

    console.log(`  ✅ Created "${account.name}" (${account.type}, ${account.normal_balance})`);
  }

  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
