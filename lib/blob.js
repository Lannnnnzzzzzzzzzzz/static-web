import { put, list, del } from '@vercel/blob';

const BLOB_PREFIX = 'static-deploy';

// Baca file JSON dari Blob
export async function readJsonFile(path) {
  try {
    const { blobs } = await list({ prefix: path });
    if (blobs.length === 0) return null;
    
    const response = await fetch(blobs[0].url);
    return await response.json();
  } catch (error) {
    return null;
  }
}

// Tulis file JSON ke Blob
export async function writeJsonFile(path, data) {
  try {
    const blob = await put(path, JSON.stringify(data), {
      access: 'public',
    });
    return blob;
  } catch (error) {
    throw error;
  }
}

// Upload file ke Blob
export async function uploadFile(path, file) {
  try {
    const blob = await put(path, file, {
      access: 'public',
    });
    return blob;
  } catch (error) {
    throw error;
  }
}
