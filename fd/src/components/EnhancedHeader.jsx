import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

const EnhancedHeader = ({ darkMode, setDarkMode, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleNavClick = (action) => {
    if (onNavigate) {
      onNavigate(action);
    }
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Home', action: 'home' },
    { label: 'Predict', action: 'predict' },
    { label: 'History', action: 'history' },
  ];

  return (
    <motion.header
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <motion.div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-blue to-blue-600 flex items-center justify-center shadow-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Shield className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">SafeStride</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                AI Road Safety
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.button
                key={index}
                onClick={() => handleNavClick(item.action)}
                className="text-gray-700 dark:text-gray-300 font-semibold hover:text-brand-blue dark:hover:text-blue-400 transition-colors relative group"
                whileHover={{ y: -2 }}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-blue group-hover:w-full transition-all duration-300" />
              </motion.button>
            ))}
          </div>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <motion.button
              onClick={toggleDarkMode}
              className="relative w-16 h-8 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-gray-900 shadow-md flex items-center justify-center"
                animate={{
                  x: darkMode ? 32 : 0,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <motion.div
                  animate={{ rotate: darkMode ? 180 : 0, scale: darkMode ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute"
                >
                  <Moon className="w-4 h-4 text-brand-blue" />
                </motion.div>
                <motion.div
                  animate={{ rotate: darkMode ? 180 : 0, scale: darkMode ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute"
                >
                  <Sun className="w-4 h-4 text-brand-amber" />
                </motion.div>
              </motion.div>
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden py-4 overflow-hidden"
          >
            {navItems.map((item, index) => (
              <motion.button
                key={index}
                onClick={() => handleNavClick(item.action)}
                className="block w-full text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                {item.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
};

export default EnhancedHeader;
