import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Post } from "../entities/post.entity";
import { Category } from "../entities/category.entity";
import { Tag } from "../entities/tag.entity";

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>
  ) {}

  async getAllPosts(): Promise<Post[]> {
    return this.postRepository.find({
      relations: ["category", "tags"],
      order: { createdAt: "DESC" },
    });
  }

  async getPostById(id: string): Promise<Post> {
    return this.postRepository.findOne({
      where: { id },
      relations: ["category", "tags"],
    });
  }

  async createPost(postData: Partial<Post>): Promise<Post> {
    const post = this.postRepository.create(postData);
    return this.postRepository.save(post);
  }

  async updatePost(id: string, postData: Partial<Post>): Promise<Post> {
    await this.postRepository.update(id, postData);
    return this.getPostById(id);
  }

  async deletePost(id: string): Promise<void> {
    await this.postRepository.delete(id);
  }

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      relations: ["posts"],
    });
  }

  async getAllTags(): Promise<Tag[]> {
    return this.tagRepository.find({
      relations: ["posts"],
    });
  }
}
