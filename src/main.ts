import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS to allow requests from Flutter web app
  app.enableCors({
    origin: [
      'http://localhost:*',     // Allow any localhost port for Flutter web
      'https://utangin.vercel.app', // If you have a frontend hosted on Vercel
      'http://localhost:3000',  // Your local development
      process.env.FRONTEND_URL || 'http://localhost:3000' // For flexibility
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    exposedHeaders: ['Authorization'] // Expose authorization header to client
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
