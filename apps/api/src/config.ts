export const config = {
  port: process.env.PORT || 3001,
  environment: process.env.NODE_ENV || 'development',
  version: '1.0.0',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
}; 