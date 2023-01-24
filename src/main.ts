import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const options = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };

  // TODO Swagger setup

  const config = new DocumentBuilder()
    .setTitle('Title')
    .setDescription('Description')
    .setVersion('1.0')
    .addTag('Slack')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // TODO end Swagger setup

  app.enableCors(options);
  const port = process.env.PORT || 3000;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // app.use('/slack/events', slackEvents.expressMiddleware());
  /* A raw body is required for Stripe's webhook handler: https://stripe.com/docs/webhooks/signatures */
  app.use(
    '/subscription/events-webhook',
    bodyParser.raw({
      type: 'application/json',
    }),
  );
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  await app.listen(port);
}
bootstrap();
