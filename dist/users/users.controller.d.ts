import { UsersService } from './users.service';
import { CreateUserDto } from '../dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<import("../typeorm/entities/user.entity").User>;
    findAll(): Promise<import("../typeorm/entities/user.entity").User[]>;
    findOne(id: number): Promise<import("../typeorm/entities/user.entity").User>;
    findOneWithComments(id: number): Promise<any>;
    update(id: number, updateUserDto: CreateUserDto): Promise<import("../typeorm/entities/user.entity").User>;
    remove(id: number): Promise<void>;
}
