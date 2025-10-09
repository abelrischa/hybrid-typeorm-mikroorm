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
exports.Tag = void 0;
const core_1 = require("@mikro-orm/core");
let Tag = class Tag {
    constructor(name, description) {
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.name = name;
        this.description = description;
    }
};
exports.Tag = Tag;
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", Number)
], Tag.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ unique: true }),
    __metadata("design:type", String)
], Tag.prototype, "name", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], Tag.prototype, "description", void 0);
__decorate([
    (0, core_1.Property)({ fieldName: 'created_at', type: 'datetime' }),
    __metadata("design:type", Date)
], Tag.prototype, "createdAt", void 0);
__decorate([
    (0, core_1.Property)({ fieldName: 'updated_at', type: 'datetime', onUpdate: () => new Date() }),
    __metadata("design:type", Date)
], Tag.prototype, "updatedAt", void 0);
exports.Tag = Tag = __decorate([
    (0, core_1.Entity)({ tableName: 'tags' }),
    __metadata("design:paramtypes", [String, String])
], Tag);
//# sourceMappingURL=tag.entity.js.map