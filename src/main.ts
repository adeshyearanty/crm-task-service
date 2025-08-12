import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix
  app.setGlobalPrefix('tasks');

  // Enable CORS
  app.enableCors({
    origin: true, // or specify origins: ['http://localhost:3000', 'https://yourdomain.com']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // credentials: true, // if you need to pass cookies/authentication
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  // or "app.enableVersioning()"
  app.enableVersioning({
    type: VersioningType.URI,
    // prefix: 'v', // Now routes will be like /version-1/route
  });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Task Service API')
    .setDescription(
      `The task management service running on ${process.env.NODE_ENV} environment.`,
    )
    .setVersion('1.0.0')
    // .addBearerAuth(
    //   { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    //   'JWT-auth',
    // )
    .build();

  // if (process.env.NODE_ENV !== 'production') {
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);
  // }

  await app
    .listen(process.env.PORT ?? 3005)
    .then(async () =>
      Logger.log(
        `Task Service is running on ${await app.getUrl()} as ${process.env.NODE_ENV} environment.`,
      ),
    );
}

bootstrap().catch((err) => {
  console.error('Failed to bootstrap the application', err);
  throw err;
});
