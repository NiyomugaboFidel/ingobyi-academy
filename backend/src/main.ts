import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { EnvConfig } from './config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService<EnvConfig, true>);
  const port = config.get('PORT', { infer: true });
  const frontendUrl = config.get('FRONTEND_URL', { infer: true });
  const nodeEnv = config.get('NODE_ENV', { infer: true });

  app.setGlobalPrefix('api');
  // Railway / reverse proxies
  if (nodeEnv === 'production' || nodeEnv === 'staging') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }
  app.use(helmet());
  app.use(cookieParser());
  const corsStrict = nodeEnv === 'production' || nodeEnv === 'staging';
  app.enableCors({
    origin: corsStrict ? frontendUrl : true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const enableSwagger =
    config.get('ENABLE_SWAGGER', { infer: true }) || nodeEnv === 'development';

  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Ingobyi Academy API')
      .setDescription(
        'Multi-tenant learning infrastructure platform for schools, training centers, and organizations.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    console.log(`Swagger docs:  http://localhost:${port}/api/docs`);
  }

  await app.listen(port, '0.0.0.0');
  console.log(`Ingobyi Academy API running on port ${port} (${nodeEnv})`);
  console.log(`Route index:   http://localhost:${port}/api/routes`);
}

bootstrap();
