import { put, del } from "@vercel/blob";

export interface StoredResumeFile {
  url: string;
  pathname: string;
  contentType: string;
}

/**
 * Uploads a resume file (PDF, DOCX, TXT) to persistent Vercel Blob storage.
 * Completely serverless and Vercel-native.
 */
export async function uploadResumeFile(
  fileData: Buffer | Blob | File,
  filename: string,
  contentType: string = "application/octet-stream"
): Promise<StoredResumeFile | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    // Graceful fallback for local development or when Blob store is not yet linked
    return null;
  }

  try {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const blob = await put(`resumes/${Date.now()}-${safeName}`, fileData, {
      access: "public",
      contentType,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
    };
  } catch (error) {
    console.error("[Vercel Blob] Storage upload failed:", error);
    return null;
  }
}

/**
 * Deletes a stored file from Vercel Blob.
 */
export async function deleteResumeFile(blobUrl: string): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN || !blobUrl) {
    return false;
  }

  try {
    await del(blobUrl);
    return true;
  } catch (error) {
    console.error("[Vercel Blob] Storage deletion failed:", error);
    return false;
  }
}
