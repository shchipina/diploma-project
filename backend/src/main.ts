import { NestFactory } from '@nestjs/core';
import { ValidationPipe, LoggerService } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Skill & Knowledge Sharing API')
    .setDescription(
      'API for a platform that enables users to exchange skills and knowledge. ' +
        'Users can create profiles, offer their expertise, request learning opportunities, ' +
        'and connect with others to share knowledge and develop new skills.',
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentication and authorization endpoints')
    .addTag('users', 'User management and profiles')
    .addTag('skills', 'Skills and expertise management')
    .addTag('sessions', 'Learning sessions and bookings')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth('refreshToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refreshToken',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Skill & Knowledge Sharing API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Trace-ID'],
    exposedHeaders: ['X-Trace-ID'],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
  logger.log(
    `Swagger API Documentation: http://localhost:${port}/api/docs`,
    'Bootstrap',
  );
  logger.log(`Log Level: ${process.env.LOG_LEVEL || 'info'}`, 'Bootstrap');
  logger.log(`Trace ID tracking enabled`, 'Bootstrap');
}

void bootstrap();
