import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

interface SiteConfig {
  userId: string;
  domain: string;
  theme: string;
  plugins: string[];
  content: any;
  seoSettings: any;
}

@Injectable()
export class SiteGeneratorService {
  private readonly templatesPath = path.join(process.cwd(), 'templates');
  private readonly outputPath = path.join(process.cwd(), 'generated-sites');

  /**
   * إنشاء موقع جديد للمستخدم
   */
  async generateUserSite(config: SiteConfig): Promise<string> {
    const sitePath = path.join(this.outputPath, config.userId);

    try {
      // 1. إنشاء مجلد الموقع
      await fs.mkdir(sitePath, { recursive: true });

      // 2. نسخ template أساسي
      await this.copyTemplate(config.theme, sitePath);

      // 3. تطبيق البيانات
      await this.applyUserData(config, sitePath);

      // 4. تطبيق البلاجنز
      await this.applyPlugins(config.plugins, sitePath);

      // 5. توليد الموقع Static
      const buildResult = await this.buildStaticSite(sitePath);

      // 6. رفع الموقع للاستضافة
      const deployUrl = await this.deploySite(sitePath, config.domain);

      return deployUrl;
    } catch (error) {
      throw new Error(
        `Failed to generate site: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * نسخ template الثيم
   */
  private async copyTemplate(themeName: string, destinationPath: string): Promise<void> {
    const templatePath = path.join(this.templatesPath, themeName);

    // نسخ جميع ملفات الثيم
    await this.copyDirectory(templatePath, destinationPath);
  }

  /**
   * تطبيق بيانات المستخدم على الثيم
   */
  private async applyUserData(config: SiteConfig, sitePath: string): Promise<void> {
    // تعديل ملفات الكونفيج
    const configFile = path.join(sitePath, 'site.config.json');
    await fs.writeFile(
      configFile,
      JSON.stringify(
        {
          title: config.content.title,
          description: config.content.description,
          seo: config.seoSettings,
          pages: config.content.pages,
        },
        null,
        2,
      ),
    );

    // تعديل package.json
    const packageJsonPath = path.join(sitePath, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    packageJson.name = `site-${config.userId}`;
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }

  /**
   * تطبيق البلاجنز على الموقع
   */
  private async applyPlugins(plugins: string[], sitePath: string): Promise<void> {
    for (const pluginId of plugins) {
      await this.installPlugin(pluginId, sitePath);
    }
  }

  /**
   * بناء الموقع كـ Static Site
   */
  private async buildStaticSite(sitePath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const buildProcess = spawn('npm', ['run', 'build'], {
        cwd: sitePath,
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
   * رفع الموقع للاستضافة
   */
  private async deploySite(sitePath: string, domain: string): Promise<string> {
    // هنا يتم رفع الموقع لـ:
    // - Vercel
    // - Netlify
    // - AWS S3 + CloudFront
    // - أي CDN تاني

    const distPath = path.join(sitePath, 'out'); // Next.js static export

    // مثال: رفع لـ AWS S3
    // await this.uploadToS3(distPath, domain);

    return `https://${domain}`;
  }

  /**
   * تثبيت بلاجن على الموقع
   */
  private async installPlugin(pluginId: string, sitePath: string): Promise<void> {
    // جلب كود البلاجن من database
    // تطبيقه على الموقع
    // تعديل ملفات الكونفيج حسب البلاجن
  }

  /**
   * نسخ مجلد كامل
   */
  private async copyDirectory(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
}
