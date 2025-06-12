import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ThemeSubmission {
  name: string;
  version: string;
  description: string;
  authorId: string;
  category: string;
  price: number;
  tags: string[];
  screenshots: string[];
  demoUrl?: string;
  packageUrl: string; // رابط ملف الثيم المضغوط
  features: string[];
}

interface ThemeFilter {
  category?: string;
  priceRange?: { min: number; max: number };
  features?: string[];
  search?: string;
  sortBy?: 'popularity' | 'newest' | 'price' | 'rating';
}

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  /**
   * رفع ثيم جديد للماركت بليس
   */
  async submitTheme(submission: ThemeSubmission) {
    try {
      // تحقق من وجود ثيم بنفس الاسم
      const existingTheme = await this.prisma.theme.findFirst({
        where: {
          name: submission.name,
          authorId: submission.authorId,
        },
      });

      if (existingTheme) {
        throw new BadRequestException('Theme with this name already exists');
      }

      // إنشاء سجل الثيم
      const theme = await this.prisma.theme.create({
        data: {
          name: submission.name,
          version: submission.version,
          description: submission.description,
          authorId: submission.authorId,
          category: submission.category,
          price: submission.price,
          tags: submission.tags,
          screenshots: submission.screenshots,
          demoUrl: submission.demoUrl,
          packageUrl: submission.packageUrl,
          features: submission.features,
          status: 'pending', // في انتظار المراجعة
          downloadCount: 0,
          rating: 0,
          reviewCount: 0,
        },
      });

      // إرسال تنبيه للمراجعين
      await this.notifyReviewers(theme.id);

      return {
        success: true,
        themeId: theme.id,
        message: 'Theme submitted for review',
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to submit theme: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * جلب جميع الثيمات (مع التصفية)
   */
  async getThemes(filters: ThemeFilter = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    // بناء شروط البحث
    const where: any = {
      status: 'approved', // فقط الثيمات المعتمدة
    };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.priceRange) {
      where.price = {
        gte: filters.priceRange.min,
        lte: filters.priceRange.max,
      };
    }

    if (filters.features && filters.features.length > 0) {
      where.features = {
        hasSome: filters.features,
      };
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { tags: { hasSome: [filters.search] } },
      ];
    }

    // ترتيب النتائج
    let orderBy: any = { createdAt: 'desc' };

    switch (filters.sortBy) {
      case 'popularity':
        orderBy = { downloadCount: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'price':
        orderBy = { price: 'asc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
    }

    const [themes, total] = await Promise.all([
      this.prisma.theme.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          reviews: {
            select: { rating: true },
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.theme.count({ where }),
    ]);

    return {
      themes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * جلب تفاصيل ثيم واحد
   */
  async getThemeDetails(themeId: string) {
    const theme = await this.prisma.theme.findUnique({
      where: { id: themeId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            _count: { select: { themes: true } },
          },
        },
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!theme) {
      throw new NotFoundException('Theme not found');
    }

    return theme;
  }

  /**
   * تحميل ثيم (زيادة عداد التحميل)
   */
  async downloadTheme(themeId: string, userId: string) {
    const theme = await this.prisma.theme.findUnique({
      where: { id: themeId },
    });

    if (!theme) {
      throw new NotFoundException('Theme not found');
    }

    if (theme.status !== 'approved') {
      throw new BadRequestException('Theme is not approved');
    }

    // زيادة عداد التحميل
    await this.prisma.theme.update({
      where: { id: themeId },
      data: { downloadCount: { increment: 1 } },
    });

    // تسجيل التحميل
    await this.prisma.download.create({
      data: {
        themeId,
        userId,
        downloadedAt: new Date(),
      },
    });

    return {
      downloadUrl: theme.packageUrl,
      packageInfo: {
        name: theme.name,
        version: theme.version,
        size: '2.5MB', // يمكن حساب الحجم الفعلي
      },
    };
  }

  /**
   * إضافة مراجعة للثيم
   */
  async addThemeReview(themeId: string, userId: string, rating: number, comment?: string) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // تحقق من وجود مراجعة سابقة
    const existingReview = await this.prisma.review.findFirst({
      where: { themeId, userId },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this theme');
    }

    // إضافة المراجعة
    const review = await this.prisma.review.create({
      data: {
        themeId,
        userId,
        rating,
        comment,
      },
    });

    // تحديث متوسط التقييم
    await this.updateThemeRating(themeId);

    return review;
  }

  /**
   * مراجعة ثيم (للمشرفين)
   */
  async reviewTheme(
    themeId: string,
    adminId: string,
    status: 'approved' | 'rejected',
    notes?: string,
  ) {
    const theme = await this.prisma.theme.findUnique({
      where: { id: themeId },
    });

    if (!theme) {
      throw new NotFoundException('Theme not found');
    }

    const updatedTheme = await this.prisma.theme.update({
      where: { id: themeId },
      data: {
        status,
        reviewNotes: notes,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    // إرسال تنبيه للمطور
    await this.notifyDeveloper(theme.authorId, status, theme.name, notes);

    return updatedTheme;
  }

  /**
   * جلب إحصائيات الماركت بليس
   */
  async getMarketplaceStats() {
    const [totalThemes, totalDownloads, totalDevelopers, topCategories] = await Promise.all([
      this.prisma.theme.count({ where: { status: 'approved' } }),
      this.prisma.download.count(),
      this.prisma.theme
        .groupBy({
          by: ['authorId'],
          where: { status: 'approved' },
        })
        .then((result) => result.length),
      this.prisma.theme.groupBy({
        by: ['category'],
        where: { status: 'approved' },
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
        take: 5,
      }),
    ]);

    return {
      totalThemes,
      totalDownloads,
      totalDevelopers,
      topCategories: topCategories.map((cat) => ({
        category: cat.category,
        count: cat._count.category,
      })),
    };
  }

  /**
   * تحديث متوسط تقييم الثيم
   */
  private async updateThemeRating(themeId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { themeId },
      select: { rating: true },
    });

    if (reviews.length > 0) {
      const averageRating =
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

      await this.prisma.theme.update({
        where: { id: themeId },
        data: {
          rating: Math.round(averageRating * 10) / 10, // تقريب لخانة عشرية
          reviewCount: reviews.length,
        },
      });
    }
  }

  /**
   * إرسال تنبيه للمراجعين
   */
  private async notifyReviewers(themeId: string) {
    // تنفيذ نظام التنبيهات
    console.log(`New theme ${themeId} submitted for review`);
  }

  /**
   * إرسال تنبيه للمطور
   */
  private async notifyDeveloper(
    developerId: string,
    status: string,
    themeName: string,
    notes?: string,
  ) {
    // تنفيذ نظام التنبيهات
    console.log(`Theme ${themeName} ${status} for developer ${developerId}`);
  }
}
