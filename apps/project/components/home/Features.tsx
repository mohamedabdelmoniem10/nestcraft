'use client';

import { motion } from 'framer-motion';
import { Puzzle, Lock, Zap, Users, Code, Smartphone } from 'lucide-react';

const features = [
  {
    icon: Puzzle,
    title: 'Plugin System',
    description: 'Extend functionality with our powerful plugin architecture. Build custom features or choose from hundreds of pre-built plugins.',
    color: 'text-purple-400',
  },
  {
    icon: Lock,
    title: 'Advanced Security',
    description: 'Enterprise-grade security with role-based access control, encryption, and regular security audits.',
    color: 'text-blue-400',
  },
  {
    icon: Zap,
    title: 'High Performance',
    description: 'Optimized for speed with advanced caching, CDN integration, and lightning-fast loading times.',
    color: 'text-yellow-400',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Built-in collaboration tools for teams with real-time editing, comments, and workflow management.',
    color: 'text-green-400',
  },
  {
    icon: Code,
    title: 'Developer Friendly',
    description: 'Comprehensive APIs, CLI tools, and extensive documentation for developers to build amazing experiences.',
    color: 'text-red-400',
  },
  {
    icon: Smartphone,
    title: 'Mobile Ready',
    description: 'Fully responsive design with mobile-first approach. Manage your content from anywhere, any device.',
    color: 'text-indigo-400',
  },
];

export function Features() {
  return (
    <section className="py-24 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Why Choose <span className="gradient-text">NestCraft</span>?
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Our platform combines powerful features with ease of use, giving you everything 
            you need to create exceptional digital experiences.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-xl p-8 hover:bg-white/10 transition-all duration-300 group"
            >
              <feature.icon className={`h-12 w-12 ${feature.color} mb-6 group-hover:scale-110 transition-transform`} />
              <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}