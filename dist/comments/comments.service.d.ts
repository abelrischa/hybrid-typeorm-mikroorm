import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { DataSource } from 'typeorm';
import { Comment } from '../mikro-orm/entities/comment.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
export declare class CommentsService {
    private readonly commentRepository;
    private readonly em;
    private readonly typeormDataSource;
    constructor(commentRepository: EntityRepository<Comment>, em: EntityManager, typeormDataSource: DataSource);
    create(createCommentDto: CreateCommentDto): Promise<Comment>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findByPost(postId: number): Promise<any[]>;
    findByUser(userId: number): Promise<any[]>;
    private enrichCommentWithTypeOrmData;
    update(id: number, updateData: Partial<CreateCommentDto>): Promise<Comment>;
    remove(id: number): Promise<void>;
}
