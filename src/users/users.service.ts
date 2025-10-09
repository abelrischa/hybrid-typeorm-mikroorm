import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityManager } from '@mikro-orm/mysql';
import { User } from '../typeorm/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(EntityManager)
    private readonly mikroEm: EntityManager,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['posts'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['posts'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // CROSS-ORM INTERACTION: Get comment count from MikroORM
    const commentCount = await this.mikroEm
      .getConnection()
      .execute(`SELECT COUNT(*) as count FROM comments WHERE user_id = ?`, [id]);
    
    user.commentCount = parseInt(commentCount[0].count);

    return user;
  }

  async findOneWithComments(id: number): Promise<any> {
    const user = await this.findOne(id);

    // CROSS-ORM INTERACTION: Fetch comments from MikroORM
    const comments = await this.mikroEm
      .getConnection()
      .execute(
        `SELECT c.*, p.title as post_title 
         FROM comments c 
         LEFT JOIN posts p ON c.post_id = p.id 
         WHERE c.user_id = ? 
         ORDER BY c.created_at DESC`,
        [id]
      );

    return {
      ...user,
      comments,
    };
  }

  async update(id: number, updateData: Partial<CreateUserDto>): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateData);
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}

