import { DataSource } from "typeorm";
import { User } from "./entities/user.entity";
import { Post } from "../mikro-orm/entities/post.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  username: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD || "postgres",
  database: process.env.DATABASE_NAME || "blog_hybrid",
  schema: "public",
  entities: [User, Post],
  migrations: ["src/typeorm/migrations/*.ts"],
  synchronize: false, // Use migrations in production
  logging: true,
});
