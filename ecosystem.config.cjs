module.exports = {
  apps: [
    {
      name: 'mentis_server',
      script: 'dist/server.js',
      instances: 1,
      autorestart: true,
      exec_mode: 'fork', // To ensure one process
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      watch: true,       // Watch file changes
      ignore_watch: ['node_modules', 'logs', 'tmp', 'src/migrations'],
      watch_options: {
        usePolling: true  // Enable polling to ensure that file changes are detected
      }
    }
  ]
};
