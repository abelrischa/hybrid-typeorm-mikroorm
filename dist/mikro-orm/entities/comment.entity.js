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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const core_1 = require("@mikro-orm/core");
let Comment = class Comment {
    constructor(content, userId, postId) {
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.content = content;
        this.userId = userId;
        this.postId = postId;
    }
};
exports.Comment = Comment;
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", Number)
], Comment.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ type: 'text' }),
    __metadata("design:type", String)
], Comment.prototype, "content", void 0);
__decorate([
    (0, core_1.Property)({ columnType: 'int', fieldName: 'user_id' }),
    __metadata("design:type", Number)
], Comment.prototype, "userId", void 0);
__decorate([
    (0, core_1.Property)({ columnType: 'int', fieldName: 'post_id' }),
    __metadata("design:type", Number)
], Comment.prototype, "postId", void 0);
__decorate([
    (0, core_1.Property)({ fieldName: 'created_at', type: 'datetime' }),
    __metadata("design:type", Date)
], Comment.prototype, "createdAt", void 0);
__decorate([
    (0, core_1.Property)({ fieldName: 'updated_at', type: 'datetime', onUpdate: () => new Date() }),
    __metadata("design:type", Date)
], Comment.prototype, "updatedAt", void 0);
exports.Comment = Comment = __decorate([
    (0, core_1.Entity)({ tableName: 'comments' }),
    __metadata("design:paramtypes", [String, Number, Number])
], Comment);
//# sourceMappingURL=comment.entity.js.map