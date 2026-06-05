'use server';

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Memberikan fallback atau validasi yang lebih aman
const BUCKET_NAME = process.env.AWS_BUCKET || 'website-aset';

const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  endpoint: process.env.AWS_ENDPOINT, // http://20.20.20.233:9000/
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

    // Sanitasi: Hanya mengizinkan huruf, angka, titik, dan mengganti sisanya dengan '-'
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
  } catch (error) {
    console.error('S3 Upload Error:', error);
    // Melempar error agar komponen UI bisa menangkap pesan gagal
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
    return true; // Return true agar pemanggil tahu proses berhasil
  } catch (error) {
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
    // Menghasilkan URL dengan masa aktif 900 detik (15 menit)
    return await getSignedUrl(s3Client, command, { expiresIn: 900 });
  } catch (error) {
    console.error('S3 Get URL Error:', error);
    return null; // Mengembalikan null lebih aman di sini agar UI bisa merender placeholder/gambar default
  }
}
