import React from 'react';
import { AllergyProfile } from '../types';
import { COMMON_ALLERGENS_MAP, DIETARY_RESTRICTIONS_MAP } from '../utils/allergyFilter';
import { Sheet } from './common/Primitives';
import { ShieldCheck, Check } from 'lucide-react';

interface AllergySettingsModalProps {
  profile: AllergyProfile;
  onSaveProfile: (profile: AllergyProfile) => void;
  onClose: () => void;
}

export const AllergySettingsModal: React.FC<AllergySettingsModalProps> = ({
  profile,
  onSaveProfile,
  onClose,
}) => {
  const [allergies, setAllergies] = React.useState<string[]>(profile.allergies);
  const [dietary, setDietary] = React.useState<string[]>(profile.dietaryPreferences);

  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const toggleDiet = (diet: string) => {
    setDietary((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    );
  };

  const handleSave = () => {
    onSaveProfile({
      allergies,
      dietaryPreferences: dietary,
    });
    onClose();
  };

  return (
    <Sheet
      isOpen={true}
      onClose={onClose}
      title="Allergies &amp; Dietary Shield"
      description="Deterministic filters run after recipe generation to ensure safety."
      maxWidth="md"
    >
      <div className="space-y-5 text-[13px]">
        {/* Calm Explanation Callout */}
        <div className="p-4 rounded-[20px] bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
          <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1.5 text-[13px]">
            <ShieldCheck className="w-4 h-4 text-[#1F7A4D] dark:text-[#34C77B]" strokeWidth={1.5} />
            <span>Deterministic Safety Firewall</span>
          </div>
          <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
            Every suggested recipe is checked against your exclusions. If a recipe contains any forbidden allergen, it is automatically removed before you see it.
          </p>
        </div>

        {/* Exclude Allergens */}
        <div className="space-y-2">
          <label className="text-[12px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block">
            Exclude Allergens
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.keys(COMMON_ALLERGENS_MAP).map((allergy) => {
              const isSelected = allergies.includes(allergy);
              return (
                <button
                  key={allergy}
                  type="button"
                  onClick={() => toggleAllergy(allergy)}
                  className={`p-3 rounded-[16px] border text-left text-[12px] font-medium transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#1F7A4D]/[0.08] dark:bg-[#34C77B]/[0.1] border-[#1F7A4D] dark:border-[#34C77B] text-[#1D1D1F] dark:text-[#F5F5F7]'
                      : 'bg-white dark:bg-[#1C1C1E] border-black/[0.06] dark:border-white/[0.08] text-[#6E6E73] dark:text-[#86868B] hover:border-black/[0.12]'
                  }`}
                >
                  <span>{allergy}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1F7A4D] dark:text-[#34C77B]" strokeWidth={2} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="space-y-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
          <label className="text-[12px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block">
            Dietary Preferences
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.keys(DIETARY_RESTRICTIONS_MAP).map((diet) => {
              const isSelected = dietary.includes(diet);
              return (
                <button
                  key={diet}
                  type="button"
                  onClick={() => toggleDiet(diet)}
                  className={`p-3 rounded-[16px] border text-center text-[12px] font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1F7A4D]/[0.08] dark:bg-[#34C77B]/[0.1] border-[#1F7A4D] dark:border-[#34C77B] text-[#1D1D1F] dark:text-[#F5F5F7]'
                      : 'bg-white dark:bg-[#1C1C1E] border-black/[0.06] dark:border-white/[0.08] text-[#6E6E73] dark:text-[#86868B] hover:border-black/[0.12]'
                  }`}
                >
                  {diet}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
          <span className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
            {allergies.length + dietary.length > 0
              ? `${allergies.length + dietary.length} active filters`
              : 'No active restrictions'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[13px] text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#86868B] dark:hover:text-[#F5F5F7]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-full bg-[#1F7A4D] hover:bg-[#18633e] text-white font-medium text-[13px] shadow-sm cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </Sheet>
  );
};
