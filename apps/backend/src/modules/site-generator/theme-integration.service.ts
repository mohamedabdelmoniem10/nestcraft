import { Injectable } from '@nestjs/common';
import { MarketplaceService } from '../marketplace/marketplace.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as AdmZip from 'adm-zip';

interface SiteData {
  userId: string;
  themeId: string;
  customSettings: {
    colors: Record<string, string>;
    fonts: Record<string, string>;
    layout: Record<string, any>;
  };
  content: {
    pages: PageData[];
    products?: ProductData[];
    posts?: PostData[];
    globalSettings: GlobalSettings;
  };
  plugins: string[];
}

interface PageData {
  id: string;
  slug: string;
  title: string;
  content: any; // Rich content object
  template: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

interface ProductData {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  stock: number;
}

interface PostData {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  publishedAt: Date;
  author: string;
  categories: string[];
  featuredImage?: string;
}

interface GlobalSettings {
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  contactInfo: any;
  socialMedia: any;
}

@Injectable()
export class ThemeIntegrationService {
  constructor(private marketplaceService: MarketplaceService) {}

  /**
   * توليد موقع باستخدام ثيم من الماركت بليس
   */
  async generateSiteWithTheme(siteData: SiteData): Promise<string> {
    const sitePath = path.join(process.cwd(), 'generated-sites', siteData.userId);

    try {
      // 1. جلب الثيم من الماركت بليس
      const themePackage = await this.downloadTheme(siteData.themeId, siteData.userId);

      // 2. استخراج الثيم
      const themePath = await this.extractTheme(themePackage, sitePath);

      // 3. تطبيق إعدادات المستخدم
      await this.applyUserCustomizations(themePath, siteData.customSettings);

      // 4. حقن البيانات في الثيم
      await this.injectUserData(themePath, siteData.content);

      // 5. تطبيق البلاجنز
      await this.applyPlugins(themePath, siteData.plugins);

      // 6. توليد الصفحات الديناميكية
      await this.generateDynamicPages(themePath, siteData.content);

      // 7. بناء الموقع
      const buildResult = await this.buildSite(themePath);

      // 8. نشر الموقع
      const deployUrl = await this.deploySite(themePath, siteData.userId);

      return deployUrl;
    } catch (error) {
      throw new Error(`Failed to generate site with theme: ${error.message}`);
    }
  }

  /**
   * تحميل الثيم من الماركت بليس
   */
  private async downloadTheme(themeId: string, userId: string): Promise<Buffer> {
    // استخدام marketplace service لتحميل الثيم
    const downloadInfo = await this.marketplaceService.downloadTheme(themeId, userId);

    // تحميل ملف الثيم
    const response = await fetch(downloadInfo.downloadUrl);
    const arrayBuffer = await response.arrayBuffer();

    return Buffer.from(arrayBuffer);
  }

  /**
   * استخراج ملف الثيم المضغوط
   */
  private async extractTheme(themePackage: Buffer, destinationPath: string): Promise<string> {
    await fs.mkdir(destinationPath, { recursive: true });

    const zip = new AdmZip(themePackage);
    zip.extractAllTo(destinationPath, true);

    return destinationPath;
  }

  /**
   * تطبيق تخصيصات المستخدم على الثيم
   */
  private async applyUserCustomizations(themePath: string, customSettings: any): Promise<void> {
    // تعديل ملف الستايل
    await this.updateThemeStyles(themePath, customSettings);

    // تعديل إعدادات الثيم
    await this.updateThemeConfig(themePath, customSettings);
  }

  /**
   * حقن بيانات المستخدم في الثيم
   */
  private async injectUserData(themePath: string, content: any): Promise<void> {
    // إنشاء ملف البيانات
    const dataFilePath = path.join(themePath, 'src', 'data', 'site-data.json');
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });

    const siteData = {
      global: content.globalSettings,
      pages: content.pages,
      products: content.products || [],
      posts: content.posts || [],
      generatedAt: new Date().toISOString(),
    };

