import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { User } from "../../typeorm/entities/user.entity";

@Entity({ tableName: "posts" })
export class Post {
  @PrimaryKey()
  id!: number;

  @Property()
  title: string;

  @Property({ type: "text" })
  content: string;

  @Property({ default: true })
  published: boolean;

  @Property({ fieldName: "author_id" })
  authorId: number;

  @Property({ fieldName: "created_at", type: "datetime" })
  createdAt: Date;

  @Property({
    fieldName: "updated_at",
    type: "datetime",
    onUpdate: () => new Date(),
  })
  updatedAt: Date;

  constructor(
    title: string,
    content: string,
    authorId: number,
    published: boolean = true
  ) {
    this.title = title;
    this.content = content;
    this.authorId = authorId;
    this.published = published;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Virtual properties - will be populated from MikroORM
  tags?: any[]; // Tags from MikroORM
  comments?: any[]; // Comments from MikroORM
  commentCount?: number;
  tagCount?: number;
}
