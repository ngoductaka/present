import { API_CONFIG } from '../config';

export type UploadResponse = string | Record<string, unknown>;

type UploadAudioOptions = {
  onProgress?: (progress: number) => void;
};

const DEFAULT_FILE_NAME = 'recording.m4a';

const inferMimeType = (fileName: string) => {
  if (fileName.endsWith('.wav')) {
    return 'audio/wav';
  }

  if (fileName.endsWith('.aac')) {
    return 'audio/aac';
  }

  if (fileName.endsWith('.mp3')) {
    return 'audio/mpeg';
  }

  return 'audio/m4a';
};

const parseResponseBody = (body: string, contentType: string | null): UploadResponse => {
  if (!body.trim()) {
    return '';
  }

  if (contentType?.includes('application/json')) {
    return JSON.parse(body) as Record<string, unknown>;
  }

  return body;
};

const getErrorMessage = (payload: UploadResponse, fallback: string) => {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const message = payload.message;

    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
};

export async function uploadAudioFile(
  fileUri: string,
  options: UploadAudioOptions = {},
): Promise<UploadResponse> {
  if (!API_CONFIG.uploadUrl) {
    throw new Error('Missing EXPO_PUBLIC_UPLOAD_URL. Set it before uploading recordings.');
  }

  const fileName = fileUri.split('/').pop() ?? DEFAULT_FILE_NAME;
  const formData = new FormData();

  formData.append('file', {
    uri: fileUri,
    name: fileName,
    type: inferMimeType(fileName.toLowerCase()),
  } as any);

  return new Promise<UploadResponse>((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open('POST', API_CONFIG.uploadUrl);

    request.upload.addEventListener('progress', event => {
      if (!event.lengthComputable) {
        return;
      }

      options.onProgress?.(event.loaded / event.total);
    });

    request.onreadystatechange = () => {
      if (request.readyState !== XMLHttpRequest.DONE) {
        return;
      }

      const payload = parseResponseBody(
        request.responseText ?? '',
        request.getResponseHeader('content-type'),
      );

      if (request.status >= 200 && request.status < 300) {
        options.onProgress?.(1);
        resolve(payload);
        return;
      }

      reject(new Error(getErrorMessage(payload, `Upload failed with status ${request.status}.`)));
    };

    request.onerror = () => {
      reject(new Error('Upload failed. Please check your connection and try again.'));
    };

    request.ontimeout = () => {
      reject(new Error('Upload timed out. Please try again.'));
    };

    request.send(formData);
  });
}
