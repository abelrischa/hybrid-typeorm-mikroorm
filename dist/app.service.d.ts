export declare class AppService {
    getHello(): string;
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
