#!/usr/bin/env node

import * as fs from "fs/promises";
import * as path from "path";
import inquirer from "inquirer";
import chalk from "chalk";

interface ThemeAnswers {
  name: string;
  description: string;
  category: string;
  price: number;
  authorName: string;
  authorEmail: string;
  authorWebsite?: string;
  features: string[];
}

const categories = [
  "blog",
  "ecommerce",
  "portfolio",
  "business",
  "creative",
  "landing",
];

const features = [
  "responsive",
  "dark-mode",
  "rtl",
  "seo-optimized",
  "accessibility",
  "animations",
  "ecommerce",
  "blog",
];

async function createTheme() {
  console.log(chalk.blue.bold("\n🎨 NestCraft Theme Generator\n"));

  const answers: ThemeAnswers = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Theme name:",
      validate: (input) => input.length > 0 || "Theme name is required",
    },
    {
      type: "input",
      name: "description",
      message: "Theme description:",
      validate: (input) =>
        input.length >= 10 || "Description must be at least 10 characters",
    },
    {
      type: "list",
      name: "category",
      message: "Theme category:",
      choices: categories,
    },
    {
      type: "number",
      name: "price",
      message: "Price (0 for free):",
      default: 0,
      validate: (input) => input >= 0 || "Price must be non-negative",
    },
    {
      type: "input",
      name: "authorName",
      message: "Your name:",
      validate: (input) => input.length > 0 || "Author name is required",
    },
    {
      type: "input",
      name: "authorEmail",
      message: "Your email:",
      validate: (input) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input) || "Valid email is required";
      },
    },
    {
      type: "input",
      name: "authorWebsite",
      message: "Your website (optional):",
    },
    {
      type: "checkbox",
      name: "features",
      message: "Select features:",
      choices: features,
    },
  ]);

  const themeName = answers.name.toLowerCase().replace(/\s+/g, "-");
  const themeDir = path.join(process.cwd(), themeName);

  try {
    // إنشاء مجلد الثيم
    await fs.mkdir(themeDir, { recursive: true });

    // إنشاء ملفات الثيم
    await createThemeFiles(themeDir, answers, themeName);

    console.log(
      chalk.green.bold(`\n✅ Theme "${answers.name}" created successfully!`)
    );
    console.log(chalk.yellow(`📁 Location: ${themeDir}`));
    console.log(chalk.blue("\n📋 Next steps:"));
    console.log(`   cd ${themeName}`);
    console.log(`   npm install`);
    console.log(`   npm run dev`);
    console.log(`   nestcraft-theme validate`);
    console.log(`   nestcraft-theme publish`);
  } catch (error) {
    console.error(chalk.red("❌ Error creating theme:"), error);
  }
}

