import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  outDir: 'output',
  manifest: {
    name: 'EDHREC Planarbridge',
    description: 'EDHRECのカードページに日本のMTGショップへのリンクを追加',
    permissions: ['storage'],
    host_permissions: ['https://edhrec.com/*'],
  },
});
