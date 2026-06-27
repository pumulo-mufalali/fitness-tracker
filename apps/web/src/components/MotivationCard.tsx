import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const quotes = [
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "It's not about being the best. It's about being better than you were yesterday.", author: "Unknown" },
  { text: "Your body can stand almost anything. It's your mind that you have to convince.", author: "Unknown" },
  { text: "The hard days are the best because that's when champions are made.", author: "Gabrielle Reece" },
  { text: "Don't wish for it. Work for it.", author: "Unknown" },
  { text: "Push yourself because no one else is going to do it for you.", author: "Unknown" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
  { text: "Motivation gets you started. Habit keeps you going.", author: "Jim Ryun" },
  { text: "Strength does not come from physical capacity. It comes from an indomitable will.", author: "Mahatma Gandhi" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "The difference between try and triumph is just a little umph!", author: "Unknown" },
  { text: "If you want something you've never had, you must be willing to do something you've never done.", author: "Unknown" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "Do something today that your future self will thank you for.", author: "Unknown" },
  { text: "Excellence is not a skill, it's an attitude.", author: "Ralph Marston" },
  { text: "The only person you should try to be better than is the person you were yesterday.", author: "Unknown" },
];

export function MotivationCard() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    if (!quotes || quotes.length === 0) return;

    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => {
        let newIndex;
        let attempts = 0;
        do {
          newIndex = Math.floor(Math.random() * quotes.length);
          attempts++;
          if (attempts > 100) break;
        } while (newIndex === prevIndex && quotes.length > 1);
        if (newIndex < 0 || newIndex >= quotes.length) return 0;
        return newIndex;
      });
    }, 8000);

    const initialIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuoteIndex(initialIndex >= 0 && initialIndex < quotes.length ? initialIndex : 0);

    return () => clearInterval(interval);
  }, []);

  const quote = quotes[currentQuoteIndex] || quotes[0] || { text: "Stay strong and keep pushing!", author: "Unknown" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md p-4 sm:p-6 lg:p-8 relative overflow-hidden"
    >
      <svg
        className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuoteIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          <blockquote className="text-base font-medium text-gray-900 dark:text-white min-h-[3rem]">
            &ldquo;{quote.text}&rdquo;
          </blockquote>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            &mdash; {quote.author}
          </p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
