// Minimal config plugin to ensure AndroidManifest has spotify query intents for prebuild verification
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withSpotifyQueries(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    if (!manifest.manifest.queries) {
      manifest.manifest.queries = [{}];
    }
    const queries = manifest.manifest.queries;
    // Add <intent> for spotify scheme if not present
    const hasSpotify = queries.some((q) =>
      Array.isArray(q.intent) && q.intent.some((i) => i.action?.[0]?.$['android:name'] === 'android.intent.action.VIEW' && i.data?.some((d) => d.$['android:scheme'] === 'spotify'))
    );
    if (!hasSpotify) {
      queries.push({
        intent: [
          {
            action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
            data: [{ $: { 'android:scheme': 'spotify' } }],
          },
        ],
      });
    }
    return config;
  });
};







