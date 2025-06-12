import { z } from "zod";

// Schema للـ Theme Configuration
export const ThemeConfigSchema = z.object({
  // معلومات أساسية
  name: z.string().min(1, "Theme name is required"),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must be semver format"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  author: z.object({
    name: z.string(),
    email: z.string().email(),
    website: z.string().url().optional(),
  }),

  // معلومات السوق
  marketplace: z.object({
    price: z.number().min(0, "Price must be non-negative"), // 0 للمجاني
    category: z.enum([
      "blog",
      "ecommerce",
      "portfolio",
      "business",
      "creative",
      "landing",
    ]),
    tags: z.array(z.string()).max(10, "Maximum 10 tags"),
    screenshots: z
      .array(z.string().url())
      .min(1, "At least one screenshot required"),
    demoUrl: z.string().url().optional(),
  }),

  // متطلبات تقنية
  requirements: z.object({
    nextVersion: z.string().default("^14.0.0"),
    plugins: z.array(z.string()).default([]),
    features: z.array(
      z.enum([
        "responsive",
        "dark-mode",
        "rtl",
        "seo-optimized",
        "accessibility",
        "animations",
        "ecommerce",
        "blog",
      ])
    ),
  }),

  // إعدادات التخصيص
  customization: z.object({
    colors: z.object({
      primary: z.string().default("#3b82f6"),
      secondary: z.string().default("#64748b"),
      accent: z.string().default("#f59e0b"),
    }),
    typography: z.object({
      headingFont: z.string().default("Inter"),
      bodyFont: z.string().default("Inter"),
      fontSizes: z.object({
        xs: z.string().default("0.75rem"),
        sm: z.string().default("0.875rem"),
        base: z.string().default("1rem"),
        lg: z.string().default("1.125rem"),
        xl: z.string().default("1.25rem"),
      }),
    }),
    layout: z.object({
      maxWidth: z.string().default("1200px"),
      spacing: z.string().default("1rem"),
      borderRadius: z.string().default("0.5rem"),
    }),
  }),

  // Page Templates
  pages: z.object({
    home: z.boolean().default(true),
    about: z.boolean().default(true),
    blog: z.boolean().default(false),
    contact: z.boolean().default(true),
    shop: z.boolean().default(false),
    custom: z
      .array(
        z.object({
          name: z.string(),
          template: z.string(),
          required: z.boolean().default(false),
        })
      )
      .default([]),
  }),

  // SEO Configuration
  seo: z.object({
    structuredData: z.boolean().default(true),
    openGraph: z.boolean().default(true),
    twitterCard: z.boolean().default(true),
    sitemap: z.boolean().default(true),
  }),
});

export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;

// Schema للـ Theme Package
export const ThemePackageSchema = z.object({
  config: ThemeConfigSchema,
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
      type: z.enum(["component", "page", "style", "config", "asset"]),
    })
  ),
  dependencies: z.record(z.string()),
  assets: z.array(
    z.object({
      name: z.string(),
      url: z.string().url(),
      type: z.enum(["image", "font", "icon"]),
    })
  ),
});

export type ThemePackage = z.infer<typeof ThemePackageSchema>;

// Interface للـ Theme Hooks (للتفاعل مع النظام)
export interface ThemeHooks {
  onInstall?: (siteData: any) => Promise<void>;
  onUpdate?: (oldVersion: string, newVersion: string) => Promise<void>;
  onUninstall?: () => Promise<void>;
  onCustomize?: (settings: any) => Promise<void>;
}

// Component Types للثيمات
export interface ThemeComponent {
  name: string;
  props?: Record<string, any>;
  children?: ThemeComponent[];
  style?: Record<string, any>;
}

export interface PageTemplate {
  name: string;
  components: ThemeComponent[];
  layout: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

// Marketplace Types
export interface MarketplaceTheme {
  id: string;
  config: ThemeConfig;
  downloadCount: number;
  rating: number;
  reviews: number;
  lastUpdated: Date;
  featured: boolean;
  status: "approved" | "pending" | "rejected";
}
