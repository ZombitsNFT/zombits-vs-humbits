module.exports = {
  apps: [
    {
      name: "humbits-vs-zombits-server",
      script: "./index.js",
      env_production: {
        NODE_ENV: "production",
        PORT: 80,
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
  ],
};
