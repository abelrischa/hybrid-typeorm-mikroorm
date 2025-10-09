import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'comments' })
export class Comment {
  @PrimaryKey()
  id!: number;

  @Property({ type: 'text' })
  content: string;

  @Property({ columnType: 'int', fieldName: 'user_id' })
  userId: number;

  @Property({ columnType: 'int', fieldName: 'post_id' })
  postId: number;

  @Property({ fieldName: 'created_at', type: 'datetime' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updated_at', type: 'datetime', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(content: string, userId: number, postId: number) {
    this.content = content;
    this.userId = userId;
    this.postId = postId;
  }

  // Virtual properties populated from TypeORM cross-ORM queries
  author?: any;
  post?: any;
}

