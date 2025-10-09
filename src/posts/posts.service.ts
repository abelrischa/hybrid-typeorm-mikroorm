import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityManager } from '@mikro-orm/mysql';
import { Post } from '../typeorm/entities/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @Inject(EntityManager)
    private readonly mikroEm: EntityManager,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const { tagIds, ...postData } = createPostDto;
    
    // Create post using TypeORM
    const post = this.postRepository.create(postData);
    const savedPost = await this.postRepository.save(post);

    // CROSS-ORM INTERACTION: Add tags using MikroORM
    if (tagIds && tagIds.length > 0) {
      await this.addTagsToPost(savedPost.id, tagIds);
    }

    return savedPost;
  }

  async addTagsToPost(postId: number, tagIds: number[]): Promise<void> {
    // CROSS-ORM INTERACTION: Insert into post_tags using MikroORM connection
    for (const tagId of tagIds) {
      await this.mikroEm
        .getConnection()
        .execute(
          `INSERT IGNORE INTO post_tags (post_id, tag_id, created_at) 
           VALUES (?, ?, NOW())`,
          [postId, tagId]
        );
    }
  }

  async findAll(): Promise<Post[]> {
    const posts = await this.postRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });

    // CROSS-ORM INTERACTION: Enrich with MikroORM data
    for (const post of posts) {
      await this.enrichPostWithMikroData(post);
    }

    return posts;
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // CROSS-ORM INTERACTION: Enrich with MikroORM data
    await this.enrichPostWithMikroData(post);

    return post;
  }

  async findOneWithDetails(id: number): Promise<any> {
    const post = await this.findOne(id);

    // CROSS-ORM INTERACTION: Fetch full comments and tags from MikroORM
    const comments = await this.mikroEm
      .getConnection()
      .execute(
        `SELECT c.*, u.name as author_name, u.email as author_email
         FROM comments c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.post_id = ?
         ORDER BY c.created_at DESC`,
        [id]
      );

    const tags = await this.mikroEm
      .getConnection()
      .execute(
        `SELECT t.* FROM tags t
         INNER JOIN post_tags pt ON pt.tag_id = t.id
         WHERE pt.post_id = ?`,
        [id]
      );

    return {
      ...post,
      comments,
      tags,
    };
  }

  private async enrichPostWithMikroData(post: Post): Promise<void> {
    // Get comment count
    const commentResult = await this.mikroEm
      .getConnection()
      .execute(
        `SELECT COUNT(*) as count FROM comments WHERE post_id = ?`,
        [post.id]
      );
    post.commentCount = parseInt(commentResult[0].count);

    // Get tag count and names
    const tagResult = await this.mikroEm
      .getConnection()
      .execute(
        `SELECT t.id, t.name 
         FROM tags t
         INNER JOIN post_tags pt ON pt.tag_id = t.id
         WHERE pt.post_id = ?`,
        [post.id]
      );
    post.tags = tagResult;
    post.tagCount = tagResult.length;
  }

  async update(id: number, updateData: Partial<CreatePostDto>): Promise<Post> {
    const { tagIds, ...postData } = updateData;
    const post = await this.findOne(id);
    
    Object.assign(post, postData);
    const updated = await this.postRepository.save(post);

    // CROSS-ORM INTERACTION: Update tags if provided
    if (tagIds !== undefined) {
      // Remove existing tags
      await this.mikroEm
        .getConnection()
        .execute(`DELETE FROM post_tags WHERE post_id = ?`, [id]);
      
      // Add new tags
      if (tagIds.length > 0) {
        await this.addTagsToPost(id, tagIds);
      }
    }

    return updated;
  }

  async remove(id: number): Promise<void> {
    const post = await this.findOne(id);
    await this.postRepository.remove(post);
    // Foreign keys will cascade delete comments and post_tags
  }

  async findByAuthor(authorId: number): Promise<Post[]> {
    const posts = await this.postRepository.find({
      where: { authorId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });

    for (const post of posts) {
      await this.enrichPostWithMikroData(post);
    }

    return posts;
  }

  // CROSS-ORM: Link post to tag
  async linkToTag(postId: number, tagId: number): Promise<{ message: string }> {
    // Verify post exists (TypeORM)
    await this.findOne(postId);
    
    // Verify tag exists (MikroORM)
    const tagExists = await this.mikroEm
      .getConnection()
      .execute(`SELECT id FROM tags WHERE id = ?`, [tagId]);
    
    if (!tagExists || tagExists.length === 0) {
      throw new NotFoundException(`Tag with ID ${tagId} not found`);
    }

    // Link them
    await this.mikroEm
      .getConnection()
      .execute(
        `INSERT IGNORE INTO post_tags (post_id, tag_id, created_at) VALUES (?, ?, NOW())`,
        [postId, tagId]
      );

    return { message: `Post ${postId} linked to tag ${tagId}` };
  }

  // Get all tags for a post
  async getPostTags(postId: number): Promise<any[]> {
    await this.findOne(postId); // Verify post exists
    
    const tags = await this.mikroEm
      .getConnection()
      .execute(
        `SELECT t.* FROM tags t
         INNER JOIN post_tags pt ON pt.tag_id = t.id
         WHERE pt.post_id = ?`,
        [postId]
      );

    return tags;
  }
}

