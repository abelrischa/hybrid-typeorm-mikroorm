import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DataSource } from "typeorm";
import { EntityManager } from "@mikro-orm/mysql";
import "dotenv/config";

// Parse number of records from command line
const numRecords = parseInt(process.argv[2], 10) || 100;
console.log(`Seeding with ${numRecords} records per entity...`);

async function seed() {
  console.log("🌱 Starting seed process...\n");

  const app = await NestFactory.createApplicationContext(AppModule);
  const typeormDataSource = app.get(DataSource);
  const mikroEm = app.get(EntityManager);

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log("🗑️  Clearing existing data...");
    await mikroEm.getConnection().execute("DELETE FROM post_tags");
    await mikroEm.getConnection().execute("DELETE FROM comments");
    await mikroEm.getConnection().execute("DELETE FROM tags");
    await typeormDataSource.query("DELETE FROM posts");
    await typeormDataSource.query("DELETE FROM users");
    console.log("✅ Cleared existing data\n");

    // Create Users (TypeORM) in batches
    console.log("👥 Creating users (TypeORM) in batches...");
    const userValues = [];
    for (let i = 1; i <= numRecords; i++) {
      userValues.push(
        `('user${i}@example.com', 'User ${i}', 'Bio for user ${i}', NOW(), NOW())`
      );
    }
    const userBatchSize = 1000;
    let users = [];
    for (let i = 0; i < userValues.length; i += userBatchSize) {
      const batch = userValues.slice(i, i + userBatchSize);
      const batchResult = await typeormDataSource.query(`
        INSERT INTO users (email, name, bio, created_at, updated_at)
        VALUES ${batch.join(",\n        ")}
        RETURNING id, email, name
      `);
      users = users.concat(batchResult);
    }
    console.log(`✅ Created ${users.length} users\n`);

    // Create Posts (TypeORM) in batches
    console.log("📝 Creating posts (TypeORM) in batches...");
    const postValues = [];
    for (let i = 1; i <= numRecords; i++) {
      const authorIdx = (i - 1) % users.length;
      postValues.push(
        `('Post Title ${i}', 'Content for post ${i}...', true, ${users[authorIdx].id}, NOW(), NOW())`
      );
    }
    const postBatchSize = 1000;
    let posts = [];
    for (let i = 0; i < postValues.length; i += postBatchSize) {
      const batch = postValues.slice(i, i + postBatchSize);
      const batchResult = await typeormDataSource.query(`
        INSERT INTO posts (title, content, published, author_id, created_at, updated_at)
        VALUES ${batch.join(",\n        ")}
        RETURNING id, title, author_id
      `);
      posts = posts.concat(batchResult);
    }
    console.log(`✅ Created ${posts.length} posts\n`);

    // Create Tags (MikroORM) in batches
    console.log("🏷️  Creating tags (MikroORM) in batches...");
    const tagValues = [];
    for (let i = 1; i <= numRecords; i++) {
      tagValues.push(`('Tag ${i}', 'Description for tag ${i}', NOW(), NOW())`);
    }
    const tagBatchSize = 1000;
    let tags = [];
    for (let i = 0; i < tagValues.length; i += tagBatchSize) {
      const batch = tagValues.slice(i, i + tagBatchSize);
      const batchResult = await mikroEm.getConnection().execute(`
        INSERT INTO tags (name, description, created_at, updated_at)
        VALUES ${batch.join(",\n        ")}
        RETURNING id, name
      `);
      tags = tags.concat(batchResult);
    }
    console.log(`✅ Created ${tags.length} tags\n`);

    // Create Post-Tag relationships (MikroORM) in batches
    console.log("🔗 Creating post-tag relationships (MikroORM) in batches...");
    const postTagValues = [];
    for (let i = 0; i < numRecords; i++) {
      const postId = posts[i]?.id;
      const tagId = tags[i]?.id;
      if (postId && tagId) {
        postTagValues.push(`(${postId}, ${tagId}, NOW())`);
      }
    }
    const postTagBatchSize = 1000;
    for (let i = 0; i < postTagValues.length; i += postTagBatchSize) {
      const batch = postTagValues.slice(i, i + postTagBatchSize);
      if (batch.length > 0) {
        await mikroEm.getConnection().execute(`
          INSERT INTO post_tags (post_id, tag_id, created_at)
          VALUES ${batch.join(",\n        ")}
        `);
      }
    }
    console.log("✅ Created post-tag relationships\n");

    // Create Comments (MikroORM) in batches
    console.log("💬 Creating comments (MikroORM) in batches...");
    const commentValues = [];
    for (let i = 1; i <= numRecords; i++) {
      const userIdx = (i - 1) % users.length;
      const postIdx = (i - 1) % posts.length;
      commentValues.push(
        `('Comment ${i} content', ${users[userIdx].id}, ${posts[postIdx].id}, NOW(), NOW())`
      );
    }
    const commentBatchSize = 1000;
    let comments = [];
    for (let i = 0; i < commentValues.length; i += commentBatchSize) {
      const batch = commentValues.slice(i, i + commentBatchSize);
      const batchResult = await mikroEm.getConnection().execute(`
        INSERT INTO comments (content, user_id, post_id, created_at, updated_at)
        VALUES ${batch.join(",\n        ")}
        RETURNING id
      `);
      comments = comments.concat(batchResult);
    }
    console.log(`✅ Created ${comments.length} comments\n`);

    console.log("================================================");
    console.log("✅ Seed completed successfully!");
    console.log("================================================");
    console.log(`👥 Users: ${users.length} (TypeORM)`);
    console.log(`📝 Posts: ${posts.length} (TypeORM)`);
    console.log(`🏷️  Tags: ${tags.length} (MikroORM)`);
    console.log(`💬 Comments: ${comments.length} (MikroORM)`);
    console.log("================================================\n");
    console.log("🧪 Test the cross-ORM interactions:");
    console.log("   GET /posts/1/details - Post with tags and comments");
    console.log("   GET /users/1/with-comments - User with comments");
    console.log("   GET /tags/2/with-posts - Tag with associated posts");
    console.log("   GET /comments/post/1 - Comments for a post");
    console.log("================================================\n");
  } catch (error) {
    console.error("❌ Seed failed:", error);
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
