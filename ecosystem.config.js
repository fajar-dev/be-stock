module.exports = {
  apps: [
    {
      name: "be-stock-module-service",
      script: "bun",
      args: "dist/index.js",
      interpreter: "none",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,

      env_file: ".env",
    },
  ],
};
