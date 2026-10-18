import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, X, UtensilsCrossed, Building2, ShieldCheck, HeartHandshake, Sparkles } from 'lucide-react';
import { AppPortal } from '../types';

interface OnboardingTourProps {
  onComplete: () => void;
  onNavigatePortal: (portal: AppPortal) => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  onComplete,
  onNavigatePortal,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to NourishLoop',
      subtitle: 'From Food Waste to Food Access',
      badge: 'Step 1 of 5',
      icon: Sparkles,
      description:
        'A unified platform connecting households, grocery stores, and food banks to rescue food before it reaches landfills.',
      highlightText: 'Your workspace dynamically adapts to your role—household cook, store manager, food bank coordinator, or admin.',
      portalTarget: 'fridge-to-plate' as AppPortal,
    },
    {
      title: 'Scan Your Fridge or Receipt',
      subtitle: 'Multimodal Vision Recognition',
      badge: 'Step 2 of 5',
      icon: UtensilsCrossed,
      description:
        'Capture a photo of your fridge or store receipt. Ingredients, package seals, and storage conditions are identified with confidence indicators.',
      highlightText: 'You can test the flow instantly using pre-configured photo and receipt samples.',
      portalTarget: 'fridge-to-plate' as AppPortal,
    },
    {
      title: 'Action Board Guidance',
      subtitle: 'A single verdict for every item',
      badge: 'Step 3 of 5',
      icon: ShieldCheck,
      description:
        'Instead of disorganized lists, every item has one clear recommendation: cook today, freeze for later, or pass forward as a safe donation.',
      highlightText: 'Shelf-life guidance is grounded in USDA FoodKeeper research and always labeled as estimated dates.',
      portalTarget: 'fridge-to-plate' as AppPortal,
    },
    {
      title: 'Surplus Rescue Coordination',
      subtitle: 'Commercial Grocery Forecasting',
      badge: 'Step 4 of 5',
      icon: Building2,
      description:
        'Store managers forecast surplus 24–48 hours ahead and dispatch lots directly to accredited food banks.',
      highlightText: 'Safety gating ensures perishable lots are only matched with food banks possessing verified cold storage.',
      portalTarget: 'donor-portal' as AppPortal,
    },
    {
      title: 'Allergy Safeguards & AI Assistant',
      subtitle: 'Deterministic Protection',
      badge: 'Step 5 of 5',
      icon: HeartHandshake,
      description:
        'Every recipe is strictly verified against your declared dietary restrictions. The AI Guide is available anytime at the bottom right.',
      highlightText: 'You are ready to explore. Start in the Kitchen or browse live community impact.',
      portalTarget: 'impact-dashboard' as AppPortal,
    },
  ];

  const step = steps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onNavigatePortal(steps[nextStep].portalTarget);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onNavigatePortal(steps[prevStep].portalTarget);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] rounded-[28px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] max-w-lg w-full overflow-hidden p-6 sm:p-8 space-y-6 relative">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#6E6E73] dark:text-[#86868B]">
            {step.badge}
          </span>

          <button
            onClick={onComplete}
            className="flex items-center gap-1 text-[12px] text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors cursor-pointer"
          >
            <span>Skip tour</span>
            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#1F7A4D]/10 text-[#1F7A4D] dark:bg-[#34C77B]/15 dark:text-[#34C77B] flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-[20px] sm:text-[22px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight">
                {step.title}
              </h3>
              <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">
                {step.subtitle}
              </p>
            </div>
          </div>

          <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
            {step.description}
          </p>

          <div className="p-3.5 rounded-[18px] bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] text-[12px] text-[#1D1D1F] dark:text-[#F5F5F7]">
            {step.highlightText}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-black/[0.06] dark:border-white/[0.08]">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentStep(i);
                  onNavigatePortal(steps[i].portalTarget);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentStep === i
                    ? 'w-6 bg-[#1F7A4D] dark:bg-[#34C77B]'
                    : 'w-1.5 bg-black/[0.12] dark:bg-white/[0.16]'
                }`}
                title={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 text-[13px] text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#86868B] dark:hover:text-[#F5F5F7] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-full bg-[#1F7A4D] hover:bg-[#18633e] text-white font-medium text-[13px] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
