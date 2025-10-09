import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'tags' })
export class Tag {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  name: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ fieldName: 'created_at', type: 'datetime' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updated_at', type: 'datetime', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(name: string, description?: string) {
    this.name = name;
    this.description = description;
  }

  // Virtual property for post count
  postCount?: number;
}

