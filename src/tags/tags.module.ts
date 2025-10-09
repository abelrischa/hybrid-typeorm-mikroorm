import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { Tag } from '../mikro-orm/entities/tag.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Tag])],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}

