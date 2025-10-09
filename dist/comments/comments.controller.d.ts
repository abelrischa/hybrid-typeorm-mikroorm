import { CommentsService } from './comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    create(createCommentDto: CreateCommentDto): Promise<import("../mikro-orm/entities/comment.entity").Comment>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findByPost(postId: number): Promise<any[]>;
    findByUser(userId: number): Promise<any[]>;
    update(id: number, updateCommentDto: Partial<CreateCommentDto>): Promise<import("../mikro-orm/entities/comment.entity").Comment>;
    remove(id: number): Promise<void>;
}
