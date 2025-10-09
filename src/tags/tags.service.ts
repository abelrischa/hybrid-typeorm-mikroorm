import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { DataSource } from 'typeorm';
import { Tag } from '../mikro-orm/entities/tag.entity';
import { CreateTagDto } from '../dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: EntityRepository<Tag>,
    @Inject(EntityManager)
    private readonly em: EntityManager,
    @Inject(DataSource)
    private readonly typeormDataSource: DataSource,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const tag = new Tag(createTagDto.name, createTagDto.description);
    await this.em.persistAndFlush(tag);
    return tag;
  }

  async findAll(): Promise<any[]> {
    const tags = await this.tagRepository.findAll({
      orderBy: { name: 'ASC' },
    });

    // CROSS-ORM INTERACTION: Add post counts
    const enrichedTags = await Promise.all(
      tags.map(async (tag) => {
        const postCount = await this.em
          .getConnection()
          .execute(
            `SELECT COUNT(*) as count FROM post_tags WHERE tag_id = ?`,
            [tag.id]
          );
        
        return {
          ...tag,
          postCount: parseInt(postCount[0].count),
        };
      })
    );

    return enrichedTags;
  }

  async findOne(id: number): Promise<any> {
    const tag = await this.tagRepository.findOne({ id });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    // Get post count
    const postCount = await this.em
      .getConnection()
      .execute(
        `SELECT COUNT(*) as count FROM post_tags WHERE tag_id = ?`,
        [id]
      );

    return {
      ...tag,
      postCount: parseInt(postCount[0].count),
    };
  }

  async findOneWithPosts(id: number): Promise<any> {
    const tag = await this.findOne(id);

    // CROSS-ORM INTERACTION: Fetch posts from TypeORM
    const posts = await this.typeormDataSource
      .getRepository('Post')
      .createQueryBuilder('post')
      .innerJoin('post_tags', 'pt', 'pt.post_id = post.id')
      .leftJoinAndSelect('post.author', 'author')
      .where('pt.tag_id = :tagId', { tagId: id })
      .orderBy('post.created_at', 'DESC')
      .getMany();

    return {
      ...tag,
      posts,
    };
  }

  async findByName(name: string): Promise<Tag | null> {
    return await this.tagRepository.findOne({ name });
  }

  async update(id: number, updateData: Partial<CreateTagDto>): Promise<Tag> {
    const tag = await this.tagRepository.findOne({ id });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    Object.assign(tag, updateData);
    await this.em.flush();

    return tag;
  }

  async remove(id: number): Promise<void> {
    const tag = await this.tagRepository.findOne({ id });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    await this.em.removeAndFlush(tag);
    // Foreign keys will cascade delete from post_tags
  }

  async getPopularTags(limit: number = 10): Promise<any[]> {
    // CROSS-ORM INTERACTION: Get tags sorted by usage
    const popularTags = await this.em
      .getConnection()
      .execute(
        `SELECT t.*, COUNT(pt.post_id) as post_count
         FROM tags t
         LEFT JOIN post_tags pt ON pt.tag_id = t.id
         GROUP BY t.id
         ORDER BY post_count DESC
         LIMIT ?`,
        [limit]
      );

    return popularTags;
  }
}

