import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ---- Security ----

  // 1. Helmet: Sets security HTTP headers (XSS, CSP, HSTS, etc.)
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving images cross-origin
    contentSecurityPolicy: false, // Disable CSP for dev; enable in production
  }));

  // 2. CORS: Restrict origins
  app.enableCors({
    origin: [
      'http://localhost:3005',
      'http://localhost:3000',
      process.env.FRONTEND_URL || 'https://hotelcapanaparo.com',
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // 3. Global Validation Pipe: Validates all DTOs automatically
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // Strip unknown properties
    forbidNonWhitelisted: true, // Throw on unknown properties
    transform: true,            // Auto-transform payloads to DTO types
    transformOptions: {
      enableImplicitConversion: true, // Convert string numbers to numbers etc.
    },
  }));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`\n🚀 API running on http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`🛡️  Security: Helmet + CORS + Validation + Rate Limiting`);
}
bootstrap();
