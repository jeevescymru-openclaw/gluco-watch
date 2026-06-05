import * as ImagePicker from 'expo-image-picker';

import { PHOTO_QUALITY } from '../constants';

export interface CapturedPhoto {
  readonly uri: string;
  readonly takenAt: Date;
}

/**
 * Opens the camera and returns the captured photo's local URI plus the capture time
 * (the meal's event time, per the plan §3). Returns null if permission is denied or
 * the user backs out without taking a photo — both treated as "skip the photo".
 */
export const capturePhoto = async (): Promise<CapturedPhoto | null> => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: PHOTO_QUALITY,
  });
  const asset = result.canceled ? undefined : result.assets[0];
  return asset ? { uri: asset.uri, takenAt: new Date() } : null;
};
