import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from '../mikro-orm/entities/comment.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Comment])],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}

