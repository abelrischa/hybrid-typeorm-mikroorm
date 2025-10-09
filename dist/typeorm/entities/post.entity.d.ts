import { User } from './user.entity';
export declare class Post {
    id: number;
    title: string;
    content: string;
    published: boolean;
    authorId: number;
    author: User;
    createdAt: Date;
    updatedAt: Date;
    tags?: any[];
    comments?: any[];
    commentCount?: number;
    tagCount?: number;
}
