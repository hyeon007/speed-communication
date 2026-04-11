import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AdminRequestAuditInterceptor } from './common/interceptors/admin-request-audit.interceptor';

const DEFAULT_DEVELOPMENT_CORS_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

function resolveCorsOrigins(): string[] {
  const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  if (configuredOrigins.length > 0) {
    if (
      process.env.NODE_ENV === 'production' &&
      configuredOrigins.includes('*')
    ) {
      throw new Error(
        'Production mode does not allow CORS_ALLOWED_ORIGINS to contain a wildcard.',
      );
    }

    return configuredOrigins;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Production mode requires a non-empty CORS_ALLOWED_ORIGINS environment variable.',
    );
  }

  return DEFAULT_DEVELOPMENT_CORS_ORIGINS;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  if (process.env.RATE_LIMIT_TRUST_PROXY_HEADER === 'true') {
    app.set('trust proxy', 1);
  }

  app.enableCors({
    origin: resolveCorsOrigins(),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new AdminRequestAuditInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SP Mobile Promotion API')
    .setDescription('Admin/auth/lead management API documentation')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'admin-bearer',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    customSiteTitle: 'SP API Docs',
  });

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
