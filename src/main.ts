import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // security reasons
  app.use(helmet());

  await app.listen(process.env.APP_PORT);
  Logger.log(
    `Api-gateway listening on http://localhost:${process.env.APP_PORT}/graphql`,
    'Bootstrap',
  );
}
bootstrap();
