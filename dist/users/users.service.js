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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const mysql_1 = require("@mikro-orm/mysql");
const user_entity_1 = require("../typeorm/entities/user.entity");
let UsersService = class UsersService {
    constructor(userRepository, mikroEm) {
        this.userRepository = userRepository;
        this.mikroEm = mikroEm;
    }
    async create(createUserDto) {
        const user = this.userRepository.create(createUserDto);
        return await this.userRepository.save(user);
    }
    async findAll() {
        return await this.userRepository.find({
            relations: ['posts'],
        });
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['posts'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        const commentCount = await this.mikroEm
            .getConnection()
            .execute(`SELECT COUNT(*) as count FROM comments WHERE user_id = ?`, [id]);
        user.commentCount = parseInt(commentCount[0].count);
        return user;
    }
    async findOneWithComments(id) {
        const user = await this.findOne(id);
        const comments = await this.mikroEm
            .getConnection()
            .execute(`SELECT c.*, p.title as post_title 
         FROM comments c 
         LEFT JOIN posts p ON c.post_id = p.id 
         WHERE c.user_id = ? 
         ORDER BY c.created_at DESC`, [id]);
        return {
            ...user,
            comments,
        };
    }
    async update(id, updateData) {
        const user = await this.findOne(id);
        Object.assign(user, updateData);
        return await this.userRepository.save(user);
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, common_1.Inject)(mysql_1.EntityManager)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        mysql_1.EntityManager])
], UsersService);
//# sourceMappingURL=users.service.js.map