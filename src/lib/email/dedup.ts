import prisma from '@/lib/prisma';

export async function isDuplicateEmail(providerMessageId: string): Promise<boolean> {
  // We store processed email IDs in a Setting key
  const setting = await prisma.setting.findFirst({ where: { key: 'processed_email_ids' } });
  if (!setting) return false;
  const ids = setting.value as string[];
  return Array.isArray(ids) && ids.includes(providerMessageId);
}

export async function markEmailProcessed(providerMessageId: string): Promise<void> {
  const setting = await prisma.setting.findFirst({ where: { key: 'processed_email_ids' } });
  if (setting) {
    const ids = (setting.value as string[]) ?? [];
    if (!ids.includes(providerMessageId)) {
      ids.push(providerMessageId);
      // Keep only last 1000 IDs
      const trimmed = ids.slice(-1000);
      await prisma.setting.update({ where: { id: setting.id }, data: { value: trimmed } });
    }
  } else {
    await prisma.setting.create({
      data: { key: 'processed_email_ids', value: [providerMessageId] },
    });
  }
}
