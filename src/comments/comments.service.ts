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
    // CROSS-ORM INTERACTION: Verify user and post exist in TypeORM
    const user = await this.typeormDataSource
      .getRepository('User')
      .findOne({ where: { id: createCommentDto.userId } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${createCommentDto.userId} not found`);
    }

    const post = await this.typeormDataSource
      .getRepository('Post')
      .findOne({ where: { id: createCommentDto.postId } });
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${createCommentDto.postId} not found`);
    }

    // Create comment using MikroORM with proper constructor
    const comment = new Comment(
      createCommentDto.content,
      createCommentDto.userId,
      createCommentDto.postId
    );
    
    // Persist using proper MikroORM pattern
    await this.em.persistAndFlush(comment);
    
    return comment;
  }

  async findAll(): Promise<any[]> {
    const comments = await this.commentRepository.findAll({
      orderBy: { createdAt: 'DESC' },
    });

    // CROSS-ORM INTERACTION: Enrich with TypeORM data
    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        return await this.enrichCommentWithTypeOrmData(comment);
      })
    );

    return enrichedComments;
  }

  async findOne(id: number): Promise<any> {
    const comment = await this.commentRepository.findOne({ id });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return await this.enrichCommentWithTypeOrmData(comment);
  }

  async findByPost(postId: number): Promise<any[]> {
    const comments = await this.commentRepository.find(
      { postId },
      { orderBy: { createdAt: 'DESC' } }
    );

    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        return await this.enrichCommentWithTypeOrmData(comment);
      })
    );

    return enrichedComments;
  }

  async findByUser(userId: number): Promise<any[]> {
    const comments = await this.commentRepository.find(
      { userId },
      { orderBy: { createdAt: 'DESC' } }
    );

    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        return await this.enrichCommentWithTypeOrmData(comment);
      })
    );

    return enrichedComments;
  }

  private async enrichCommentWithTypeOrmData(comment: Comment): Promise<any> {
    // CROSS-ORM INTERACTION: Fetch user data from TypeORM
    const user = await this.typeormDataSource
      .getRepository('User')
      .createQueryBuilder('user')
      .select(['user.id', 'user.name', 'user.email'])
      .where('user.id = :userId', { userId: comment.userId })
      .getOne();

    // CROSS-ORM INTERACTION: Fetch post data from TypeORM
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

  async update(id: number, updateData: Partial<CreateCommentDto>): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ id });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    Object.assign(comment, updateData);
    await this.em.flush();

    return comment;
  }

  async remove(id: number): Promise<void> {
    const comment = await this.commentRepository.findOne({ id });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    await this.em.removeAndFlush(comment);
  }
}

