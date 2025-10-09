import { Repository } from 'typeorm';
import { EntityManager } from '@mikro-orm/mysql';
import { Post } from '../typeorm/entities/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';
export declare class PostsService {
    private readonly postRepository;
    private readonly mikroEm;
    constructor(postRepository: Repository<Post>, mikroEm: EntityManager);
    create(createPostDto: CreatePostDto): Promise<Post>;
    addTagsToPost(postId: number, tagIds: number[]): Promise<void>;
    findAll(): Promise<Post[]>;
    findOne(id: number): Promise<Post>;
    findOneWithDetails(id: number): Promise<any>;
    private enrichPostWithMikroData;
    update(id: number, updateData: Partial<CreatePostDto>): Promise<Post>;
    remove(id: number): Promise<void>;
    findByAuthor(authorId: number): Promise<Post[]>;
    linkToTag(postId: number, tagId: number): Promise<{
        message: string;
    }>;
    getPostTags(postId: number): Promise<any[]>;
}
