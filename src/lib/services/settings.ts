import prisma from '@/lib/prisma';

export async function getAllSettings(): Promise<Record<string, unknown>> {
  const rows = await prisma.setting.findMany();
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

export async function getSetting(key: string): Promise<unknown> {
  const row = await prisma.setting.findFirst({ where: { key } });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value: value as Parameters<typeof prisma.setting.update>[0]['data']['value'] },
    create: { key, value: value as Parameters<typeof prisma.setting.create>[0]['data']['value'] },
  });
}
