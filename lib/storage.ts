import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3-compatible storage client (works with MinIO, AWS S3, Cloudflare R2, etc.)
const s3Client = new S3Client({
  region: process.env.STORAGE_REGION || "us-east-1",
  endpoint: process.env.STORAGE_ENDPOINT, // e.g., http://localhost:9000 for MinIO
  credentials: {
    // Support multiple common env var names for portability
    accessKeyId:
      process.env.STORAGE_ACCESS_KEY || process.env.STORAGE_ACCESS_KEY_ID || "",
    secretAccessKey:
      process.env.STORAGE_SECRET_KEY || process.env.STORAGE_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET_NAME = process.env.STORAGE_BUCKET || "portfolio";

// Logical upload categories mapped to storage folder prefixes.
const BUCKET_FOLDERS: Record<string, string> = {
  "profile-images": "profile-images",
  "background-images": "background-images",
  "project-images": "project-images",
  "gallery-images": "gallery-images",
  favicons: "favicons",
  resumes: "resumes",
};

/**
 * Get base folder inside the bucket from environment variables
 */
export function getStorageBaseFolder(): string {
  const folder =
    process.env.STORAGE_FOLDER ||
    process.env.STORAGE_BASE_FOLDER ||
    process.env.STORAGE_PREFIX ||
    "";
  return folder.replace(/^\/+|\/+$/g, "").trim();
}

/**
 * Construct full S3 object key including optional base folder and category prefix
 */
export function getFullKey(bucket: string, filePath: string): string {
  const folderPrefix = BUCKET_FOLDERS[bucket] || bucket;
  const baseFolder = getStorageBaseFolder();
  const cleanPath = filePath.replace(/^\/+/, "");

  // If cleanPath already starts with baseFolder + "/" + folderPrefix, it's already a full key
  if (baseFolder && cleanPath.startsWith(`${baseFolder}/${folderPrefix}/`)) {
    return cleanPath;
  }

  // If cleanPath already starts with folderPrefix + "/"
  if (cleanPath.startsWith(`${folderPrefix}/`)) {
    return baseFolder ? `${baseFolder}/${cleanPath}` : cleanPath;
  }

  // If cleanPath starts with baseFolder + "/" but missing folderPrefix
  if (baseFolder && cleanPath.startsWith(`${baseFolder}/`)) {
    const withoutBase = cleanPath.slice(baseFolder.length + 1);
    if (withoutBase.startsWith(`${folderPrefix}/`)) {
      return cleanPath;
    }
    return `${baseFolder}/${folderPrefix}/${withoutBase}`;
  }

  const prefix = baseFolder ? `${baseFolder}/${folderPrefix}` : folderPrefix;
  return `${prefix}/${cleanPath}`;
}

export interface UploadResult {
  filePath: string;
  publicUrl: string;
}

/**
 * Upload a file to S3-compatible storage
 * @param bucket - Logical bucket name (maps to folder prefix)
 * @param filePath - Path within the bucket (e.g., "userId/filename.jpg")
 * @param file - File buffer or Blob
 * @param contentType - MIME type
 */
export async function uploadFile(
  bucket: string,
  filePath: string,
  file: Buffer | Blob,
  contentType: string
): Promise<UploadResult> {
  const key = getFullKey(bucket, filePath);

  let buffer: Buffer;
  if (Buffer.isBuffer(file)) {
    buffer = file;
  } else {
    // Blob type
    const arrayBuffer = await (file as Blob).arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  }

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read", // Make files publicly readable
    })
  );

  const publicUrl = getPublicUrl(bucket, filePath);

  return {
    filePath: key,
    publicUrl,
  };
}

/**
 * Delete a file from S3-compatible storage
 * @param bucket - Logical bucket name
 * @param filePath - Path within the bucket
 */
export async function deleteFile(bucket: string, filePath: string): Promise<void> {
  const key = getFullKey(bucket, filePath);

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

/**
 * Get a signed URL for private file access (valid for 1 hour)
 * @param bucket - Logical bucket name
 * @param filePath - Path within the bucket
 */
export async function getSignedDownloadUrl(
  bucket: string,
  filePath: string
): Promise<string> {
  const key = getFullKey(bucket, filePath);

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

/**
 * Construct a public URL for a file
 * @param bucket - Logical bucket name
 * @param filePath - Path within the bucket
 */
export function getPublicUrl(bucket: string, filePath: string): string {
  const key = getFullKey(bucket, filePath);

  // For S3-compatible storage, construct the public URL
  const endpoint = process.env.STORAGE_PUBLIC_URL || process.env.STORAGE_ENDPOINT;
  
  if (!endpoint) {
    throw new Error("STORAGE_PUBLIC_URL or STORAGE_ENDPOINT must be set");
  }

  // Remove trailing slash and construct URL
  const baseUrl = endpoint.replace(/\/$/, "");
  return `${baseUrl}/${BUCKET_NAME}/${key}`;
}

/**
 * List files in a bucket/folder
 * @param bucket - Logical bucket name
 * @param prefix - Optional prefix to filter files
 */
export async function listFiles(
  bucket: string,
  prefix?: string
): Promise<string[]> {
  const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
  
  const folderPrefix = BUCKET_FOLDERS[bucket] || bucket;
  const baseFolder = getStorageBaseFolder();
  const fullFolder = baseFolder ? `${baseFolder}/${folderPrefix}` : folderPrefix;
  const cleanPrefix = prefix ? prefix.replace(/^\/+/, "") : "";
  const fullPrefix = cleanPrefix ? `${fullFolder}/${cleanPrefix}` : `${fullFolder}/`;

  const response = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: fullPrefix,
    })
  );

  return (response.Contents || [])
    .map((item) => item.Key || "")
    .filter((key) => key !== fullPrefix);
}

/**
 * Check if storage is configured
 */
export function isStorageConfigured(): boolean {
  return !!(
    process.env.STORAGE_ENDPOINT &&
    process.env.STORAGE_ACCESS_KEY &&
    process.env.STORAGE_SECRET_KEY
  );
}
