'use server';
import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/* =======================
   TYPES
 ======================= */
export type AssetCategoryArgs = {
  page: number;
  pageSize: number;
};

/* =======================
   GET ALL CATEGORIES
 ======================= */
export async function getAllCategories({ page, pageSize }: AssetCategoryArgs) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const take = safePageSize;

  const [data, total] = await Promise.all([
    prisma.category.findMany({
      skip,
      take,
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    }),
    prisma.category.count(),
  ]);

  return {
    data,
    total,
    pageCount: Math.ceil(total / safePageSize),
    page: safePage,
    pageSize: safePageSize,
  };
}

/* =======================
   CREATE CATEGORY
 ======================= */
export async function createCategory(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const name = formData.get('name')?.toString();

  if (!name) {
    throw new Error('Required fields are missing');
  }
  const category = await prisma.category.create({
    data: {
      name,
    },
  });
  revalidatePath('/assets/categories');
  return category;
}
