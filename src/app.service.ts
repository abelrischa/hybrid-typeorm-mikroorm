import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
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
}

