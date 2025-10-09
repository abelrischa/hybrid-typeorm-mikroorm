import { TagsService } from './tags.service';
import { CreateTagDto } from '../dto/create-tag.dto';
export declare class TagsController {
    private readonly tagsService;
    constructor(tagsService: TagsService);
    create(createTagDto: CreateTagDto): Promise<import("../mikro-orm/entities/tag.entity").Tag>;
    findAll(): Promise<any[]>;
    getPopularTags(limit?: string): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findOneWithPosts(id: number): Promise<any>;
    update(id: number, updateTagDto: Partial<CreateTagDto>): Promise<import("../mikro-orm/entities/tag.entity").Tag>;
    remove(id: number): Promise<void>;
}
