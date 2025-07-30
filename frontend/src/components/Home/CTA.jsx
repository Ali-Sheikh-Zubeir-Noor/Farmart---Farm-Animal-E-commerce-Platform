import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sprout, ShoppingCart } from 'lucide-react';

const CTA = () => {
  return (
    <div className="bg-gradient-to-r from-green-600 to-green-700 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-extrabold text-white sm:text-4xl"
          >
            Ready to Transform Your Livestock Business?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-xl text-green-100 max-w-3xl mx-auto"
          >
            Join thousands of farmers and buyers who are already benefiting from direct, fair, and transparent livestock trading.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-gray-50 transition-colors"
            >
              <Sprout className="mr-2 h-5 w-5" />
              Start Selling as Farmer
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/animals"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-green-600 transition-colors"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Browse Animals
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CTA;