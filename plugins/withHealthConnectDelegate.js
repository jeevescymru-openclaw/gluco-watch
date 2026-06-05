const { withMainActivity } = require('@expo/config-plugins');

// react-native-health-connect's requestPermission() relies on an ActivityResultLauncher
// that must be registered before the activity resumes, via
// HealthConnectPermissionDelegate.setPermissionDelegate(this) in MainActivity.onCreate.
// The library's own config plugin only adds the rationale intent-filter, so this plugin
// injects the delegate registration into the generated Kotlin MainActivity.
const IMPORT_LINE = 'import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate';
const DELEGATE_CALL = 'HealthConnectPermissionDelegate.setPermissionDelegate(this)';

const withHealthConnectDelegate = (config) =>
  withMainActivity(config, (modConfig) => {
    if (modConfig.modResults.language !== 'kt') {
      throw new Error(
        `withHealthConnectDelegate expected a Kotlin MainActivity, got ${modConfig.modResults.language}.`,
      );
    }

    let contents = modConfig.modResults.contents;

    if (!contents.includes(IMPORT_LINE)) {
      contents = contents.replace(/^(package .*)$/m, `$1\n\n${IMPORT_LINE}`);
    }

    if (!contents.includes(DELEGATE_CALL)) {
      const onCreate = /(super\.onCreate\([^)]*\))/;
      if (!onCreate.test(contents)) {
        throw new Error('withHealthConnectDelegate could not find super.onCreate in MainActivity.');
      }
      contents = contents.replace(onCreate, `$1\n    ${DELEGATE_CALL}`);
    }

    modConfig.modResults.contents = contents;
    return modConfig;
  });

module.exports = withHealthConnectDelegate;
