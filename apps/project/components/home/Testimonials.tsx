'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    content:
      'NestCraft transformed how we manage our content. The plugin system is incredibly powerful and the performance is outstanding.',
    author: 'Sarah Chen',
    role: 'CTO',
    company: 'TechFlow',
    rating: 5,
    avatar:
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  },
  {
    content:
      'The ease of use combined with enterprise-grade features makes NestCraft the perfect choice for our growing business.',
    author: 'Michael Rodriguez',
    role: 'Head of Digital',
    company: 'Creative Studio',
    rating: 5,
    avatar:
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  },
  {
    content:
      "We've tried many CMS platforms, but NestCraft's plugin ecosystem and performance are in a league of their own.",
    author: 'Emily Johnson',
    role: 'Marketing Director',
    company: 'StartupXYZ',
    rating: 5,
    avatar:
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  },
  {
    content:
      'The developer experience is fantastic. APIs are well-documented and the CLI tools save us hours of work.',
    author: 'David Kim',
    role: 'Lead Developer',
    company: 'InnovateLab',
    rating: 5,
    avatar:
      'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  },
];

export function Testimonials() {
  return (
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
            Loved by <span className="gradient-text">Developers</span> and Teams
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join thousands of satisfied customers who have transformed their
            digital presence with NestCraft.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-xl p-8 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <Quote className="h-8 w-8 text-blue-400 mb-4" />
              </div>

              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                &quot;{testimonial.content}&quot;
              </p>

              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>

              <div className="flex items-center space-x-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-white">
                    {testimonial.author}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
