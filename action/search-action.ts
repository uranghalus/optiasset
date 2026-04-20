/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { prisma } from '@/lib/prisma';

export type SearchResult = {
  id: string;
  type: 'ASSET' | 'ITEM' | 'EMPLOYEE';
  title: string;
  subtitle: string;
  url: string;
};

export async function globalSearch(query: string) {
  if (!query || query.length < 2) return [];

  const [assets, items] = await Promise.all([
    prisma.asset.findMany({
      where: {
        OR: [
          { item: { name: { contains: query } } },
          { item: { code: { contains: query } } },
        ],
      },
      take: 5,
      select: {
        id: true,
        item: {
          select: { name: true, code: true },
        },
      },
    }),

    prisma.item.findMany({
      where: {
        OR: [{ name: { contains: query } }, { code: { contains: query } }],
      },
      take: 5,
      select: { id: true, name: true, code: true },
    }),
  ]);

  const results: SearchResult[] = [
    ...assets.map((a) => ({
      id: a.id,
      type: 'ASSET' as const,
      title: a.item.name,
      subtitle: a.item.code,
      url: `/assets`,
    })),

    ...items.map((i: { id: any; name: any; code: any }) => ({
      id: i.id,
      type: 'ITEM' as const,
      title: i.name,
      subtitle: i.code,
      url: `/inventory/items`,
    })),
  ];

  return results;
}
