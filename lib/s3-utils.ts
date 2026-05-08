import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION || "us-east-1",
  endpoint: process.env.AWS_ENDPOINT, // http://20.20.20.233:9000/
  forcePathStyle: true, // Ini adalah padanan dari AWS_USE_PATH_STYLE_ENDPOINT=true
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const BUCKET_NAME = process.env.AWS_BUCKET; // website-aset

// --- FUNGSI UPLOAD ---
export async function uploadToS3(file: File, folder: string = "assets") {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
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
  } catch (error) {
    console.error("S3 Delete Error:", error);
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
    // Menghasilkan URL yang mengarah ke server 20.20.20.233 Anda
    return await getSignedUrl(s3Client, command, { expiresIn: 900 });
  } catch (error) {
    console.error("S3 Get URL Error:", error);
    return null;
  }
}
