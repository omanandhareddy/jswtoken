import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
     origin: 'http://localhost:4200',
    credentials: true, 
  });
  app.use(cookieParser());
 await app.listen(process.env.PORT ?? '0.0.0.0');
}
bootstrap();
