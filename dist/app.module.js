"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const nestjs_1 = require("@mikro-orm/nestjs");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const users_module_1 = require("./users/users.module");
const posts_module_1 = require("./posts/posts.module");
const comments_module_1 = require("./comments/comments.module");
const tags_module_1 = require("./tags/tags.module");
const user_entity_1 = require("./typeorm/entities/user.entity");
const post_entity_1 = require("./typeorm/entities/post.entity");
const comment_entity_1 = require("./mikro-orm/entities/comment.entity");
const tag_entity_1 = require("./mikro-orm/entities/tag.entity");
const post_tag_entity_1 = require("./mikro-orm/entities/post-tag.entity");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mariadb',
                host: process.env.DATABASE_HOST || 'localhost',
                port: parseInt(process.env.DATABASE_PORT || '3306'),
                username: process.env.DATABASE_USER || 'root',
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME || 'blog_db',
                entities: [user_entity_1.User, post_entity_1.Post],
                synchronize: process.env.NODE_ENV !== 'production',
                logging: false,
            }),
            nestjs_1.MikroOrmModule.forRoot({
                ...mikro_orm_config_1.default,
                entities: [comment_entity_1.Comment, tag_entity_1.Tag, post_tag_entity_1.PostTag],
                debug: false,
            }),
            users_module_1.UsersModule,
            posts_module_1.PostsModule,
            comments_module_1.CommentsModule,
            tags_module_1.TagsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map