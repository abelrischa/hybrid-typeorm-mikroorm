import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from '../dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get('author/:authorId')
  findByAuthor(@Param('authorId', ParseIntPipe) authorId: number) {
    return this.postsService.findByAuthor(authorId);
  }

  @Get(':id/with-details')
  findOneWithDetails(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOneWithDetails(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: CreatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }

  @Post(':id/tags/:tagId')
  linkToTag(
    @Param('id', ParseIntPipe) postId: number,
    @Param('tagId', ParseIntPipe) tagId: number,
  ) {
    return this.postsService.linkToTag(postId, tagId);
  }

  @Get(':id/tags')
  getPostTags(@Param('id', ParseIntPipe) postId: number) {
    return this.postsService.getPostTags(postId);
  }
}

