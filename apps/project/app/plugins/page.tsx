'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Download, Heart, Zap, Shield, Users, Code, Smartphone, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const categories = [
  { id: 'all', name: 'All Categories', icon: Zap },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'performance', name: 'Performance', icon: Zap },
  { id: 'social', name: 'Social', icon: Users },
  { id: 'development', name: 'Development', icon: Code },
  { id: 'mobile', name: 'Mobile', icon: Smartphone },
  { id: 'database', name: 'Database', icon: Database },
];

const plugins = [
  {
    id: 1,
    name: 'Advanced Security Suite',
    description: 'Comprehensive security plugin with firewall, malware detection, and intrusion prevention.',
    category: 'security',
    rating: 4.9,
    downloads: 125000,
    price: 'Free',
    featured: true,
    image: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    author: 'SecureTeam',
    tags: ['Security', 'Firewall', 'Protection']
  },
  {
    id: 2,
    name: 'Performance Optimizer Pro',
    description: 'Boost your site speed with advanced caching, image optimization, and database cleanup.',
    category: 'performance',
    rating: 4.8,
    downloads: 89000,
    price: '$29',
    featured: true,
    image: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    author: 'SpeedLabs',
    tags: ['Performance', 'Caching', 'Optimization']
  },
  {
    id: 3,
    name: 'Social Media Integration',
    description: 'Connect all your social media accounts with automatic posting and analytics.',
    category: 'social',
    rating: 4.7,
    downloads: 67000,
    price: '$19',
    featured: false,
    image: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    author: 'SocialHub',
    tags: ['Social Media', 'Analytics', 'Automation']
  },
  {
    id: 4,
    name: 'Developer Toolkit',
    description: 'Essential tools for developers including code editor, debugger, and deployment helpers.',
    category: 'development',
    rating: 4.9,
    downloads: 45000,
    price: 'Free',
    featured: false,
    image: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    author: 'DevTools Inc',
    tags: ['Development', 'Code Editor', 'Debugging']
  },
  {
    id: 5,
    name: 'Mobile App Builder',
    description: 'Create native mobile apps from your website content with push notifications.',
    category: 'mobile',
    rating: 4.6,
    downloads: 34000,
    price: '$49',
    featured: true,
    image: 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-of-information-147413.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    author: 'MobileFirst',
    tags: ['Mobile', 'App Builder', 'Notifications']
  },
  {
    id: 6,
    name: 'Database Manager Plus',
    description: 'Advanced database management with backup, migration, and optimization tools.',
    category: 'database',
    rating: 4.8,
    downloads: 56000,
    price: '$39',
    featured: false,
    image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    author: 'DataPro',
    tags: ['Database', 'Backup', 'Migration']
  }
];

export default function PluginsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const filteredPlugins = plugins.filter(plugin => {
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedPlugins = [...filteredPlugins].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id - a.id;
      case 'price':
        const aPrice = a.price === 'Free' ? 0 : parseInt(a.price.replace('$', ''));
        const bPrice = b.price === 'Free' ? 0 : parseInt(b.price.replace('$', ''));
        return aPrice - bPrice;
      default:
        return 0;
    }
  });

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
              Plugin <span className="gradient-text">Marketplace</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Extend your NestCraft installation with powerful plugins. From security to performance, 
              find the perfect tools to enhance your website.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search plugins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
              </div>
              <Button variant="outline" className="border-white/20">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-gray-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-4 pb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <category.icon className="h-4 w-4" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sort and Stats */}
      <section className="py-6 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 sm:mb-0">
              Showing {sortedPlugins.length} of {plugins.length} plugins
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
              <option value="price">Price: Low to High</option>
            </select>
          </div>
        </div>
      </section>

      {/* Featured Plugins */}
      <section className="py-12 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Featured Plugins</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {sortedPlugins.filter(plugin => plugin.featured).map((plugin, index) => (
              <motion.div
                key={plugin.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="relative">
                  <img
                    src={plugin.image}
                    alt={plugin.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Heart className="h-6 w-6 text-white/60 hover:text-red-400 cursor-pointer transition-colors" />
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold group-hover:text-blue-400 transition-colors">
                      {plugin.name}
                    </h3>
                    <span className="text-lg font-bold text-green-400">{plugin.price}</span>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4">{plugin.description}</p>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{plugin.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Download className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">{plugin.downloads.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {plugin.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="bg-gray-800 text-gray-300 px-2 py-1 rounded-md text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">by {plugin.author}</span>
                    <Button size="sm" className="gradient-bg">
                      Install
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Plugins Grid */}
      <section className="py-12 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">All Plugins</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPlugins.map((plugin, index) => (
              <motion.div
                key={plugin.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: (index % 6) * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="relative">
                  <img
                    src={plugin.image}
                    alt={plugin.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {plugin.featured && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-semibold">
                        Featured
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Heart className="h-6 w-6 text-white/60 hover:text-red-400 cursor-pointer transition-colors" />
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold group-hover:text-blue-400 transition-colors">
                      {plugin.name}
                    </h3>
                    <span className="text-lg font-bold text-green-400">{plugin.price}</span>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4">{plugin.description}</p>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{plugin.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Download className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">{plugin.downloads.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {plugin.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="bg-gray-800 text-gray-300 px-2 py-1 rounded-md text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">by {plugin.author}</span>
                    <Button size="sm" className="gradient-bg">
                      Install
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}