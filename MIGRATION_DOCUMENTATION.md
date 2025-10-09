# Migrating from TypeORM to MikroORM: A Practical Experience

**Author:** Yashwanth Reddy  
**Course:** Graduate Database Systems  
**Date:** October 2025  
**Project:** Blog API Migration

---

## Table of Contents

1. [Introduction](#introduction)
2. [Why Migrate?](#why-migrate)
3. [The Migration Strategy](#the-migration-strategy)
4. [Implementation Details](#implementation-details)
5. [Problems Encountered](#problems-encountered)
6. [Solutions and Fixes](#solutions-and-fixes)
7. [Lessons Learned](#lessons-learned)
8. [Conclusion](#conclusion)

---

## Introduction

This document describes my experience migrating a blog API from TypeORM to MikroORM. Instead of doing a complete rewrite (which would be risky), I chose an incremental approach where both ORMs run simultaneously on the same database. This allowed me to migrate features gradually while keeping the application running.

### What is an ORM?

ORM stands for Object-Relational Mapping. It's a tool that lets you work with databases using regular programming objects instead of writing SQL queries. For example, instead of writing:

```sql
SELECT * FROM users WHERE id = 1;
```

You can write:
```typescript
userRepository.findOne({ where: { id: 1 } });
```

ORMs make database operations easier and more maintainable, but different ORMs have different strengths and weaknesses.

### The Project

I built a blog API with these features:
- User accounts
- Blog posts
- Comments on posts
- Tags for categorizing posts

The goal was to migrate from TypeORM (the old ORM) to MikroORM (the new one) without breaking the application.

---

## Why Migrate?

Before starting this project, I researched both ORMs to understand their differences.

### TypeORM

**Pros:**
- Very popular, lots of documentation
- Easy to learn for beginners
- Works with many databases

**Cons:**
- Development has slowed down recently
- Performance issues with complex queries
- Some bugs take a long time to fix

### MikroORM

**Pros:**
- Better performance, especially with complex relationships
- More modern architecture
- Active development and quick bug fixes
- Better TypeScript support
- Cleaner API design

**Cons:**
- Smaller community
- Less documentation for edge cases
- Steeper learning curve initially

### My Decision

I decided to migrate because:
1. MikroORM has better long-term support
2. Performance improvements would help as the application grows
3. The API is cleaner and more intuitive once you learn it
4. Learning a new ORM would be valuable for my career

---

## The Migration Strategy

Instead of migrating everything at once (which would be risky), I used a "hybrid" approach:

### Phase 1: Keep Existing Features in TypeORM
- Users (already implemented)
- Posts (already implemented)

### Phase 2: Add New Features in MikroORM
- Comments (new feature)
- Tags (new feature)

### Phase 3: Cross-ORM Integration
- Make MikroORM entities reference TypeORM entities
- Example: Comments (MikroORM) need to reference Users and Posts (TypeORM)

### Future Phases (Not Implemented)
- Phase 4: Gradually migrate old entities to MikroORM
- Phase 5: Remove TypeORM completely

### Why This Approach?

This strategy is called "Strangler Fig Pattern" (yes, it's named after a tree!). The idea is:
1. Keep the old system running
2. Build new features with the new system
3. Gradually replace old features
4. Eventually remove the old system

**Benefits:**
- Lower risk - if something breaks, only new features are affected
- Can test thoroughly at each step
- Users don't experience downtime
- Can roll back easily if needed

---

## Implementation Details

### Database Setup

Both ORMs connect to the same MariaDB database but manage different tables:

**TypeORM manages:**
```
users
  ├── id
  ├── email
  ├── name
  ├── bio
  ├── created_at
  └── updated_at

posts
  ├── id
  ├── title
  ├── content
  ├── author_id (references users.id)
  ├── published
  ├── created_at
  └── updated_at
```

**MikroORM manages:**
```
comments
  ├── id
  ├── content
  ├── user_id (references users.id)
  ├── post_id (references posts.id)
  ├── created_at
  └── updated_at

tags
  ├── id
  ├── name
  ├── description
  ├── created_at
  └── updated_at

post_tags
  ├── post_id (references posts.id)
  ├── tag_id (references tags.id)
  └── created_at
```

### Configuration Challenge

One of the first challenges was configuring both ORMs to work together:

```typescript
// In app.module.ts
@Module({
  imports: [
    // TypeORM configuration
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: 'localhost',
      // ... other config
      entities: [User, Post],  // Only TypeORM entities
    }),
    
    // MikroORM configuration
    MikroOrmModule.forRoot({
      // ... config
      entities: [Comment, Tag, PostTag],  // Only MikroORM entities
    }),
  ],
})
```

The trick was making sure each ORM only manages its own tables but can read from the others.

### Cross-ORM Queries

The most interesting part was making entities from one ORM reference entities from the other.

**Example: Creating a Comment**

When a user creates a comment, I need to:
1. Verify the user exists (TypeORM)
2. Verify the post exists (TypeORM)
3. Create the comment (MikroORM)

Here's how I did it:

```typescript
async create(createCommentDto: CreateCommentDto): Promise<Comment> {
  // Check if user exists (TypeORM database)
  const user = await this.typeormDataSource
    .getRepository('User')
    .findOne({ where: { id: createCommentDto.userId } });
  
  if (!user) {
    throw new Error('User not found');
  }

  // Check if post exists (TypeORM database)
  const post = await this.typeormDataSource
    .getRepository('Post')
    .findOne({ where: { id: createCommentDto.postId } });
  
  if (!post) {
    throw new Error('Post not found');
  }

  // Create the comment (MikroORM)
  const comment = new Comment(
    createCommentDto.content,
    createCommentDto.userId,
    createCommentDto.postId
  );
  
  await this.em.persistAndFlush(comment);
  return comment;
}
```

This ensures data integrity - you can't create a comment for a non-existent user or post.

---

## Problems Encountered

### Problem 1: "TypeError: not enough arguments"

**What Happened:**

When I tried to create a comment through the web interface, I got this error:

```
TypeError: not enough arguments
```

The error was confusing because the function call looked correct.

**Investigation:**

After debugging, I found the issue was in how I was creating MikroORM entities. I was using this pattern:

```typescript
const comment = new Comment();
comment.content = createCommentDto.content;
comment.userId = createCommentDto.userId;
comment.postId = createCommentDto.postId;
```

But MikroORM v6 (the version I was using) doesn't work well with this approach, especially for timestamps.

**Root Cause:**

I was using `onCreate` callbacks for timestamps:

```typescript
@Property({ onCreate: () => new Date(), fieldName: 'created_at' })
createdAt!: Date;
```

When combined with calling `new Comment()` without arguments, MikroORM got confused about when to call these onCreate functions. It expected the constructor to set required fields, but I was setting them after creation.

---

### Problem 2: Inconsistent Entity Patterns

**What Happened:**

The Comment entity was fixed, but I later discovered the Tag and PostTag entities had the same issue. They were working temporarily, but could fail under certain conditions.

**The Issue:**

Different entities were using different patterns:
- Comment: Using constructor (after fix)
- Tag: Using onCreate callbacks (old pattern)
- PostTag: Using onCreate callbacks (old pattern)

This inconsistency made the code confusing and error-prone.

---

### Problem 3: Hardcoded Database Password

**What Happened:**

During a code review, I noticed this in my configuration:

```typescript
password: process.env.DATABASE_PASSWORD || '1234',
```

This is a security problem. If the environment variable is missing, the app uses '1234' as the password. Anyone who finds the code could access the database!

---

### Problem 4: Dangerous Production Settings

**What Happened:**

The application had this setting:

```typescript
synchronize: true
```

This tells TypeORM to automatically update the database schema to match your code. It's convenient during development but extremely dangerous in production.

**Why is this dangerous?**

If you:
- Delete an entity → TypeORM drops the entire table
- Rename a field → TypeORM drops and recreates the column (losing data)
- Change a relationship → TypeORM might drop foreign keys

In production, this could delete all your user data!

---

## Solutions and Fixes

### Fix 1: Constructor Pattern for MikroORM Entities

**Solution:**

I changed all MikroORM entities to use a constructor pattern:

```typescript
@Entity({ tableName: 'comments' })
export class Comment {
  @PrimaryKey()
  id!: number;

  @Property()
  content: string;

  @Property()
  userId: number;

  @Property()
  postId: number;

  // Use default values instead of onCreate
  @Property({ fieldName: 'created_at', type: 'datetime' })
  createdAt: Date = new Date();

  @Property({ 
    fieldName: 'updated_at', 
    type: 'datetime',
    onUpdate: () => new Date()  // Still use onUpdate
  })
  updatedAt: Date = new Date();

  // Constructor that requires necessary fields
  constructor(content: string, userId: number, postId: number) {
    this.content = content;
    this.userId = userId;
    this.postId = postId;
  }
}
```

**Why This Works:**

1. The constructor forces you to provide required fields
2. TypeScript can verify you're creating entities correctly
3. Timestamps get default values immediately
4. No confusion about when onCreate callbacks run
5. MikroORM v6 handles this pattern correctly

**Updated Service Code:**

```typescript
async create(createCommentDto: CreateCommentDto): Promise<Comment> {
  // Validation code...
  
  // Clean, one-line entity creation
  const comment = new Comment(
    createCommentDto.content,
    createCommentDto.userId,
    createCommentDto.postId
  );
  
  await this.em.persistAndFlush(comment);
  return comment;
}
```

I applied this same pattern to Tag and PostTag entities for consistency.

---

### Fix 2: Remove Hardcoded Credentials

**Solution:**

Changed the configuration to require environment variables:

```typescript
// Before
password: process.env.DATABASE_PASSWORD || '1234',

// After
password: process.env.DATABASE_PASSWORD,
```

Now if the environment variable is missing, the application fails to start with a clear error message. This forces developers to set up proper credentials.

**Added .env.example:**

Created a template file for others to use:

```
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password_here
DATABASE_NAME=blog_db
```

This shows what variables are needed without exposing real credentials.

---

### Fix 3: Environment-Based Synchronize Setting

**Solution:**

Changed the synchronize setting to be environment-aware:

```typescript
// Before
synchronize: true,

// After
synchronize: process.env.NODE_ENV !== 'production',
```

Now:
- **Development:** synchronize = true (auto-updates schema, convenient)
- **Production:** synchronize = false (safe, requires manual migrations)

This prevents accidental data loss in production while keeping development convenient.

---

### Fix 4: Enhanced Startup Script

**Problem:** 

The `.env` file wasn't being loaded automatically.

**Solution:**

Updated the startup script to load environment variables:

```bash
# Load environment variables from .env
if [ -f .env ]; then
    echo "📋 Loading environment variables from .env..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Start the application
nest start --watch
```

Now the environment variables are available to the application.

---

## Lessons Learned

### 1. Read the Official Documentation Carefully

When I first encountered the "not enough arguments" error, I searched on Stack Overflow and GitHub issues. Most solutions were for older versions of MikroORM.

**Lesson:** Always check the official documentation for your specific version. MikroORM v6 documentation clearly explains the constructor pattern, but I initially missed it.

### 2. Consistency Matters

Having Comment use one pattern and Tag use another created confusion. When I fixed Comment but forgot about Tag, I created a "ticking time bomb" - Tag would eventually fail with the same error.

**Lesson:** When you fix a pattern issue, search your entire codebase for similar patterns and fix them all at once.

### 3. Security Should Be Built-In

The hardcoded password fallback seemed convenient during development ("if I forget to set the variable, it still works!"). But this convenience is dangerous.

**Lesson:** Make your application fail loudly when security requirements aren't met. It's better to crash during development than leak data in production.

### 4. Test Cross-ORM Interactions Thoroughly

The most complex part of this project was making two ORMs work together. I had to test:
- Creating comments for existing posts (works)
- Creating comments for deleted posts (should fail)
- Creating comments for non-existent users (should fail)
- Updating a post and seeing comment counts update (works)

**Lesson:** Cross-system integration needs extensive testing. Write tests for both success and failure cases.

### 5. The Strangler Fig Pattern is Effective

By keeping old features in TypeORM and adding new ones in MikroORM, I was able to:
- Keep the application running
- Learn MikroORM gradually
- Test thoroughly before migrating more
- Roll back easily if needed

**Lesson:** Incremental migration is less risky than a complete rewrite. You can ship features while migrating.

### 6. Documentation is Crucial

I created many documentation files during development (.md files explaining different fixes). Later, I had to clean them up because they were scattered and confusing.

**Lesson:** Keep documentation organized from the start. One clear README is better than ten scattered files.

### 7. TypeScript Helps Catch Errors Early

The constructor pattern works better with TypeScript because:

```typescript
// This will fail at compile time (not runtime)
const comment = new Comment();  // Error: Expected 3 arguments

// This is correct
const comment = new Comment('content', 1, 2);  // ✓
```

**Lesson:** Use TypeScript's type system to prevent errors before running the code.

---

## Technical Comparison

After working with both ORMs, here's my practical comparison:

### Entity Definition

**TypeORM:**
```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @CreateDateColumn()
  createdAt: Date;  // Automatic
}
```

**MikroORM:**
```typescript
@Entity()
export class Comment {
  @PrimaryKey()
  id!: number;

  @Property()
  content: string;

  @Property()
  createdAt: Date = new Date();  // Explicit

  constructor(content: string) {
    this.content = content;
  }
}
```

**My Take:** TypeORM is more "magical" (does things automatically), MikroORM is more explicit (you see exactly what's happening). I prefer MikroORM's approach because it's clearer.

### Creating Entities

**TypeORM:**
```typescript
const user = this.repository.create({ email, name });
await this.repository.save(user);
```

**MikroORM:**
```typescript
const comment = new Comment(content, userId, postId);
await this.em.persistAndFlush(comment);
```

**My Take:** Both are simple, but MikroORM's constructor approach gives better TypeScript support.

### Querying

**TypeORM:**
```typescript
const users = await this.repository.find({
  where: { email: 'test@example.com' },
  relations: ['posts'],
});
```

**MikroORM:**
```typescript
const comments = await this.repository.find(
  { userId: 1 },
  { orderBy: { createdAt: 'DESC' } }
);
```

**My Take:** TypeORM's query builder is more intuitive for complex queries, but MikroORM's is more consistent and type-safe.

---

## Challenges That Remain

### 1. Learning Curve

MikroORM has less documentation and fewer Stack Overflow answers. When I hit issues, I often had to:
- Read the source code
- Ask on Discord
- Experiment to find solutions

### 2. Maintaining Two ORMs

Running both ORMs increases complexity:
- Two sets of configuration
- Two different patterns to remember
- Need to ensure both stay in sync with database

**Future Goal:** Eventually migrate everything to MikroORM and remove TypeORM.

### 3. Testing

I don't have automated tests yet. I tested manually by:
- Using the web interface
- Sending curl commands
- Checking the database directly

**Future Goal:** Write unit tests and integration tests for all cross-ORM interactions.

---

## Conclusion

Migrating from TypeORM to MikroORM taught me valuable lessons about:
- **Incremental migration strategies** - Don't rewrite everything at once
- **ORM internals** - How ORMs handle entity creation and timestamps
- **Security best practices** - Never hardcode credentials
- **Environment management** - Different settings for dev vs production
- **Cross-system integration** - Making two systems work together
- **Documentation** - Keeping it clear and organized

### Was It Worth It?

Yes! The migration was successful because:
1. ✅ Both ORMs work together smoothly
2. ✅ All features work correctly
3. ✅ The code is cleaner and more maintainable
4. ✅ Security issues are fixed
5. ✅ The application is production-ready (after adding authentication)

### What I Would Do Differently

If I started over, I would:
1. Read MikroORM v6 documentation thoroughly before starting
2. Write tests from the beginning
3. Plan the entity patterns before implementing
4. Set up security properly from day one
5. Keep documentation organized from the start

### Future Work

Next steps for this project:
1. Add authentication and authorization
2. Write comprehensive tests
3. Migrate Posts from TypeORM to MikroORM
4. Migrate Users from TypeORM to MikroORM
5. Remove TypeORM completely
6. Add performance monitoring
7. Deploy to production

### Final Thoughts

This project showed me that migration doesn't have to be all-or-nothing. The Strangler Fig Pattern let me migrate gradually while keeping the application running. This is especially important in real-world scenarios where you can't afford downtime.

The problems I encountered (TypeErrors, security issues, inconsistent patterns) are common in migration projects. The key is to:
- Test thoroughly
- Fix issues completely (not just the symptoms)
- Document your decisions
- Learn from mistakes

I'm now confident working with both ORMs and understand when to use each one. This experience has prepared me for future migration projects and given me deeper knowledge of how ORMs work under the hood.

---

## Appendix: Code Samples

### Complete Comment Entity

```typescript
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'comments' })
export class Comment {
  @PrimaryKey()
  id!: number;

  @Property()
  content: string;

  @Property({ fieldName: 'user_id' })
  userId: number;

  @Property({ fieldName: 'post_id' })
  postId: number;

  @Property({ fieldName: 'created_at', type: 'datetime' })
  createdAt: Date = new Date();

  @Property({ 
    fieldName: 'updated_at', 
    type: 'datetime',
    onUpdate: () => new Date()
  })
  updatedAt: Date = new Date();

  constructor(content: string, userId: number, postId: number) {
    this.content = content;
    this.userId = userId;
    this.postId = postId;
  }
}
```

### Complete Comments Service

```typescript
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { DataSource } from 'typeorm';
import { Comment } from '../mikro-orm/entities/comment.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: EntityRepository<Comment>,
    @Inject(EntityManager)
    private readonly em: EntityManager,
    @Inject(DataSource)
    private readonly typeormDataSource: DataSource,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    // Verify user exists in TypeORM
    const user = await this.typeormDataSource
      .getRepository('User')
      .findOne({ where: { id: createCommentDto.userId } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${createCommentDto.userId} not found`);
    }

    // Verify post exists in TypeORM
    const post = await this.typeormDataSource
      .getRepository('Post')
      .findOne({ where: { id: createCommentDto.postId } });
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${createCommentDto.postId} not found`);
    }

    // Create comment using MikroORM
    const comment = new Comment(
      createCommentDto.content,
      createCommentDto.userId,
      createCommentDto.postId
    );
    
    await this.em.persistAndFlush(comment);
    return comment;
  }

  async findAll(): Promise<any[]> {
    const comments = await this.commentRepository.findAll({
      orderBy: { createdAt: 'DESC' },
    });

    // Enrich with TypeORM data
    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        return await this.enrichCommentWithTypeOrmData(comment);
      })
    );

    return enrichedComments;
  }

  private async enrichCommentWithTypeOrmData(comment: Comment): Promise<any> {
    // Fetch user data from TypeORM
    const user = await this.typeormDataSource
      .getRepository('User')
      .createQueryBuilder('user')
      .select(['user.id', 'user.name', 'user.email'])
      .where('user.id = :userId', { userId: comment.userId })
      .getOne();

    // Fetch post data from TypeORM
    const post = await this.typeormDataSource
      .getRepository('Post')
      .createQueryBuilder('post')
      .select(['post.id', 'post.title'])
      .where('post.id = :postId', { postId: comment.postId })
      .getOne();

    return {
      ...comment,
      author: user,
      post: post,
    };
  }
}
```

### Environment Configuration

**.env file:**
```
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=1234
DATABASE_NAME=blog_db
PORT=3000
NODE_ENV=development
```

### Application Module

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './typeorm/entities/user.entity';
import { Post } from './typeorm/entities/post.entity';
import { Comment } from './mikro-orm/entities/comment.entity';
import { Tag } from './mikro-orm/entities/tag.entity';
import { PostTag } from './mikro-orm/entities/post-tag.entity';
import mikroOrmConfig from './mikro-orm.config';

@Module({
  imports: [
    // TypeORM Configuration
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '3306'),
      username: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME || 'blog_db',
      entities: [User, Post],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: false,
    }),

    // MikroORM Configuration
    MikroOrmModule.forRoot({
      ...mikroOrmConfig,
      entities: [Comment, Tag, PostTag],
      debug: false,
    }),
  ],
})
export class AppModule {}
```

---

**End of Documentation**

This migration project demonstrates practical database system concepts including ORM abstraction layers, incremental refactoring strategies, and cross-system data integrity. The experience provided hands-on learning about modern database access patterns and migration best practices.
