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
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const mysql_1 = require("@mikro-orm/mysql");
const nestjs_1 = require("@mikro-orm/nestjs");
const typeorm_1 = require("typeorm");
const comment_entity_1 = require("../mikro-orm/entities/comment.entity");
let CommentsService = class CommentsService {
    constructor(commentRepository, em, typeormDataSource) {
        this.commentRepository = commentRepository;
        this.em = em;
        this.typeormDataSource = typeormDataSource;
    }
    async create(createCommentDto) {
        const user = await this.typeormDataSource
            .getRepository('User')
            .findOne({ where: { id: createCommentDto.userId } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${createCommentDto.userId} not found`);
        }
        const post = await this.typeormDataSource
            .getRepository('Post')
            .findOne({ where: { id: createCommentDto.postId } });
        if (!post) {
            throw new common_1.NotFoundException(`Post with ID ${createCommentDto.postId} not found`);
        }
        const comment = new comment_entity_1.Comment(createCommentDto.content, createCommentDto.userId, createCommentDto.postId);
        await this.em.persistAndFlush(comment);
        return comment;
    }
    async findAll() {
        const comments = await this.commentRepository.findAll({
            orderBy: { createdAt: 'DESC' },
        });
        const enrichedComments = await Promise.all(comments.map(async (comment) => {
            return await this.enrichCommentWithTypeOrmData(comment);
        }));
        return enrichedComments;
    }
    async findOne(id) {
        const comment = await this.commentRepository.findOne({ id });
        if (!comment) {
            throw new common_1.NotFoundException(`Comment with ID ${id} not found`);
        }
        return await this.enrichCommentWithTypeOrmData(comment);
    }
    async findByPost(postId) {
        const comments = await this.commentRepository.find({ postId }, { orderBy: { createdAt: 'DESC' } });
        const enrichedComments = await Promise.all(comments.map(async (comment) => {
            return await this.enrichCommentWithTypeOrmData(comment);
        }));
        return enrichedComments;
    }
    async findByUser(userId) {
        const comments = await this.commentRepository.find({ userId }, { orderBy: { createdAt: 'DESC' } });
        const enrichedComments = await Promise.all(comments.map(async (comment) => {
            return await this.enrichCommentWithTypeOrmData(comment);
        }));
        return enrichedComments;
    }
    async enrichCommentWithTypeOrmData(comment) {
        const user = await this.typeormDataSource
            .getRepository('User')
            .createQueryBuilder('user')
            .select(['user.id', 'user.name', 'user.email'])
            .where('user.id = :userId', { userId: comment.userId })
            .getOne();
        const post = await this.typeormDataSource
            .getRepository('Post')
            .createQueryBuilder('post')
            .select(['post.id', 'post.title'])
            .where('post.id = :postId', { postId: comment.postId })
            .getOne();
        return {
            ...comment,
            author: user,
            post: post,
        };
    }
    async update(id, updateData) {
        const comment = await this.commentRepository.findOne({ id });
        if (!comment) {
            throw new common_1.NotFoundException(`Comment with ID ${id} not found`);
        }
        Object.assign(comment, updateData);
        await this.em.flush();
        return comment;
    }
    async remove(id) {
        const comment = await this.commentRepository.findOne({ id });
        if (!comment) {
            throw new common_1.NotFoundException(`Comment with ID ${id} not found`);
        }
        await this.em.removeAndFlush(comment);
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_1.InjectRepository)(comment_entity_1.Comment)),
    __param(1, (0, common_1.Inject)(mysql_1.EntityManager)),
    __param(2, (0, common_1.Inject)(typeorm_1.DataSource)),
    __metadata("design:paramtypes", [mysql_1.EntityRepository,
        mysql_1.EntityManager,
        typeorm_1.DataSource])
], CommentsService);
//# sourceMappingURL=comments.service.js.map