import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'post_tags' })
export class PostTag {
  @PrimaryKey({ columnType: 'int', fieldName: 'post_id' })
  postId: number;

  @PrimaryKey({ columnType: 'int', fieldName: 'tag_id' })
  tagId: number;

  @Property({ fieldName: 'created_at', type: 'datetime' })
  createdAt: Date = new Date();

  constructor(postId: number, tagId: number) {
    this.postId = postId;
    this.tagId = tagId;
  }
}

