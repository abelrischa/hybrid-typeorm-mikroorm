import { Repository } from 'typeorm';
import { EntityManager } from '@mikro-orm/mysql';
import { User } from '../typeorm/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
export declare class UsersService {
    private readonly userRepository;
    private readonly mikroEm;
    constructor(userRepository: Repository<User>, mikroEm: EntityManager);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User>;
    findOneWithComments(id: number): Promise<any>;
    update(id: number, updateData: Partial<CreateUserDto>): Promise<User>;
    remove(id: number): Promise<void>;
}
