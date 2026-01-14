const { withAndroidManifest } = require('@expo/config-plugins');

const withCustomAndroidManifest = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // Remove problematic permissions
    if (androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = androidManifest['uses-permission'].filter(
        (perm) => {
          const permName = perm.$['android:name'];
          return (
            permName !== 'android.permission.READ_MEDIA_IMAGES' &&
            permName !== 'android.permission.READ_MEDIA_VIDEO' &&
            permName !== 'android.permission.READ_MEDIA_AUDIO' &&
            permName !== 'android.permission.READ_EXTERNAL_STORAGE' &&
            permName !== 'android.permission.WRITE_EXTERNAL_STORAGE'
          );
        }
      );
    }

    return config;
  });
};

module.exports = withCustomAndroidManifest;
