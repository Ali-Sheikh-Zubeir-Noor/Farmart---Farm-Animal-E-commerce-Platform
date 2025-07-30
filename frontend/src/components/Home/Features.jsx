import React from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, TrendingUp, Truck, Clock, Star } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Users,
      title: 'Direct Connection',
      description: 'Connect directly with farmers and buyers, eliminating unnecessary middlemen and ensuring fair prices.',
      color: 'bg-green-500'
    },
    {
      icon: Shield,
      title: 'Trusted Platform',
      description: 'Secure transactions and verified users ensure a safe and reliable trading environment.',
      color: 'bg-blue-500'
    },
    {
      icon: TrendingUp,
      title: 'Better Profits',
      description: 'Farmers get better prices for their livestock while buyers get quality animals at fair rates.',
      color: 'bg-purple-500'
    },
    {
      icon: Truck,
      title: 'Easy Delivery',
      description: 'Streamlined logistics and delivery options to get your animals safely to their destination.',
      color: 'bg-orange-500'
    },
    {
      icon: Clock,
      title: 'Quick Transactions',
      description: 'Fast and efficient buying process with instant notifications and order tracking.',
      color: 'bg-red-500'
    },
    {
      icon: Star,
      title: 'Quality Assured',
      description: 'All animals are verified by farmers with detailed health and breeding information.',
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-extrabold text-gray-900 sm:text-4xl"
          >
            Why Choose Farmart?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-xl text-gray-600"
          >
            Revolutionizing livestock trading with modern technology
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-md ${feature.color} text-white mb-4`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;