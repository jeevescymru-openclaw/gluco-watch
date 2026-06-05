const { withAndroidManifest, withMainActivity } = require('@expo/config-plugins');

// react-native-health-connect's requestPermission() relies on an ActivityResultLauncher
// that must be registered before the activity resumes, via
// HealthConnectPermissionDelegate.setPermissionDelegate(this) in MainActivity.onCreate.
// The library's own config plugin only adds the rationale intent-filter, so this plugin
// injects the delegate registration into the generated Kotlin MainActivity.
const IMPORT_LINE = 'import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate';
const DELEGATE_CALL = 'HealthConnectPermissionDelegate.setPermissionDelegate(this)';

const PERMISSION_USAGE_ALIAS = 'ViewPermissionUsageActivity';

const withDelegate = (config) =>
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

// On Android 14+ Health Connect is part of the OS and only lists an app once it declares
// a VIEW_PERMISSION_USAGE activity-alias (category HEALTH_PERMISSIONS). The library's own
// plugin adds only the legacy ACTION_SHOW_PERMISSIONS_RATIONALE filter (Android 13 and
// below), so the app is invisible to Health Connect on modern devices without this.
const withPermissionUsageAlias = (config) =>
  withAndroidManifest(config, (modConfig) => {
    const application = modConfig.modResults.manifest.application?.[0];
    if (!application) {
      throw new Error('withHealthConnectDelegate could not find the application manifest node.');
    }

    application['activity-alias'] = application['activity-alias'] ?? [];
    const already = application['activity-alias'].some(
      (alias) => alias.$?.['android:name'] === PERMISSION_USAGE_ALIAS,
    );
    if (!already) {
      application['activity-alias'].push({
        $: {
          'android:name': PERMISSION_USAGE_ALIAS,
          'android:exported': 'true',
          'android:targetActivity': `${config.android.package}.MainActivity`,
          'android:permission': 'android.permission.START_VIEW_PERMISSION_USAGE',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.intent.action.VIEW_PERMISSION_USAGE' } }],
            category: [{ $: { 'android:name': 'android.intent.category.HEALTH_PERMISSIONS' } }],
          },
        ],
      });
    }
    return modConfig;
  });

const withHealthConnectDelegate = (config) => withPermissionUsageAlias(withDelegate(config));

module.exports = withHealthConnectDelegate;
