"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = require("@mikro-orm/mysql");
const comment_entity_1 = require("./mikro-orm/entities/comment.entity");
const tag_entity_1 = require("./mikro-orm/entities/tag.entity");
const post_tag_entity_1 = require("./mikro-orm/entities/post-tag.entity");
const config = {
    driver: mysql_1.MySqlDriver,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD,
    dbName: process.env.DATABASE_NAME || 'blog_db',
    entities: [comment_entity_1.Comment, tag_entity_1.Tag, post_tag_entity_1.PostTag],
    migrations: {
        path: './src/mikro-orm/migrations',
        pathTs: './src/mikro-orm/migrations',
    },
    debug: false,
    allowGlobalContext: true,
    ensureDatabase: { create: true },
};
exports.default = config;
//# sourceMappingURL=mikro-orm.config.js.map