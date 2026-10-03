import { 
  loginWithGoogle, 
  getCachedDriveAccessToken, 
  setCachedDriveAccessToken 
} from './firebase';

export const OFFICIAL_REPO_FOLDER_ID = '1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO';
export const OFFICIAL_REPO_FOLDER_URL = 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link';

export interface UploadDriveResult {
  fileId: string;
  webViewLink: string;
  webContentLink?: string;
  fileName: string;
  size?: string;
}

/**
 * Connects the user to Google Drive by acquiring or verifying an OAuth access token with Drive scope.
 */
export async function connectGoogleDrive(): Promise<string> {
  const existingToken = getCachedDriveAccessToken();
  if (existingToken) {
    return existingToken;
  }

  const result = await loginWithGoogle();
  const token = getCachedDriveAccessToken();
  if (!token) {
    throw new Error('Google Drive access was not granted. Please sign in and approve Drive permissions.');
  }

  return token;
}

/**
 * Directly uploads a binary file to Google Drive under the designated folder (DEFAULT: 1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO).
 */
export async function uploadFileToGoogleDrive(
  file: File | Blob,
  fileName: string,
  targetFolderId: string = OFFICIAL_REPO_FOLDER_ID,
  onProgress?: (percent: number) => void
): Promise<UploadDriveResult> {
  // 1. Ensure we have an active access token
  const token = await connectGoogleDrive();

  if (onProgress) onProgress(15);

  // 2. Prepare metadata with the parent folder
  const metadata = {
    name: fileName,
    parents: targetFolderId ? [targetFolderId] : [OFFICIAL_REPO_FOLDER_ID]
  };

  // 3. Build multipart form data for Google Drive v3 REST API
  const boundary = '-------DakshyaShikshaUploadBoundary' + Math.random().toString(36).substring(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const fileType = (file as File).type || 'application/octet-stream';
  const fileArrayBuffer = await file.arrayBuffer();

  const metadataPart = delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${fileType}\r\n\r\n`;

  const encoder = new TextEncoder();
  const metadataBytes = encoder.encode(metadataPart);
  const closeBytes = encoder.encode(closeDelimiter);

  // Combine into single Uint8Array
  const combinedBuffer = new Uint8Array(metadataBytes.length + fileArrayBuffer.byteLength + closeBytes.length);
  combinedBuffer.set(metadataBytes, 0);
  combinedBuffer.set(new Uint8Array(fileArrayBuffer), metadataBytes.length);
  combinedBuffer.set(closeBytes, metadataBytes.length + fileArrayBuffer.byteLength);

  if (onProgress) onProgress(45);

  // 4. Send upload request to Google Drive
  const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,size';

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: combinedBuffer
  });

  if (onProgress) onProgress(85);

  if (!response.ok) {
    let errorDetails = '';
    try {
      const errJson = await response.json();
      errorDetails = errJson?.error?.message || response.statusText;
    } catch {
      errorDetails = await response.text();
    }

    // If folder restriction prevents writing directly to someone else's shared folder:
    if (errorDetails.toLowerCase().includes('not found') || errorDetails.toLowerCase().includes('permission') || errorDetails.toLowerCase().includes('parent')) {
      // Try uploading to root of the user's Drive if parent folder is restricted
      const retryMetadata = { name: fileName };
      const retryPart = delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(retryMetadata) +
        delimiter +
        `Content-Type: ${fileType}\r\n\r\n`;
      
      const retryMetaBytes = encoder.encode(retryPart);
      const retryCombined = new Uint8Array(retryMetaBytes.length + fileArrayBuffer.byteLength + closeBytes.length);
      retryCombined.set(retryMetaBytes, 0);
      retryCombined.set(new Uint8Array(fileArrayBuffer), retryMetaBytes.length);
      retryCombined.set(closeBytes, retryMetaBytes.length + fileArrayBuffer.byteLength);

      const retryRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: retryCombined
      });

      if (retryRes.ok) {
        const retryData = await retryRes.json();
        if (onProgress) onProgress(100);
        return {
          fileId: retryData.id,
          webViewLink: retryData.webViewLink || `https://drive.google.com/file/d/${retryData.id}/view`,
          webContentLink: retryData.webContentLink,
          fileName: retryData.name || fileName
        };
      }
    }

    throw new Error(`Google Drive upload failed: ${errorDetails}`);
  }

  const data = await response.json();
  if (onProgress) onProgress(100);

  return {
    fileId: data.id,
    webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
    webContentLink: data.webContentLink,
    fileName: data.name || fileName
  };
}
