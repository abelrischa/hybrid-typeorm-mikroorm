"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagsService = void 0;
const common_1 = require("@nestjs/common");
const mysql_1 = require("@mikro-orm/mysql");
const nestjs_1 = require("@mikro-orm/nestjs");
const typeorm_1 = require("typeorm");
const tag_entity_1 = require("../mikro-orm/entities/tag.entity");
let TagsService = class TagsService {
    constructor(tagRepository, em, typeormDataSource) {
        this.tagRepository = tagRepository;
        this.em = em;
        this.typeormDataSource = typeormDataSource;
    }
    async create(createTagDto) {
        const tag = new tag_entity_1.Tag(createTagDto.name, createTagDto.description);
        await this.em.persistAndFlush(tag);
        return tag;
    }
    async findAll() {
        const tags = await this.tagRepository.findAll({
            orderBy: { name: 'ASC' },
        });
        const enrichedTags = await Promise.all(tags.map(async (tag) => {
            const postCount = await this.em
                .getConnection()
                .execute(`SELECT COUNT(*) as count FROM post_tags WHERE tag_id = ?`, [tag.id]);
            return {
                ...tag,
                postCount: parseInt(postCount[0].count),
            };
        }));
        return enrichedTags;
    }
    async findOne(id) {
        const tag = await this.tagRepository.findOne({ id });
        if (!tag) {
            throw new common_1.NotFoundException(`Tag with ID ${id} not found`);
        }
        const postCount = await this.em
            .getConnection()
            .execute(`SELECT COUNT(*) as count FROM post_tags WHERE tag_id = ?`, [id]);
        return {
            ...tag,
            postCount: parseInt(postCount[0].count),
        };
    }
    async findOneWithPosts(id) {
        const tag = await this.findOne(id);
        const posts = await this.typeormDataSource
            .getRepository('Post')
            .createQueryBuilder('post')
            .innerJoin('post_tags', 'pt', 'pt.post_id = post.id')
            .leftJoinAndSelect('post.author', 'author')
            .where('pt.tag_id = :tagId', { tagId: id })
            .orderBy('post.created_at', 'DESC')
            .getMany();
        return {
            ...tag,
            posts,
        };
    }
    async findByName(name) {
        return await this.tagRepository.findOne({ name });
    }
    async update(id, updateData) {
        const tag = await this.tagRepository.findOne({ id });
        if (!tag) {
            throw new common_1.NotFoundException(`Tag with ID ${id} not found`);
        }
        Object.assign(tag, updateData);
        await this.em.flush();
        return tag;
    }
    async remove(id) {
        const tag = await this.tagRepository.findOne({ id });
        if (!tag) {
            throw new common_1.NotFoundException(`Tag with ID ${id} not found`);
        }
        await this.em.removeAndFlush(tag);
    }
    async getPopularTags(limit = 10) {
        const popularTags = await this.em
            .getConnection()
            .execute(`SELECT t.*, COUNT(pt.post_id) as post_count
         FROM tags t
         LEFT JOIN post_tags pt ON pt.tag_id = t.id
         GROUP BY t.id
         ORDER BY post_count DESC
         LIMIT ?`, [limit]);
        return popularTags;
    }
};
exports.TagsService = TagsService;
exports.TagsService = TagsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_1.InjectRepository)(tag_entity_1.Tag)),
    __param(1, (0, common_1.Inject)(mysql_1.EntityManager)),
    __param(2, (0, common_1.Inject)(typeorm_1.DataSource)),
    __metadata("design:paramtypes", [mysql_1.EntityRepository,
        mysql_1.EntityManager,
        typeorm_1.DataSource])
], TagsService);
//# sourceMappingURL=tags.service.js.map