import * as DocumentPicker from 'expo-document-picker';

export interface PickedFile {
  readonly uri: string;
  readonly name: string;
}

/** Opens the system file picker for a Lingo CSV, or returns null if the user cancels. */
export const pickCsvFile = async (): Promise<PickedFile | null> => {
  const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
  if (result.canceled) {
    return null;
  }
  const asset = result.assets[0];
  return { uri: asset.uri, name: asset.name };
};
