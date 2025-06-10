'use client';

import { motion } from 'framer-motion';
import { Play, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function Demo() {
  const [activeDevice, setActiveDevice] = useState('desktop');

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
            See NestCraft in <span className="gradient-text">Action</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Experience the power and simplicity of our platform with an interactive demo. 
            See how easy it is to create and manage content.
          </p>
          <Button size="lg" className="gradient-bg group">
            <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Start Interactive Demo
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
        >
          {/* Device selector */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-gray-800/50 rounded-lg p-1">
              {[
                { id: 'desktop', icon: Monitor, label: 'Desktop' },
                { id: 'tablet', icon: Tablet, label: 'Tablet' },
                { id: 'mobile', icon: Smartphone, label: 'Mobile' },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveDevice(id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                    activeDevice === id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Demo interface mockup */}
          <div className="relative">
            <motion.div
              key={activeDevice}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`mx-auto bg-gray-800 rounded-xl border border-gray-700 overflow-hidden ${
                activeDevice === 'desktop' ? 'max-w-6xl aspect-video' :
                activeDevice === 'tablet' ? 'max-w-2xl aspect-[4/3]' :
                'max-w-sm aspect-[9/16]'
              }`}
            >
              {/* Browser bar */}
              <div className="flex items-center space-x-2 bg-gray-700 px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 bg-gray-600 rounded-md px-3 py-1 text-sm text-gray-300">
                  nestcraft.com/admin
                </div>
              </div>

              {/* Demo content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Dashboard</h3>
                  <div className="flex space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                    <div className="w-8 h-8 bg-purple-600 rounded-lg"></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass rounded-lg p-4">
                    <div className="w-full h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mb-2"></div>
                    <div className="w-3/4 h-4 bg-gray-600 rounded mb-2"></div>
                    <div className="w-1/2 h-3 bg-gray-700 rounded"></div>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <div className="w-full h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg mb-2"></div>
                    <div className="w-3/4 h-4 bg-gray-600 rounded mb-2"></div>
                    <div className="w-1/2 h-3 bg-gray-700 rounded"></div>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <div className="w-full h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mb-2"></div>
                    <div className="w-3/4 h-4 bg-gray-600 rounded mb-2"></div>
                    <div className="w-1/2 h-3 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}