import { getServerSession } from '@/lib/get-session';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Panggil fungsi helper getServerSession yang sudah Anda buat
    const sessionData = await getServerSession();

    // Sesuai logika fungsi Anda, jika tidak ada user, ia akan mereturn null
    if (!sessionData) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Sesi tidak valid atau sudah berakhir (Unauthorized)',
        },
        { status: 401 },
      );
    }

    // Jika session valid (tidak null), kembalikan datanya
    return NextResponse.json(
      {
        status: 'success',
        data: {
          user: sessionData.user,
          session: sessionData.session,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('GET SESSION API ERROR:', error);
    return NextResponse.json(
      { status: 'error', message: 'Terjadi kesalahan internal.' },
      { status: 500 },
    );
  }
}
