import { NextResponse } from 'next/server';
import { getPrivateUrl } from '@/lib/s3-utils';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get('key');
    if (!key) return NextResponse.json({ url: null }, { status: 400 });

    const signed = await getPrivateUrl(key);
    return NextResponse.json({ url: signed });
  } catch (error) {
    console.error('Signed URL error', error);
    return NextResponse.json({ url: null }, { status: 500 });
  }
}
