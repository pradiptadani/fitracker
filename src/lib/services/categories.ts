import prisma from '@/lib/prisma';
import type { CategoryType } from '@prisma/client';

export async function listCategories() {
  return prisma.category.findMany({ orderBy: [{ type: 'asc' }, { name: 'asc' }] });
}

export async function getCategoryById(id: string) {
  return prisma.category.findFirst({ where: { id } });
}

export async function createCategory(data: {
  name: string;
  type: CategoryType;
  parent_category_id?: string | null;
}) {
  return prisma.category.create({ data });
}

export async function updateCategory(id: string, data: Partial<{
  name: string;
  type: CategoryType;
  parent_category_id: string | null;
}>) {
  return prisma.category.update({ where: { id }, data });
}

export async function softDeleteCategory(id: string) {
  return prisma.category.update({ where: { id }, data: { deleted_at: new Date() } });
}
