module.exports = {
    apps: [
      {
        name: "express-app",       // Name of your Express app
        script: "./index.js",          // Entry point of your Express app
        instances: "max",          // Use all available CPU cores
        exec_mode: "cluster",      // Enable cluster mode for load balancing
        watch: true,               // Restart on file changes (optional for development)
        env: {
          NODE_ENV: "development",
          PORT: 3001              // Environment variable for development
        },
        env_production: {
          NODE_ENV: "production",
          PORT: 3001               // Environment variable for production
        }
      }
    ]
  };
// module.exports = {
//   apps: [
//     {
//       name: "paracelis-app-resource-server",
//       script: "node_modules/next/dist/bin/next",
//       args: "dev -p 3001",       // Run in development mode on port 3001
//       instances: 1,              // Use a single instance for dev
//       watch: true,               // Automatically restart on file changes
//       env: {
//         NODE_ENV: "development", // Set environment to development
//       },
//     },
//   ],
// };