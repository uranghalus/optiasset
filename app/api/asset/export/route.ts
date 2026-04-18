/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/export/asset/route.ts
import { exportAssetExcel } from '@/action/asset-action';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const type = searchParams.get('type') as any;
  const organizationId = searchParams.get('organizationId')!;

  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  const buffer = await exportAssetExcel({
    type,
    organizationId,
    dateFrom: dateFrom ? new Date(dateFrom) : undefined,
    dateTo: dateTo ? new Date(dateTo) : undefined,
  });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=assets.xlsx',
    },
  });
}
