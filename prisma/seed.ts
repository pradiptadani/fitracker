import {
  PrismaClient,
  AccountType,
  NormalBalance,
  CategoryType,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Accounts
  const accounts = [
    {
      name: "BCA",
      type: AccountType.ASSET,
      normal_balance: NormalBalance.debit,
    },
    {
      name: "Mandiri",
      type: AccountType.ASSET,
      normal_balance: NormalBalance.debit,
    },
    {
      name: "GoPay",
      type: AccountType.ASSET,
      normal_balance: NormalBalance.debit,
    },
    {
      name: "OVO",
      type: AccountType.ASSET,
      normal_balance: NormalBalance.debit,
    },
    {
      name: "Dana",
      type: AccountType.ASSET,
      normal_balance: NormalBalance.debit,
    },
    {
      name: "Cash",
      type: AccountType.ASSET,
      normal_balance: NormalBalance.debit,
    },
    {
      name: "Credit Card",
      type: AccountType.LIABILITY,
      normal_balance: NormalBalance.credit,
    },
  ];

  for (const account of accounts) {
    await prisma.account.upsert({
      where: { name: account.name },
      // Clear soft-delete so re-seeding reactivates a previously deleted account.
      update: { deleted_at: null },
      create: { ...account, currency: "IDR" },
    });
  }
  console.log("✓ Accounts seeded");

  // Categories
  const incomeCategories = [
    "Salary",
    "Freelance",
    "Bonus",
    "Gift",
    "Other Income",
  ];
  const expenseCategories = [
    "Food & Drinks",
    "Groceries",
    "Transport",
    "Rent",
    "Utilities",
    "Internet & Phone",
    "Health",
    "Shopping",
    "Entertainment",
    "Subscription",
    "Family",
    "Education",
    "Travel",
    "Other Expense",
  ];
  const transferFeeCategories = ["Bank Fees", "Transfer Fees"];

  for (const name of incomeCategories) {
    const existing = await prisma.category.findFirst({
      where: { name, deleted_at: null },
    });
    if (!existing) {
      await prisma.category.create({
        data: { name, type: CategoryType.INCOME },
      });
    }
  }
  for (const name of expenseCategories) {
    const existing = await prisma.category.findFirst({
      where: { name, deleted_at: null },
    });
    if (!existing) {
      await prisma.category.create({
        data: { name, type: CategoryType.EXPENSE },
      });
    }
  }
  for (const name of transferFeeCategories) {
    const existing = await prisma.category.findFirst({
      where: { name, deleted_at: null },
    });
    if (!existing) {
      await prisma.category.create({
        data: { name, type: CategoryType.TRANSFER_FEE },
      });
    }
  }
  console.log("✓ Categories seeded");

  // Default Settings
  const settings = [
    { key: "defaultCurrency", value: "IDR" },
    { key: "dateFormat", value: "DD/MM/YYYY" },
    { key: "theme", value: "system" },
    { key: "firstDayOfWeek", value: "monday" },
    { key: "aiCategorizerEnabled", value: true },
    { key: "aiMonthlyAdviceEnabled", value: true },
    { key: "recurringAutoPrompt", value: true },
    { key: "onboarding_completed", value: { completed: false } },
  ] as const;

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value as unknown as Parameters<
          typeof prisma.setting.create
        >[0]["data"]["value"],
      },
    });
  }
  console.log("✓ Settings seeded");

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
