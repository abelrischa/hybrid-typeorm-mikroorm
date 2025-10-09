export declare class Comment {
    id: number;
    content: string;
    userId: number;
    postId: number;
    createdAt: Date;
    updatedAt: Date;
    constructor(content: string, userId: number, postId: number);
    author?: any;
    post?: any;
}
