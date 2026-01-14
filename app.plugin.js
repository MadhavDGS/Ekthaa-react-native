const { withAndroidManifest } = require('@expo/config-plugins');

const withCustomAndroidManifest = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    const blockedPermissions = [
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.READ_MEDIA_AUDIO',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE'
    ];

    // First, remove any existing blocked permissions
    if (androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = androidManifest['uses-permission'].filter(
        (perm) => {
          const permName = perm.$['android:name'];
          return !blockedPermissions.includes(permName);
        }
      );
    }

    // Then add them back with tools:node="remove" to block dependencies from adding them
    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }

    blockedPermissions.forEach(permission => {
      androidManifest['uses-permission'].push({
        $: {
          'android:name': permission,
          'tools:node': 'remove'
        }
      });
    });

    return config;
  });
};

module.exports = withCustomAndroidManifest;
