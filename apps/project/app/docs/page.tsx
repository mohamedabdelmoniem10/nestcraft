'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Code, Puzzle, Rocket, Search, ChevronRight, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const docCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Rocket,
    description: 'Learn the basics and get up and running quickly',
    docs: [
      { title: 'Installation Guide', description: 'Step-by-step installation instructions', readTime: '5 min' },
      { title: 'Quick Start Tutorial', description: 'Build your first site in minutes', readTime: '10 min' },
      { title: 'Configuration Options', description: 'Customize your installation', readTime: '8 min' },
      { title: 'First Content Creation', description: 'Create your first pages and posts', readTime: '12 min' }
    ]
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: Code,
    description: 'Complete API documentation and examples',
    docs: [
      { title: 'REST API Overview', description: 'Introduction to our REST API', readTime: '7 min' },
      { title: 'GraphQL API', description: 'Query data with GraphQL', readTime: '15 min' },
      { title: 'Authentication', description: 'API authentication methods', readTime: '10 min' },
      { title: 'Rate Limiting', description: 'Understanding API limits', readTime: '5 min' }
    ]
  },
  {
    id: 'plugin-development',
    title: 'Plugin Development',
    icon: Puzzle,
    description: 'Build and publish your own plugins',
    docs: [
      { title: 'Plugin Architecture', description: 'Understanding the plugin system', readTime: '20 min' },
      { title: 'Development Environment', description: 'Set up your dev environment', readTime: '15 min' },
      { title: 'Plugin API Reference', description: 'Complete plugin API docs', readTime: '25 min' },
      { title: 'Publishing Guide', description: 'Publish to the marketplace', readTime: '10 min' }
    ]
  },
  {
    id: 'guides',
    title: 'Guides & Tutorials',
    icon: Book,
    description: 'In-depth guides for advanced topics',
    docs: [
      { title: 'Performance Optimization', description: 'Optimize your site for speed', readTime: '18 min' },
      { title: 'Security Best Practices', description: 'Keep your site secure', readTime: '22 min' },
      { title: 'Multi-site Management', description: 'Manage multiple sites', readTime: '15 min' },
      { title: 'Advanced Theming', description: 'Create custom themes', readTime: '30 min' }
    ]
  }
];

const popularDocs = [
  { title: 'Installation Guide', category: 'Getting Started', views: '45K' },
  { title: 'REST API Overview', category: 'API Reference', views: '32K' },
  { title: 'Plugin Architecture', category: 'Plugin Development', views: '28K' },
  { title: 'Performance Optimization', category: 'Guides', views: '25K' },
  { title: 'Quick Start Tutorial', category: 'Getting Started', views: '22K' }
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('getting-started');

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Documentation <span className="gradient-text">Portal</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Everything you need to know about NestCraft. From getting started guides 
              to advanced API documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
              </div>
              <Button className="gradient-bg">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-gray-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Quick Start', description: 'Get started in 5 minutes', icon: Rocket, color: 'text-green-400' },
              { title: 'API Reference', description: 'Complete API docs', icon: Code, color: 'text-blue-400' },
              { title: 'Plugin Guide', description: 'Build your first plugin', icon: Puzzle, color: 'text-purple-400' },
              { title: 'Examples', description: 'Code examples & demos', icon: Book, color: 'text-yellow-400' }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
              >
                <item.icon className={`h-10 w-10 ${item.color} mb-4 group-hover:scale-110 transition-transform`} />
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Documentation Content */}
      <section className="py-12 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass rounded-xl p-6 sticky top-24">
                <h3 className="text-lg font-semibold mb-4">Documentation</h3>
                <nav className="space-y-2">
                  {docCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg transition-all ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <category.icon className="h-5 w-5" />
                      <span className="font-medium">{category.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {docCategories.map((category) => {
                  if (category.id !== selectedCategory) return null;
                  
                  return (
                    <div key={category.id}>
                      <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-4">
                          <category.icon className="h-8 w-8 text-blue-400" />
                          <h2 className="text-3xl font-bold">{category.title}</h2>
                        </div>
                        <p className="text-gray-400 text-lg">{category.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {category.docs.map((doc, index) => (
                          <motion.div
                            key={doc.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-xl font-semibold group-hover:text-blue-400 transition-colors">
                                {doc.title}
                              </h3>
                              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                            </div>
                            <p className="text-gray-400 mb-4">{doc.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">{doc.readTime} read</span>
                              <ExternalLink className="h-4 w-4 text-gray-400" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Documentation */}
      <section className="py-12 bg-gradient-to-br from-purple-900/10 via-blue-900/10 to-green-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Popular Documentation</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Most viewed and helpful documentation articles to get you started quickly.
            </p>
          </motion.div>

          <div className="glass rounded-xl overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-6">Most Popular Articles</h3>
              <div className="space-y-4">
                {popularDocs.map((doc, index) => (
                  <motion.div
                    key={doc.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-all cursor-pointer group"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold group-hover:text-blue-400 transition-colors">
                        {doc.title}
                      </h4>
                      <p className="text-gray-400 text-sm">{doc.category}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-400 text-sm">{doc.views} views</span>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}