'use client';

import { motion } from 'framer-motion';
import { Puzzle, Lock, Zap, Users, Code, Smartphone, Database, Cloud, Gauge, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Puzzle,
    title: 'Extensible Plugin System',
    description: 'Build custom functionality with our powerful plugin architecture. Create, share, and monetize plugins in our marketplace.',
    details: [
      'TypeScript-first plugin development',
      'Hot-reload during development',
      'Plugin dependency management',
      'Secure sandboxed execution',
      'Revenue sharing for plugin developers'
    ],
    image: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2'
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'Military-grade security with advanced encryption, access controls, and compliance certifications.',
    details: [
      'SOC 2 Type II certified',
      'GDPR and CCPA compliant',
      'End-to-end encryption',
      'Multi-factor authentication',
      'Regular security audits'
    ],
    image: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2'
  },
  {
    icon: Zap,
    title: 'Lightning Performance',
    description: 'Optimized for speed with intelligent caching, CDN integration, and advanced performance monitoring.',
    details: [
      'Global CDN with 200+ edge locations',
      'Intelligent image optimization',
      'Advanced caching strategies',
      'Real-time performance monitoring',
      'Core Web Vitals optimization'
    ],
    image: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2'
  },
  {
    icon: Database,
    title: 'Flexible Data Management',
    description: 'Support for multiple databases with automatic scaling, backups, and data synchronization.',
    details: [
      'Multi-database support (PostgreSQL, MongoDB, MySQL)',
      'Automatic backups and restore',
      'Real-time data synchronization',
      'Schema migrations with zero downtime',
      'Advanced query optimization'
    ],
    image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2'
  }
];

const comparisons = [
  {
    feature: 'Plugin System',
    nestcraft: 'Advanced TypeScript-first',
    wordpress: 'PHP-based, limited',
    drupal: 'Complex module system',
    competitor: 'Basic extensions'
  },
  {
    feature: 'Performance',
    nestcraft: 'Sub-second loading',
    wordpress: 'Requires optimization',
    drupal: 'Heavy, slow by default',
    competitor: 'Average performance'
  },
  {
    feature: 'Security',
    nestcraft: 'Enterprise-grade, SOC 2',
    wordpress: 'Plugin-dependent',
    drupal: 'Good, complex setup',
    competitor: 'Basic security'
  },
  {
    feature: 'Developer Experience',
    nestcraft: 'Modern, TypeScript',
    wordpress: 'Legacy PHP',
    drupal: 'Steep learning curve',
    competitor: 'Limited customization'
  },
  {
    feature: 'Scalability',
    nestcraft: 'Auto-scaling, global',
    wordpress: 'Manual scaling',
    drupal: 'Complex scaling',
    competitor: 'Limited scaling'
  }
];

export default function FeaturesPage() {
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
              Powerful Features for <span className="gradient-text">Modern Web</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Discover the comprehensive set of features that make NestCraft the most 
              advanced CMS platform for developers and content creators.
            </p>
            <Button size="lg" className="gradient-bg">
              Start Free Trial
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Detailed Features */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <feature.icon className="h-12 w-12 text-blue-400 mb-6" />
                  <h3 className="text-3xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-300 text-lg mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-400">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <div className="glass rounded-2xl p-2 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-80 object-cover rounded-xl"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-gradient-to-br from-purple-900/10 via-blue-900/10 to-green-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              How We <span className="gradient-text">Compare</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              See how NestCraft stacks up against other popular CMS platforms.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="glass rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-6 font-semibold">Feature</th>
                    <th className="text-center p-6 font-semibold gradient-text">NestCraft</th>
                    <th className="text-center p-6 font-semibold text-gray-400">WordPress</th>
                    <th className="text-center p-6 font-semibold text-gray-400">Drupal</th>
                    <th className="text-center p-6 font-semibold text-gray-400">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((row, index) => (
                    <tr key={row.feature} className="border-b border-white/5">
                      <td className="p-6 font-medium">{row.feature}</td>
                      <td className="p-6 text-center text-green-400 font-medium">{row.nestcraft}</td>
                      <td className="p-6 text-center text-gray-400">{row.wordpress}</td>
                      <td className="p-6 text-center text-gray-400">{row.drupal}</td>
                      <td className="p-6 text-center text-gray-400">{row.competitor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Technical Specifications */}
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
              Technical <span className="gradient-text">Specifications</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Built with modern technologies for maximum performance and reliability.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Code,
                title: 'Modern Stack',
                specs: ['Node.js 18+', 'TypeScript', 'React 18', 'Next.js 14', 'GraphQL']
              },
              {
                icon: Database,
                title: 'Database Support',
                specs: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis Cache', 'Elasticsearch']
              },
              {
                icon: Cloud,
                title: 'Cloud Native',
                specs: ['Docker Containers', 'Kubernetes', 'Auto-scaling', 'Load Balancing', 'Health Checks']
              },
              {
                icon: Globe,
                title: 'Global Infrastructure',
                specs: ['200+ Edge Locations', '99.99% Uptime SLA', 'Multi-region Backup', 'DDoS Protection', 'WAF Security']
              },
              {
                icon: Gauge,
                title: 'Performance',
                specs: ['<100ms Response Time', 'Intelligent Caching', 'Image Optimization', 'Code Splitting', 'Lazy Loading']
              },
              {
                icon: Smartphone,
                title: 'API & Integration',
                specs: ['RESTful API', 'GraphQL Endpoint', 'Webhooks', 'SDKs Available', 'Third-party Integrations']
              }
            ].map((spec, index) => (
              <motion.div
                key={spec.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-xl p-6"
              >
                <spec.icon className="h-10 w-10 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-4">{spec.title}</h3>
                <ul className="space-y-2">
                  {spec.specs.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-400 text-sm flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}