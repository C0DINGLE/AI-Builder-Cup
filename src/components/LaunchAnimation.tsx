import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X } from 'lucide-react';
import { AppPortal } from '../types';

interface LaunchAnimationProps {
  onComplete: (targetPortal?: AppPortal) => void;
}

export const LaunchAnimation: React.FC<LaunchAnimationProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FBFBFD] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] overflow-hidden select-none">
      {/* Top right skip action */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => onComplete()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-all cursor-pointer"
        >
          <span>Skip</span>
          <X className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6 py-12 mx-auto text-center">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              {/* Thin animated loop line */}
              <div className="flex justify-center">
                <svg className="w-20 h-20" viewBox="0 0 80 80" fill="none">
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="#1F7A4D"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, rotate: -90 }}
                    animate={{ pathLength: 1, rotate: 270 }}
                    transition={{ duration: 1.8, ease: 'easeInOut' }}
                    className="dark:stroke-[#34C77B]"
                  />
                  <motion.path
                    d="M 32 40 L 38 46 L 50 34"
                    stroke="#1F7A4D"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="dark:stroke-[#34C77B]"
                  />
                </svg>
              </div>

              <div className="space-y-3">
                <h1 className="text-[40px] sm:text-[60px] font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight">
                  Food worth saving.
                </h1>
                <p className="max-w-md mx-auto text-[#6E6E73] dark:text-[#86868B] text-[15px] sm:text-[17px] leading-relaxed">
                  Closing the loop between store surplus, home pantries, and communities who need it.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-full bg-[#1F7A4D] hover:bg-[#18633e] text-white font-medium text-[14px] shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2"
                >
                  <span>Explore NourishLoop</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="portals"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-[32px] sm:text-[42px] font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Where would you like to start?
                </h2>
                <p className="text-[14px] text-[#6E6E73] dark:text-[#86868B]">
                  Switch portals anytime from the top bar.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div
                  onClick={() => onComplete('fridge-to-plate')}
                  className="p-6 rounded-[24px] bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.14] dark:hover:border-white/[0.2] shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all cursor-pointer group"
                >
                  <div className="text-[12px] font-medium text-[#1F7A4D] dark:text-[#34C77B]">
                    Kitchen
                  </div>
                  <h3 className="text-[19px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-1">
                    Fridge to Plate
                  </h3>
                  <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] mt-2 leading-relaxed">
                    Scan items, track expiration, cook with AI, and pass forward sealed pantry items.
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-[#1F7A4D] dark:text-[#34C77B] group-hover:underline">
                    <span>Open Kitchen</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </div>
                </div>

                <div
                  onClick={() => onComplete('donor-portal')}
                  className="p-6 rounded-[24px] bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.14] dark:hover:border-white/[0.2] shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all cursor-pointer group"
                >
                  <div className="text-[12px] font-medium text-[#1F7A4D] dark:text-[#34C77B]">
                    Commercial
                  </div>
                  <h3 className="text-[19px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-1">
                    Surplus Rescue
                  </h3>
                  <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] mt-2 leading-relaxed">
                    Forecast grocery surplus, match with certified food banks, and track cold chains.
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-[#1F7A4D] dark:text-[#34C77B] group-hover:underline">
                    <span>Open Store Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onComplete('impact-dashboard')}
                  className="text-[13px] text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors cursor-pointer"
                >
                  View Live Community Impact →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
