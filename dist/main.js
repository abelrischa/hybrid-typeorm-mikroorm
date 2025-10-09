"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors();
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
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
//# sourceMappingURL=main.js.map