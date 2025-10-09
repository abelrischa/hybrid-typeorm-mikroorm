export declare class Tag {
    id: number;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    constructor(name: string, description?: string);
    postCount?: number;
}
