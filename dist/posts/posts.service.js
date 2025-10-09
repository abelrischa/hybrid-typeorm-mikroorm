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
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const mysql_1 = require("@mikro-orm/mysql");
const post_entity_1 = require("../typeorm/entities/post.entity");
let PostsService = class PostsService {
    constructor(postRepository, mikroEm) {
        this.postRepository = postRepository;
        this.mikroEm = mikroEm;
    }
    async create(createPostDto) {
        const { tagIds, ...postData } = createPostDto;
        const post = this.postRepository.create(postData);
        const savedPost = await this.postRepository.save(post);
        if (tagIds && tagIds.length > 0) {
            await this.addTagsToPost(savedPost.id, tagIds);
        }
        return savedPost;
    }
    async addTagsToPost(postId, tagIds) {
        for (const tagId of tagIds) {
            await this.mikroEm
                .getConnection()
                .execute(`INSERT IGNORE INTO post_tags (post_id, tag_id, created_at) 
           VALUES (?, ?, NOW())`, [postId, tagId]);
        }
    }
    async findAll() {
        const posts = await this.postRepository.find({
            relations: ['author'],
            order: { createdAt: 'DESC' },
        });
        for (const post of posts) {
            await this.enrichPostWithMikroData(post);
        }
        return posts;
    }
    async findOne(id) {
        const post = await this.postRepository.findOne({
            where: { id },
            relations: ['author'],
        });
        if (!post) {
            throw new common_1.NotFoundException(`Post with ID ${id} not found`);
        }
        await this.enrichPostWithMikroData(post);
        return post;
    }
    async findOneWithDetails(id) {
        const post = await this.findOne(id);
        const comments = await this.mikroEm
            .getConnection()
            .execute(`SELECT c.*, u.name as author_name, u.email as author_email
         FROM comments c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.post_id = ?
         ORDER BY c.created_at DESC`, [id]);
        const tags = await this.mikroEm
            .getConnection()
            .execute(`SELECT t.* FROM tags t
         INNER JOIN post_tags pt ON pt.tag_id = t.id
         WHERE pt.post_id = ?`, [id]);
        return {
            ...post,
            comments,
            tags,
        };
    }
    async enrichPostWithMikroData(post) {
        const commentResult = await this.mikroEm
            .getConnection()
            .execute(`SELECT COUNT(*) as count FROM comments WHERE post_id = ?`, [post.id]);
        post.commentCount = parseInt(commentResult[0].count);
        const tagResult = await this.mikroEm
            .getConnection()
            .execute(`SELECT t.id, t.name 
         FROM tags t
         INNER JOIN post_tags pt ON pt.tag_id = t.id
         WHERE pt.post_id = ?`, [post.id]);
        post.tags = tagResult;
        post.tagCount = tagResult.length;
    }
    async update(id, updateData) {
        const { tagIds, ...postData } = updateData;
        const post = await this.findOne(id);
        Object.assign(post, postData);
        const updated = await this.postRepository.save(post);
        if (tagIds !== undefined) {
            await this.mikroEm
                .getConnection()
                .execute(`DELETE FROM post_tags WHERE post_id = ?`, [id]);
            if (tagIds.length > 0) {
                await this.addTagsToPost(id, tagIds);
            }
        }
        return updated;
    }
    async remove(id) {
        const post = await this.findOne(id);
        await this.postRepository.remove(post);
    }
    async findByAuthor(authorId) {
        const posts = await this.postRepository.find({
            where: { authorId },
            relations: ['author'],
            order: { createdAt: 'DESC' },
        });
        for (const post of posts) {
            await this.enrichPostWithMikroData(post);
        }
        return posts;
    }
    async linkToTag(postId, tagId) {
        await this.findOne(postId);
        const tagExists = await this.mikroEm
            .getConnection()
            .execute(`SELECT id FROM tags WHERE id = ?`, [tagId]);
        if (!tagExists || tagExists.length === 0) {
            throw new common_1.NotFoundException(`Tag with ID ${tagId} not found`);
        }
        await this.mikroEm
            .getConnection()
            .execute(`INSERT IGNORE INTO post_tags (post_id, tag_id, created_at) VALUES (?, ?, NOW())`, [postId, tagId]);
        return { message: `Post ${postId} linked to tag ${tagId}` };
    }
    async getPostTags(postId) {
        await this.findOne(postId);
        const tags = await this.mikroEm
            .getConnection()
            .execute(`SELECT t.* FROM tags t
         INNER JOIN post_tags pt ON pt.tag_id = t.id
         WHERE pt.post_id = ?`, [postId]);
        return tags;
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __param(1, (0, common_1.Inject)(mysql_1.EntityManager)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        mysql_1.EntityManager])
], PostsService);
//# sourceMappingURL=posts.service.js.map