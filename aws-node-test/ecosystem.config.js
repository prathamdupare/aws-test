module.exports = {
  apps: [{
    name: "my-node-api",
    script: "./server.js",
    instances: 1, // Just 1 for testing
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
}
