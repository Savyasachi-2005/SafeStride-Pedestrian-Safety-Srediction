import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingDown, Users, Award } from 'lucide-react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

const HeroSection = ({ modelMetrics }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [typedText, setTypedText] = useState('');
  const fullText = 'Predict. Prevent. Protect.';

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const stats = modelMetrics?.metrics ? [
    {
      icon: <Award className="w-8 h-8" />,
      value: modelMetrics.metrics.test_accuracy * 100,
      suffix: '%',
      label: 'Test Accuracy',
      color: 'from-emerald-500 to-green-600',
    },
    {
      icon: <TrendingDown className="w-8 h-8" />,
      value: modelMetrics.metrics.f1_score * 100,
      suffix: '%',
      label: 'F1 Score',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      value: modelMetrics.metrics.n_features,
      suffix: '',
      label: 'Features',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: <Users className="w-8 h-8" />,
      value: Math.round(modelMetrics.metrics.n_samples_train / 1000),
      suffix: 'K',
      label: 'Training Samples',
      color: 'from-amber-500 to-orange-600',
    },
  ] : [];

  const floatingShapes = [
    { size: 'w-64 h-64', position: 'top-20 left-10', delay: 0 },
    { size: 'w-40 h-40', position: 'top-40 right-20', delay: 1 },
    { size: 'w-52 h-52', position: 'bottom-20 left-1/4', delay: 2 },
    { size: 'w-32 h-32', position: 'bottom-40 right-1/3', delay: 1.5 },
  ];

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden py-20 px-4">
      {/* Animated Background Shapes */}
      {floatingShapes.map((shape, index) => (
        <motion.div
          key={index}
          className={`absolute ${shape.size} ${shape.position} rounded-full bg-gradient-to-br from-brand-blue/10 to-blue-500/5 dark:from-brand-blue/5 dark:to-blue-500/10 blur-3xl`}
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 6,
            delay: shape.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-full border border-brand-blue/20 shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <Shield className="w-5 h-5 text-brand-blue" />
            <span className="text-sm font-semibold text-brand-blue dark:text-blue-400">
              AI-Powered Road Safety
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="gradient-text">SafeStride</span>
          </h1>

          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            {typedText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-1 h-10 md:h-14 ml-1 bg-brand-blue"
            />
          </h2>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Harnessing the power of machine learning to predict road accident severity
            and keep you safe on every journey. Make informed decisions with real-time
            risk assessment.
          </p>

          <motion.button
            className="btn-primary text-lg px-8 py-4 shadow-2xl"
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(30, 58, 138, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              document.getElementById('prediction-form')?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }}
          >
            <span className="flex items-center gap-2">
              Get Started
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </span>
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        {stats.length > 0 && (
          <motion.div
            ref={ref}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="card-glass p-6 text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ 
                  scale: 1.05, 
                  rotate: [0, -1, 1, 0],
                  transition: { duration: 0.3 }
                }}
              >
                <motion.div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} text-white mb-4 shadow-lg`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {stat.icon}
                </motion.div>
                
                <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  {inView && (
                    <CountUp
                      end={stat.value}
                      duration={2.5}
                      delay={0.5}
                      decimals={stat.suffix === '%' ? 2 : 0}
                      suffix={stat.suffix}
                    />
                  )}
                </div>
                
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* Loading state for stats */}
        {!modelMetrics && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="card-glass p-6 text-center animate-pulse"
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-700 mx-auto mb-4" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 w-24 mx-auto" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto" />
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-gray-900 pointer-events-none" />
    </div>
  );
};

export default HeroSection;
