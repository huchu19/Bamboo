/**
 * Firebase Storage helper functions
 */

import {
  ref,
  uploadBytesResumable,
  downloadURL,
  UploadTask,
  getBytes,
  deleteObject,
} from 'firebase/storage';
import { storage } from './config';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

/**
 * Upload a file to Firebase Storage
 */
export const uploadFile = (
  path: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): UploadTask => {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on('state_changed', (snapshot) => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    onProgress?.({
      bytesTransferred: snapshot.bytesTransferred,
      totalBytes: snapshot.totalBytes,
      progress,
    });
  });

  return uploadTask;
};

/**
 * Get download URL for a file
 */
export const getFileUrl = async (path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  return downloadURL(storageRef);
};

/**
 * Delete a file from Firebase Storage
 */
export const deleteFile = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

/**
 * Upload pitch video with validation
 * Limits: max 60 seconds, reasonable file size
 */
export const uploadPitchVideo = (
  pitchId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): UploadTask => {
  const path = `pitches/${pitchId}/video/pitch-video.mp4`;
  return uploadFile(path, file, onProgress);
};

/**
 * Upload pitch document (PDF, etc.)
 */
export const uploadPitchDocument = (
  pitchId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): UploadTask => {
  const fileName = `${Date.now()}-${file.name}`;
  const path = `pitches/${pitchId}/documents/${fileName}`;
  return uploadFile(path, file, onProgress);
};

/**
 * Upload user avatar
 */
export const uploadUserAvatar = (
  userId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): UploadTask => {
  const path = `users/${userId}/avatar/profile.jpg`;
  return uploadFile(path, file, onProgress);
};

/**
 * Upload pitch thumbnail
 */
export const uploadPitchThumbnail = (
  pitchId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): UploadTask => {
  const path = `pitches/${pitchId}/thumbnail/thumbnail.jpg`;
  return uploadFile(path, file, onProgress);
};

/**
 * Wait for upload task to complete and get download URL
 */
export const waitForUpload = async (uploadTask: UploadTask): Promise<string> => {
  await uploadTask;
  return downloadURL(uploadTask.snapshot.ref);
};
