import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Content')
@Controller('content')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContentController {
  @Get()
  @ApiOperation({ summary: 'Get all content with pagination' })
  @ApiResponse({ status: 200, description: 'Content retrieved successfully' })
  async getAllContent(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    // Mock data matching the frontend
    return {
      data: [
        {
          id: '1',
          title: 'Getting Started with NestCraft',
          slug: 'getting-started-nestcraft',
          type: 'post',
          status: 'published',
          author: {
            name: 'John Doe',
            avatar: 'https://ui-avatars.com/api/?name=John+Doe',
          },
          updatedAt: '6 months ago',
          thumbnail:
            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&h=100&fit=crop',
        },
        {
          id: '2',
          title: 'Advanced Features Guide',
          slug: 'advanced-features-guide',
          type: 'page',
          status: 'draft',
          author: {
            name: 'Sarah Wilson',
            avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson',
          },
          updatedAt: '6 months ago',
        },
        {
          id: '3',
          title: 'Premium Plugin Bundle',
          slug: 'premium-plugin-bundle',
          type: 'product',
          status: 'published',
          author: {
            name: 'John Doe',
            avatar: 'https://ui-avatars.com/api/?name=John+Doe',
          },
          updatedAt: '6 months ago',
          thumbnail:
            'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=100&h=100&fit=crop',
        },
      ],
      meta: {
        total: 3,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get content statistics' })
  async getContentStats() {
    return {
      totalContent: 8921,
      publishedContent: 7234,
      draftContent: 1687,
      growthPercentage: 8.3,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create new content' })
  async createContent(@Body() contentData: any) {
    return {
      success: true,
      message: 'Content created successfully',
      data: contentData,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get content by ID' })
  async getContent(@Param('id') id: string) {
    return {
      id,
      title: 'Sample Content',
      content: 'This is sample content...',
      type: 'post',
      status: 'published',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update content' })
  async updateContent(@Param('id') id: string, @Body() contentData: any) {
    return {
      success: true,
      message: 'Content updated successfully',
      data: { id, ...contentData },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete content' })
  async deleteContent(@Param('id') id: string) {
    return {
      success: true,
      message: 'Content deleted successfully',
    };
  }
}
