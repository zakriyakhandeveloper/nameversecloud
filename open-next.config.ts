import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({
  override: {
    experimental: {
      runtime: 'edge',
    },
  },
});
