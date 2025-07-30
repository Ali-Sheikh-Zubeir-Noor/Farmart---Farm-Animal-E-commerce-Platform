import React from 'react';
import { Sprout, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Sprout className="h-8 w-8 text-green-400" />
              <span className="text-2xl font-bold">Farmart</span>
            </div>
            <p className="text-green-100 mb-4">
              Connecting farmers directly with buyers, eliminating middlemen and ensuring fair prices for quality livestock.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-green-400" />
                <span className="text-sm">contact@farmart.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-green-400" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/animals" className="text-green-100 hover:text-white transition-colors">Browse Animals</a></li>
              <li><a href="/register" className="text-green-100 hover:text-white transition-colors">Join as Farmer</a></li>
              <li><a href="/register" className="text-green-100 hover:text-white transition-colors">Join as Buyer</a></li>
              <li><a href="/about" className="text-green-100 hover:text-white transition-colors">About Us</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="/help" className="text-green-100 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/contact" className="text-green-100 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="/terms" className="text-green-100 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/privacy" className="text-green-100 hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-700 mt-8 pt-8 text-center">
          <p className="text-green-100">
            © 2024 Farmart. All rights reserved. Empowering farmers, connecting communities.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;