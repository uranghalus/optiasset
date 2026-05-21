import { loginAction } from '@/action/auth-action';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log('==== REQUEST MASUK KE API MOBILE LOGIN ===='); // 👈 TAMBAHKAN INI

  try {
    const body = await req.json();
    console.log('PAYLOAD DARI MOBILE:', body); // 👈 TAMBAHKAN INI JUGA

    const result = await loginAction(body);
    console.log('HASIL SERVER ACTION:', result); // 👈 TAMBAHKAN INI JUGA

    if (result.status === 'error') {
      const isUnauthorized =
        result.message?.toLowerCase().includes('salah') ||
        result.message?.toLowerCase().includes('belum terdaftar');
      const statusCode = isUnauthorized ? 401 : 400;

      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('API ROUTE LOGIN ERROR:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Terjadi kesalahan internal pada server.',
      },
      { status: 500 },
    );
  }
}
// Tambahkan di bawah fungsi POST
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204, // No Content
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    },
  });
}
