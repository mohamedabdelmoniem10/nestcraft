import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { BlogService } from "../services/blog.service";
import { Post as BlogPost } from "../entities/post.entity";

@ApiTags("Blog")
@Controller("blog")
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get("posts")
  @ApiOperation({ summary: "Get all blog posts" })
  @ApiResponse({ status: 200, description: "List of blog posts" })
  async getAllPosts() {
    return this.blogService.getAllPosts();
  }

  @Get("posts/:id")
  @ApiOperation({ summary: "Get blog post by ID" })
  @ApiResponse({ status: 200, description: "Blog post details" })
  async getPostById(@Param("id") id: string) {
    return this.blogService.getPostById(id);
  }

  @Post("posts")
  @ApiOperation({ summary: "Create new blog post" })
  @ApiResponse({ status: 201, description: "Blog post created successfully" })
  async createPost(@Body() postData: Partial<BlogPost>) {
    return this.blogService.createPost(postData);
  }

  @Put("posts/:id")
  @ApiOperation({ summary: "Update blog post" })
  @ApiResponse({ status: 200, description: "Blog post updated successfully" })
  async updatePost(
    @Param("id") id: string,
    @Body() postData: Partial<BlogPost>
  ) {
    return this.blogService.updatePost(id, postData);
  }

  @Delete("posts/:id")
  @ApiOperation({ summary: "Delete blog post" })
  @ApiResponse({ status: 200, description: "Blog post deleted successfully" })
  async deletePost(@Param("id") id: string) {
    await this.blogService.deletePost(id);
    return { message: "Post deleted successfully" };
  }

  @Get("categories")
  @ApiOperation({ summary: "Get all categories" })
  @ApiResponse({ status: 200, description: "List of categories" })
  async getAllCategories() {
    return this.blogService.getAllCategories();
  }

  @Get("tags")
  @ApiOperation({ summary: "Get all tags" })
  @ApiResponse({ status: 200, description: "List of tags" })
  async getAllTags() {
    return this.blogService.getAllTags();
  }
}
