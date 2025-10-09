import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    getHealth(): {
        status: string;
        timestamp: string;
        typeorm: string;
        mikroorm: string;
    };
    getInfo(): {
        name: string;
        description: string;
        version: string;
        orms: {
            typeorm: {
                entities: string[];
                description: string;
            };
            mikroorm: {
                entities: string[];
                description: string;
            };
        };
        crossOrmInteractions: string[];
        endpoints: {
            users: string;
            posts: string;
            comments: string;
            tags: string;
        };
    };
}
