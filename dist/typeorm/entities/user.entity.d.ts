import { Post } from './post.entity';
export declare class User {
    id: number;
    email: string;
    name: string;
    bio: string;
    createdAt: Date;
    updatedAt: Date;
    posts: Post[];
    commentCount?: number;
}
