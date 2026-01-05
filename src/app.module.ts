import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { PostsModule } from "./posts/posts.module";
import { CommentsModule } from "./comments/comments.module";
import { TagsModule } from "./tags/tags.module";
import { User } from "./typeorm/entities/user.entity";
import { Post } from "./mikro-orm/entities/post.entity";
import { Comment } from "./mikro-orm/entities/comment.entity";
import { Tag } from "./mikro-orm/entities/tag.entity";
import { PostTag } from "./mikro-orm/entities/post-tag.entity";
import mikroOrmConfig from "./mikro-orm.config";

@Module({
  imports: [
    // TypeORM Configuration - MariaDB
    TypeOrmModule.forRoot({
      type: "mariadb",
      host: process.env.DATABASE_HOST || "localhost",
      port: parseInt(process.env.DATABASE_PORT || "3306"),
      username: process.env.DATABASE_USER || "root",
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME || "blog_db",
      entities: [User],
      synchronize: process.env.NODE_ENV !== "production", // Never true in production
      logging: false,
    }),

    // MikroORM Configuration
    MikroOrmModule.forRoot({
      ...mikroOrmConfig,
      entities: [Comment, Tag, Post, PostTag],
      debug: false,
    }),

    // Feature Modules
    UsersModule,
    PostsModule,
    CommentsModule,
    TagsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
