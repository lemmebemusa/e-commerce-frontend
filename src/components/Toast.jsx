import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Toast({ message, type = 'default', onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 400);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgClass = type === 'success' ? 'bg-black text-white' :
    type === 'error' ? 'bg-red-600 text-white' :
    type === 'warning' ? 'bg-yellow-500 text-black' :
    'bg-gray-900 text-white';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`px-4 py-2.5 rounded-2xl text-sm font-medium shadow-lg flex items-center gap-2 ${bgClass}`}
        >
          <span className="whitespace-nowrap">{message}</span>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose?.(), 400);
            }}
            className="ml-1 hover:opacity-70 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}