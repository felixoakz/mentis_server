module.exports = {
  apps: [
    {
      name: 'daemonoakz_server',
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'fork', // To ensure one process
      watch: true,       // Watch file changes
      ignore_watch: ['src/migrations'],  // Avoid watching migrations
      watch_options: {
        usePolling: true  // Enable polling to ensure that file changes are detected
      }
    }
  ]
};
