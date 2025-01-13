import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import * as express from 'express';
import { HttpExceptionFilter } from '@shared/filters/http-exception.filter';
import { LoggingInterceptor } from '@shared/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: ['log','error'] });

  const config = new DocumentBuilder()
    .setTitle('marketplace')
    .setDescription('The marketplace API description')
    .setVersion('1.0')
    .addTag('marketplace')
    .addBearerAuth(
      {
        description: `Please enter token in following format: JWT`,
        name: 'Authorization',
        bearerFormat: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors( new LoggingInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use('/public', express.static(join(__dirname, '..', 'public')));

  await app.listen(process.env.PORT, '0.0.0.0');
}

bootstrap();
