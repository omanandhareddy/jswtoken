import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for both production and development
  app.enableCors({
    origin: [
      'http://localhost:4000',  
      'https://comicverseproject.onrender.com'  // Production
    ],
    credentials: true,
  });
  
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
