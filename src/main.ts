import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // Serve static files from public directory
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('\n================================================');
  console.log('🚀 Blog API - Hybrid TypeORM + MikroORM');
  console.log('================================================');
  console.log(`📡 Server running on: http://localhost:${port}`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
  console.log(`ℹ️  Info: http://localhost:${port}/info`);
  console.log(`\n🎨 TEST DASHBOARD: http://localhost:${port}/`);
  console.log('   ↑ Open this in your browser to test everything!');
  console.log('\n📊 TypeORM Entities: User, Post');
  console.log('📊 MikroORM Entities: Comment, Tag, PostTag');
  console.log('\n🔗 Cross-ORM interactions enabled!');
  console.log('================================================\n');
}

bootstrap();

