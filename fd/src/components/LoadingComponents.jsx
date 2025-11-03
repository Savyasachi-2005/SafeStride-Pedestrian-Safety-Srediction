import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Shield } from 'lucide-react';

const LoadingSpinner = ({ message = 'Analyzing data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-24 h-24 rounded-full border-4 border-blue-200 dark:border-blue-900/30" />
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-brand-blue animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield className="w-10 h-10 text-brand-blue" />
        </div>
      </motion.div>

      <motion.p
        className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {message}
      </motion.p>

      <div className="flex gap-2 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-brand-blue rounded-full"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const SkeletonCard = () => {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        <div className="flex-1">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2" />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export { LoadingSpinner, SkeletonCard };
