import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogController } from './controllers/blog.controller';
import { BlogService } from './services/blog.service';
import { Post } from './entities/post.entity';
import { Category } from './entities/category.entity';
import { Tag } from './entities/tag.entity';

/**
 * Blog Plugin - Example Plugin Implementation
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Category, Tag]),
  ],
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogPlugin {
  
  // Plugin Metadata
  static metadata = {
    name: 'blog',
    version: '1.0.0',
    description: 'Blog management plugin with posts, categories, and tags',
    author: 'NestCraft Team',
    nestcraft: {
      hooks: ['onLoad', 'onActivate', 'onDeactivate'],
      routes: ['/api/blog/posts', '/api/blog/categories', '/api/blog/tags'],
      permissions: ['blog.read', 'blog.write', 'blog.admin'],
    },
  };

  // Plugin Lifecycle Hooks
  async onLoad(): Promise<void> {
    console.log('🔌 Blog Plugin: onLoad hook called');
  }

  async onActivate(): Promise<void> {
    console.log('✅ Blog Plugin: onActivate hook called');
  }

  async onDeactivate(): Promise<void> {
    console.log('❌ Blog Plugin: onDeactivate hook called');
  }

  async onConfig(config: any): Promise<void> {
    console.log('⚙️ Blog Plugin: onConfig hook called with:', config);
  }
}

// Export as default for dynamic loading
export default BlogPlugin; 