import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Leaf,
  Truck,
  Shield,
  Users
} from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">FarmersMarket</span>
            </div>
            <p className="text-gray-400 text-sm">
              {t('home.subtitle')}
            </p>
            <p className="text-gray-400 text-sm">
              Connecting local farmers directly with consumers for fresh, 
              traceable, and sustainable produce.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/products" 
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {t('navigation.products')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/farmers" 
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {t('navigation.farmers')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/forum" 
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {t('navigation.forum')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {t('navigation.about')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {t('navigation.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Why Choose Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Leaf className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">100% Fresh Produce</p>
                  <p className="text-xs text-gray-400">Direct from farms to your table</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Truck className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Fast Delivery</p>
                  <p className="text-xs text-gray-400">Quick and reliable shipping</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Fully Traceable</p>
                  <p className="text-xs text-gray-400">Know your food's journey</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Support Local</p>
                  <p className="text-xs text-gray-400">Empower local farmers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <div>
                  <p className="text-sm">Email</p>
                  <p className="text-xs text-gray-400">support@farmersmarket.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <div>
                  <p className="text-sm">Phone</p>
                  <p className="text-xs text-gray-400">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm">Address</p>
                  <p className="text-xs text-gray-400">
                    123, Agricultural Market Complex,<br />
                    Farm Road, Rural District,<br />
                    State - 123456
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © 2024 FarmersMarket. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                Refund Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                FAQ
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