async function createThemeFiles(
  themeDir: string,
  answers: ThemeAnswers,
  themeName: string
) {
  // 1. theme.config.json
  const themeConfig = {
    name: answers.name,
    version: "1.0.0",
    description: answers.description,
    author: {
      name: answers.authorName,
      email: answers.authorEmail,
      ...(answers.authorWebsite && { website: answers.authorWebsite }),
    },
    marketplace: {
      price: answers.price,
      category: answers.category,
      tags: [answers.category, ...answers.features.slice(0, 3)],
      screenshots: ["https://via.placeholder.com/800x600"],
      demoUrl: `https://demo.nestcraft.com/${themeName}`,
    },
    requirements: {
      nextVersion: "^14.0.0",
      plugins: [],
      features: answers.features,
    },
    customization: {
      colors: {
        primary: "#3b82f6",
        secondary: "#64748b",
        accent: "#f59e0b",
      },
      typography: {
        headingFont: "Inter",
        bodyFont: "Inter",
        fontSizes: {
          xs: "0.75rem",
          sm: "0.875rem",
          base: "1rem",
          lg: "1.125rem",
          xl: "1.25rem",
        },
      },
      layout: {
        maxWidth: "1200px",
        spacing: "1rem",
        borderRadius: "0.5rem",
      },
    },
    pages: {
      home: true,
      about: true,
      blog: answers.features.includes("blog"),
      contact: true,
      shop: answers.features.includes("ecommerce"),
      custom: [],
    },
    seo: {
      structuredData: true,
      openGraph: true,
      twitterCard: true,
      sitemap: true,
    },
  };

  await fs.writeFile(
    path.join(themeDir, "theme.config.json"),
    JSON.stringify(themeConfig, null, 2)
  );

  // 2. package.json
  const packageJson = {
    name: `@nestcraft-themes/${themeName}`,
    version: "1.0.0",
    description: answers.description,
    author: `${answers.authorName} <${answers.authorEmail}>`,
    license: "MIT",
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      export: "next build && next export",
      validate: "nestcraft-theme validate",
      publish: "nestcraft-theme publish",
    },
    dependencies: {
      next: "^14.0.0",
      react: "^18.0.0",
      "react-dom": "^18.0.0",
      "@nestcraft/theme-engine": "latest",
      "@nestcraft/ui": "latest",
    },
    devDependencies: {
      "@types/node": "^20.0.0",
      "@types/react": "^18.0.0",
      typescript: "^5.0.0",
      "@nestcraft/theme-sdk": "latest",
    },
  };

  await fs.writeFile(
    path.join(themeDir, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  // 3. إنشاء ملفات Next.js الأساسية
  await createNextJSFiles(themeDir, answers);
}

async function createNextJSFiles(themeDir: string, answers: ThemeAnswers) {
  // Theme config for CSS variables
  const themeConfig = {
    customization: {
      colors: {
        primary: "#3b82f6",
        secondary: "#64748b",
        accent: "#f59e0b",
      },
      typography: {
        headingFont: "Inter",
        bodyFont: "Inter",
      },
    },
  };
  // next.config.js
  const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig`;

  await fs.writeFile(path.join(themeDir, "next.config.js"), nextConfig);

  // tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: "es5",
      lib: ["dom", "dom.iterable", "es6"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "node",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: {
        "@/*": ["./src/*"],
      },
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"],
  };

  await fs.writeFile(
    path.join(themeDir, "tsconfig.json"),
    JSON.stringify(tsConfig, null, 2)
  );

  // إنشاء مجلد src والملفات الأساسية
  await fs.mkdir(path.join(themeDir, "src", "pages"), { recursive: true });
  await fs.mkdir(path.join(themeDir, "src", "components"), { recursive: true });
  await fs.mkdir(path.join(themeDir, "src", "styles"), { recursive: true });

  // Home page
  const homePage = `import { ThemeLayout } from '@nestcraft/theme-engine';

export default function Home() {
  return (
    <ThemeLayout>
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8">
            Welcome to ${answers.name}
          </h1>
          <p className="text-lg text-center text-gray-600">
            ${answers.description}
          </p>
        </div>
      </main>
    </ThemeLayout>
  );
}`;

  await fs.writeFile(
    path.join(themeDir, "src", "pages", "index.tsx"),
    homePage
  );

  // Global styles
  const globalStyles = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: ${themeConfig.customization.colors.primary};
  --color-secondary: ${themeConfig.customization.colors.secondary};
  --color-accent: ${themeConfig.customization.colors.accent};
}

body {
  font-family: '${themeConfig.customization.typography.bodyFont}', sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: '${themeConfig.customization.typography.headingFont}', sans-serif;
}`;

  await fs.writeFile(
    path.join(themeDir, "src", "styles", "globals.css"),
    globalStyles
  );

  // README.md
  const readme = `# ${answers.name}

${answers.description}

## Features
${answers.features.map((feature) => `- ${feature}`).join("\n")}

## Installation
\`\`\`bash
npm install
npm run dev
\`\`\`

## Development
\`\`\`bash
# Validate theme
npm run validate

# Publish to marketplace
npm run publish
\`\`\`

## Author
${answers.authorName} <${answers.authorEmail}>
${answers.authorWebsite ? `Website: ${answers.authorWebsite}` : ""}`;

  await fs.writeFile(path.join(themeDir, "README.md"), readme);
}

// تشغيل الـ CLI
createTheme().catch(console.error);
