import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { EntityManager } from '@mikro-orm/mysql';

async function seed() {
  console.log('🌱 Starting seed process...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const typeormDataSource = app.get(DataSource);
  const mikroEm = app.get(EntityManager);

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('🗑️  Clearing existing data...');
    await mikroEm.getConnection().execute('DELETE FROM post_tags');
    await mikroEm.getConnection().execute('DELETE FROM comments');
    await mikroEm.getConnection().execute('DELETE FROM tags');
    await typeormDataSource.query('DELETE FROM posts');
    await typeormDataSource.query('DELETE FROM users');
    console.log('✅ Cleared existing data\n');

    // Create Users (TypeORM)
    console.log('👥 Creating users (TypeORM)...');
    const users = await typeormDataSource.query(`
      INSERT INTO users (email, name, bio, created_at, updated_at)
      VALUES
        ('john@example.com', 'John Doe', 'Software engineer and tech blogger', NOW(), NOW()),
        ('jane@example.com', 'Jane Smith', 'Full-stack developer passionate about ORMs', NOW(), NOW()),
        ('bob@example.com', 'Bob Wilson', 'Database architect and performance enthusiast', NOW(), NOW())
      RETURNING id, email, name
    `);
    console.log(`✅ Created ${users.length} users\n`);

    // Create Posts (TypeORM)
    console.log('📝 Creating posts (TypeORM)...');
    const posts = await typeormDataSource.query(`
      INSERT INTO posts (title, content, published, author_id, created_at, updated_at)
      VALUES
        ('Getting Started with TypeORM', 'TypeORM is a powerful ORM for TypeScript and JavaScript...', true, ${users[0].id}, NOW(), NOW()),
        ('MikroORM vs TypeORM', 'Comparing two popular TypeScript ORMs...', true, ${users[0].id}, NOW(), NOW()),
        ('Database Migration Strategies', 'How to migrate from one ORM to another gradually...', true, ${users[1].id}, NOW(), NOW()),
        ('Performance Optimization Tips', 'Best practices for optimizing database queries...', true, ${users[2].id}, NOW(), NOW()),
        ('Understanding ORM Patterns', 'Active Record vs Data Mapper patterns explained...', true, ${users[1].id}, NOW(), NOW())
      RETURNING id, title, author_id
    `);
    console.log(`✅ Created ${posts.length} posts\n`);

    // Create Tags (MikroORM)
    console.log('🏷️  Creating tags (MikroORM)...');
    const tags = await mikroEm.getConnection().execute(`
      INSERT INTO tags (name, description, created_at, updated_at)
      VALUES
        ('TypeScript', 'TypeScript programming language', NOW(), NOW()),
        ('ORM', 'Object-Relational Mapping', NOW(), NOW()),
        ('Database', 'Database design and optimization', NOW(), NOW()),
        ('Migration', 'Data and schema migration', NOW(), NOW()),
        ('Performance', 'Performance optimization techniques', NOW(), NOW()),
        ('Tutorial', 'Step-by-step tutorials', NOW(), NOW())
      RETURNING id, name
    `);
    console.log(`✅ Created ${tags.length} tags\n`);

    // Create Post-Tag relationships (MikroORM)
    console.log('🔗 Creating post-tag relationships (MikroORM)...');
    await mikroEm.getConnection().execute(`
      INSERT INTO post_tags (post_id, tag_id, created_at)
      VALUES
        (${posts[0].id}, ${tags[0].id}, NOW()),
        (${posts[0].id}, ${tags[1].id}, NOW()),
        (${posts[0].id}, ${tags[5].id}, NOW()),
        (${posts[1].id}, ${tags[0].id}, NOW()),
        (${posts[1].id}, ${tags[1].id}, NOW()),
        (${posts[2].id}, ${tags[1].id}, NOW()),
        (${posts[2].id}, ${tags[3].id}, NOW()),
        (${posts[2].id}, ${tags[2].id}, NOW()),
        (${posts[3].id}, ${tags[2].id}, NOW()),
        (${posts[3].id}, ${tags[4].id}, NOW()),
        (${posts[4].id}, ${tags[1].id}, NOW()),
        (${posts[4].id}, ${tags[5].id}, NOW())
    `);
    console.log('✅ Created post-tag relationships\n');

    // Create Comments (MikroORM)
    console.log('💬 Creating comments (MikroORM)...');
    const comments = await mikroEm.getConnection().execute(`
      INSERT INTO comments (content, user_id, post_id, created_at, updated_at)
      VALUES
        ('Great article! Very helpful for beginners.', ${users[1].id}, ${posts[0].id}, NOW(), NOW()),
        ('I have a question about migrations...', ${users[2].id}, ${posts[0].id}, NOW(), NOW()),
        ('TypeORM has better TypeScript support IMO', ${users[0].id}, ${posts[1].id}, NOW(), NOW()),
        ('But MikroORM has better performance!', ${users[2].id}, ${posts[1].id}, NOW(), NOW()),
        ('This saved me hours of work. Thanks!', ${users[0].id}, ${posts[2].id}, NOW(), NOW()),
        ('Gradual migration is the way to go', ${users[1].id}, ${posts[2].id}, NOW(), NOW()),
        ('What about query optimization?', ${users[1].id}, ${posts[3].id}, NOW(), NOW()),
        ('Excellent tips on indexing!', ${users[0].id}, ${posts[3].id}, NOW(), NOW()),
        ('Data Mapper pattern is cleaner', ${users[2].id}, ${posts[4].id}, NOW(), NOW()),
        ('I prefer Active Record for simplicity', ${users[0].id}, ${posts[4].id}, NOW(), NOW())
      RETURNING id
    `);
    console.log(`✅ Created ${comments.length} comments\n`);

    console.log('================================================');
    console.log('✅ Seed completed successfully!');
    console.log('================================================');
    console.log(`👥 Users: ${users.length} (TypeORM)`);
    console.log(`📝 Posts: ${posts.length} (TypeORM)`);
    console.log(`🏷️  Tags: ${tags.length} (MikroORM)`);
    console.log(`💬 Comments: ${comments.length} (MikroORM)`);
    console.log('================================================\n');
    console.log('🧪 Test the cross-ORM interactions:');
    console.log('   GET /posts/1/details - Post with tags and comments');
    console.log('   GET /users/1/with-comments - User with comments');
    console.log('   GET /tags/2/with-posts - Tag with associated posts');
    console.log('   GET /comments/post/1 - Comments for a post');
    console.log('================================================\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