    await fs.writeFile(dataFilePath, JSON.stringify(siteData, null, 2));
  }

  /**
   * توليد الصفحات الديناميكية
   */
  private async generateDynamicPages(themePath: string, content: any): Promise<void> {
    const pagesDir = path.join(themePath, 'src', 'pages');

    // توليد صفحات المنتجات (للمتاجر)
    if (content.products && content.products.length > 0) {
      await this.generateProductPages(pagesDir, content.products);
      await this.generateProductCategoryPages(pagesDir, content.products);
    }

    // توليد صفحات المقالات (للمدونات)
    if (content.posts && content.posts.length > 0) {
      await this.generateBlogPages(pagesDir, content.posts);
      await this.generateBlogCategoryPages(pagesDir, content.posts);
    }

    // توليد الصفحات المخصصة
    if (content.pages) {
      await this.generateCustomPages(pagesDir, content.pages);
    }
  }

  /**
   * توليد صفحات المنتجات
   */
  private async generateProductPages(pagesDir: string, products: ProductData[]): Promise<void> {
    const productTemplate = `
import { GetStaticProps, GetStaticPaths } from 'next';
import { ProductPage } from '../components/ProductPage';
import siteData from '../data/site-data.json';

export default function Product({ product }) {
  return <ProductPage product={product} />;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = siteData.products.map((product) => ({
    params: { slug: product.id }
  }));

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const product = siteData.products.find(p => p.id === params?.slug);

  if (!product) {
    return { notFound: true };
  }

  return {
    props: { product }
  };
};`;

    await fs.mkdir(path.join(pagesDir, 'products'), { recursive: true });
    await fs.writeFile(path.join(pagesDir, 'products', '[slug].tsx'), productTemplate);

    // صفحة جميع المنتجات
    const productsIndexTemplate = `
import { GetStaticProps } from 'next';
import { ProductsGrid } from '../components/ProductsGrid';
import siteData from '../data/site-data.json';

export default function Products({ products }) {
  return <ProductsGrid products={products} />;
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      products: siteData.products
    }
  };
};`;

    await fs.writeFile(path.join(pagesDir, 'products', 'index.tsx'), productsIndexTemplate);
  }

  /**
   * توليد صفحات المدونة
   */
  private async generateBlogPages(pagesDir: string, posts: PostData[]): Promise<void> {
    const postTemplate = `
import { GetStaticProps, GetStaticPaths } from 'next';
import { BlogPost } from '../components/BlogPost';
import siteData from '../data/site-data.json';

export default function Post({ post }) {
  return <BlogPost post={post} />;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = siteData.posts.map((post) => ({
    params: { slug: post.id }
  }));

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = siteData.posts.find(p => p.id === params?.slug);

  if (!post) {
    return { notFound: true };
  }

  return {
    props: { post }
  };
};`;

    await fs.mkdir(path.join(pagesDir, 'blog'), { recursive: true });
    await fs.writeFile(path.join(pagesDir, 'blog', '[slug].tsx'), postTemplate);
  }

  /**
   * توليد الصفحات المخصصة
   */
  private async generateCustomPages(pagesDir: string, pages: PageData[]): Promise<void> {
    for (const page of pages) {
      const pageTemplate = `
import { GetStaticProps } from 'next';
import { CustomPage } from '../components/CustomPage';
import siteData from '../data/site-data.json';

export default function ${this.capitalize(page.slug)}({ pageData }) {
  return <CustomPage data={pageData} />;
}

export const getStaticProps: GetStaticProps = async () => {
  const pageData = siteData.pages.find(p => p.slug === '${page.slug}');

  return {
    props: { pageData }
  };
};`;

      await fs.writeFile(path.join(pagesDir, `${page.slug}.tsx`), pageTemplate);
    }
  }

  /**
   * تحديث ستايل الثيم
   */
  private async updateThemeStyles(themePath: string, customSettings: any): Promise<void> {
    const stylesPath = path.join(themePath, 'src', 'styles', 'globals.css');

    let cssContent = await fs.readFile(stylesPath, 'utf-8');

    // تطبيق الألوان المخصصة
    if (customSettings.colors) {
      Object.entries(customSettings.colors).forEach(([key, value]) => {
        const cssVar = `--color-${key}`;
        cssContent = cssContent.replace(
          new RegExp(`${cssVar}:\\s*[^;]+;`, 'g'),
          `${cssVar}: ${value};`,
        );
      });
    }

    // تطبيق الخطوط المخصصة
    if (customSettings.fonts) {
      Object.entries(customSettings.fonts).forEach(([key, value]) => {
        cssContent = cssContent.replace(
          new RegExp(`font-family:\\s*'[^']+',`, 'g'),
          `font-family: '${value}',`,
        );
      });
    }

    await fs.writeFile(stylesPath, cssContent);
  }

  /**
   * تحديث إعدادات الثيم
   */
  private async updateThemeConfig(themePath: string, customSettings: any): Promise<void> {
    const configPath = path.join(themePath, 'theme.config.json');

    if (await this.fileExists(configPath)) {
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));

      // دمج الإعدادات المخصصة
      config.customization = {
        ...config.customization,
        ...customSettings,
      };

      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    }
  }

  /**
   * بناء الموقع
   */
  private async buildSite(themePath: string): Promise<boolean> {
    const { spawn } = require('child_process');

    return new Promise((resolve, reject) => {
      const buildProcess = spawn('npm', ['run', 'build'], {
        cwd: themePath,
        stdio: 'pipe',
      });

      buildProcess.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          reject(new Error(`Build failed with code ${code}`));
        }
      });
    });
  }

  /**
   * نشر الموقع
   */
  private async deploySite(themePath: string, userId: string): Promise<string> {
    // نشر الموقع على CDN
    const domain = `${userId}.nestcraft.com`;

    // هنا يتم رفع ملفات dist للاستضافة
    // مثال: AWS S3, Vercel, Netlify, etc.

    return `https://${domain}`;
  }

  /**
   * مساعدات
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
