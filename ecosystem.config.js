export default {
  apps: [
    {
      name: 'api-server',
      script: './node_modules/.bin/ts-node', // Gunakan ts-node untuk menjalankan
      args: 'src/index.ts',
      watch: false,
      // Untuk produksi, Anda bisa menjalankan mode cluster untuk scaling otomatis
      // exec_mode: 'cluster',
      // instances: 'max', 
    },
    {
      name: 'enrichment-worker',
      script: './node_modules/.bin/ts-node',
      args: 'src/background/enrichmentService.ts',
      watch: false,
    },
  ],
}
