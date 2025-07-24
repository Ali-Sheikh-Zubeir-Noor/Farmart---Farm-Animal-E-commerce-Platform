import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold">Farmart</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Connecting farmers directly with buyers, eliminating middlemen and ensuring fair prices for farm animals. 
              Building trust in the agricultural community.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-green-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-green-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-green-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-green-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/animals" className="text-gray-300 hover:text-green-500 transition-colors">
                  Browse Animals
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-green-500 transition-colors">
                  Join as Farmer
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-green-500 transition-colors">
                  Register as Buyer
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-green-500" />
                <span className="text-gray-300">support@farmart.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-green-500" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-green-500" />
                <span className="text-gray-300">123 Farm Street, Agriculture City</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2024 Farmart. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-300 hover:text-green-500 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-300 hover:text-green-500 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-300 hover:text-green-500 text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;