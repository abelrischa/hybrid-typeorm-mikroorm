import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { MySqlDriver } from '@mikro-orm/mysql';
import { Comment } from './mikro-orm/entities/comment.entity';
import { Tag } from './mikro-orm/entities/tag.entity';
import { PostTag } from './mikro-orm/entities/post-tag.entity';

const config: MikroOrmModuleOptions = {
  driver: MySqlDriver,
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD,
  dbName: process.env.DATABASE_NAME || 'blog_db',
  entities: [Comment, Tag, PostTag],
  migrations: {
    path: './src/mikro-orm/migrations',
    pathTs: './src/mikro-orm/migrations',
  },
  debug: false,
  allowGlobalContext: true, // For CLI usage
  ensureDatabase: { create: true }, // Auto-create database if needed
};

export default config;

