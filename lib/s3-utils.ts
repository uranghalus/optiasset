'use server';

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const BUCKET_NAME = process.env.AWS_BUCKET || 'website-aset';

const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  endpoint: process.env.AWS_ENDPOINT, // Pastikan formatnya: http://20.20.20.233:9000
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// --- FUNGSI UPLOAD ---
export async function uploadToS3(file: File, folder: string = 'assets') {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '-');
    const fileName = `${Date.now()}-${safeFileName}`;
    const key = `${folder}/${fileName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    return key;
  } catch (error: any) {
    // 1. Tangani Error 522 (Connection Timed Out dari Proxy/Cloudflare)
    if (error.$metadata?.httpStatusCode === 522) {
      console.error(
        '❌ S3 Upload Error [522]: Koneksi ke server S3/MinIO terputus (Connection Timed Out).',
      );
      throw new Error(
        'Server penyimpanan tidak merespons (Error 522). Silakan coba lagi nanti atau hubungi admin jaringan.',
      );
    }

    // 2. Tangani Deserialization Error ("char 'e' is not expected")
    if (
      error.message?.includes("char 'e' is not expected") ||
      error.name === 'SerializationException'
    ) {
      console.error(
        '❌ S3 Parsing Error: Menerima HTML/Teks dari proxy, bukan respons XML S3.',
        error.message,
      );
      throw new Error(
        'Gagal terhubung ke penyimpanan. Pastikan server S3 aktif dan tidak terhalang firewall.',
      );
    }

    // 3. Error lainnya (Fallback)
    console.error('❌ S3 Upload Error Umum:', error);
    throw new Error('Gagal mengunggah file ke server penyimpanan.');
  }
}

// --- FUNGSI HAPUS ---
export async function deleteS3File(key: string | null) {
  if (!key) return;
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }),
    );
    return true;
  } catch (error: any) {
    console.error('S3 Delete Error:', error);
    throw new Error('Gagal menghapus file.');
  }
}

// --- FUNGSI TAMPILKAN (PRESIGNED URL) ---
export async function getPrivateUrl(key: string | null) {
  if (!key) return null;
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 900 });
  } catch (error) {
    console.error('S3 Get URL Error:', error);
    return null;
  }
}
