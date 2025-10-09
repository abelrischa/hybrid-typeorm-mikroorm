import { PostsService } from './posts.service';
import { CreatePostDto } from '../dto/create-post.dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    create(createPostDto: CreatePostDto): Promise<import("../typeorm/entities/post.entity").Post>;
    findAll(): Promise<import("../typeorm/entities/post.entity").Post[]>;
    findByAuthor(authorId: number): Promise<import("../typeorm/entities/post.entity").Post[]>;
    findOneWithDetails(id: number): Promise<any>;
    findOne(id: number): Promise<import("../typeorm/entities/post.entity").Post>;
    update(id: number, updatePostDto: CreatePostDto): Promise<import("../typeorm/entities/post.entity").Post>;
    remove(id: number): Promise<void>;
    linkToTag(postId: number, tagId: number): Promise<{
        message: string;
    }>;
    getPostTags(postId: number): Promise<any[]>;
}
