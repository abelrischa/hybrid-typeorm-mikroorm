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
exports.PostTag = void 0;
const core_1 = require("@mikro-orm/core");
let PostTag = class PostTag {
    constructor(postId, tagId) {
        this.createdAt = new Date();
        this.postId = postId;
        this.tagId = tagId;
    }
};
exports.PostTag = PostTag;
__decorate([
    (0, core_1.PrimaryKey)({ columnType: 'int', fieldName: 'post_id' }),
    __metadata("design:type", Number)
], PostTag.prototype, "postId", void 0);
__decorate([
    (0, core_1.PrimaryKey)({ columnType: 'int', fieldName: 'tag_id' }),
    __metadata("design:type", Number)
], PostTag.prototype, "tagId", void 0);
__decorate([
    (0, core_1.Property)({ fieldName: 'created_at', type: 'datetime' }),
    __metadata("design:type", Date)
], PostTag.prototype, "createdAt", void 0);
exports.PostTag = PostTag = __decorate([
    (0, core_1.Entity)({ tableName: 'post_tags' }),
    __metadata("design:paramtypes", [Number, Number])
], PostTag);
//# sourceMappingURL=post-tag.entity.js.map