import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { DataSource } from 'typeorm';
import { Tag } from '../mikro-orm/entities/tag.entity';
import { CreateTagDto } from '../dto/create-tag.dto';
export declare class TagsService {
    private readonly tagRepository;
    private readonly em;
    private readonly typeormDataSource;
    constructor(tagRepository: EntityRepository<Tag>, em: EntityManager, typeormDataSource: DataSource);
    create(createTagDto: CreateTagDto): Promise<Tag>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findOneWithPosts(id: number): Promise<any>;
    findByName(name: string): Promise<Tag | null>;
    update(id: number, updateData: Partial<CreateTagDto>): Promise<Tag>;
    remove(id: number): Promise<void>;
    getPopularTags(limit?: number): Promise<any[]>;
}
