import { Linking } from 'react-native';
import {
  getSdkStatus,
  initialize,
  openHealthConnectSettings,
  readRecords,
  requestPermission,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';

import {
  BLOOD_GLUCOSE_RECORD_TYPE,
  HEALTH_CONNECT_PAGE_SIZE,
  HEALTH_CONNECT_PLAY_STORE_URL,
  HEALTH_CONNECT_PROVIDER_PACKAGE,
} from '../constants';

import type { GlucoseSample } from '../glucose.types';

/** Opens the Play Store at the Health Connect listing so the user can install or update it. */
export const openHealthConnectInstall = (): void => {
  void Linking.openURL(HEALTH_CONNECT_PLAY_STORE_URL);
};

export { openHealthConnectSettings };

export type HealthConnectStatus = 'ready' | 'unavailable' | 'update-required';

/** Initialises the SDK and reports whether Health Connect can be used on this device. */
export const getHealthConnectStatus = async (): Promise<HealthConnectStatus> => {
  const status = await getSdkStatus(HEALTH_CONNECT_PROVIDER_PACKAGE);
  if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
    return 'update-required';
  }
  if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
    return 'unavailable';
  }
  return (await initialize(HEALTH_CONNECT_PROVIDER_PACKAGE)) ? 'ready' : 'unavailable';
};

/** Requests BloodGlucose read access, returning whether it was granted. */
export const requestGlucoseReadPermission = async (): Promise<boolean> => {
  const granted = await requestPermission([
    { accessType: 'read', recordType: BLOOD_GLUCOSE_RECORD_TYPE },
  ]);
  return granted.some(
    (permission) =>
      'recordType' in permission &&
      permission.recordType === BLOOD_GLUCOSE_RECORD_TYPE &&
      permission.accessType === 'read',
  );
};

/** Reads all BloodGlucose samples in the range (mmol/L, paginated), oldest-first. */
export const readGlucoseSamples = async (
  from: Date,
  to: Date,
): Promise<readonly GlucoseSample[]> => {
  const samples: GlucoseSample[] = [];
  let pageToken: string | undefined;

  do {
    const result = await readRecords(BLOOD_GLUCOSE_RECORD_TYPE, {
      timeRangeFilter: {
        operator: 'between',
        startTime: from.toISOString(),
        endTime: to.toISOString(),
      },
      pageSize: HEALTH_CONNECT_PAGE_SIZE,
      pageToken,
      ascendingOrder: true,
    });
    for (const record of result.records) {
      samples.push({ time: new Date(record.time), mmol: record.level.inMillimolesPerLiter });
    }
    pageToken = result.pageToken;
  } while (pageToken);

  return samples;
};
