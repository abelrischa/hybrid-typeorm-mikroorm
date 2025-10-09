"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
let AppService = class AppService {
    getHello() {
        return 'Blog API - Hybrid TypeORM + MikroORM Migration Project';
    }
    getInfo() {
        return {
            name: 'Blog API - Hybrid ORM',
            description: 'Demonstration of running TypeORM and MikroORM side-by-side',
            version: '1.0.0',
            orms: {
                typeorm: {
                    entities: ['User', 'Post'],
                    description: 'Core blogging entities',
                },
                mikroorm: {
                    entities: ['Comment', 'Tag', 'PostTag'],
                    description: 'Supporting entities',
                },
            },
            crossOrmInteractions: [
                'Posts fetch Tags and Comments from MikroORM',
                'Comments reference Users and Posts from TypeORM',
                'Tags can fetch associated Posts from TypeORM',
                'Users can get comment counts from MikroORM',
            ],
            endpoints: {
                users: '/users',
                posts: '/posts',
                comments: '/comments',
                tags: '/tags',
            },
        };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);
//# sourceMappingURL=app.service.js.map