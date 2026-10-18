import React, { useState, useEffect, useRef } from 'react';
import { FoodItem, AllergyProfile, Recipe } from '../../types';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  ChefHat,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  ChevronRight,
  ChevronLeft,
  Check,
  Send,
  MessageCircle,
} from 'lucide-react';
import { useRegion } from '../../context/RegionContext';
import { sounds } from '../../utils/audioEffects';

export interface CookingAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: FoodItem[];
  allergyProfile: AllergyProfile;
  activeRecipe?: Recipe | null;
  onFinishCooking?: (recipe: Recipe) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  timerMinutes?: number | null;
}

export const CookingAssistantModal: React.FC<CookingAssistantModalProps> = ({
  isOpen,
  onClose,
  inventory,
  allergyProfile,
  activeRecipe,
  onFinishCooking,
}) => {
  const { region, config } = useRegion();

  // Step state for active recipe
  const steps = activeRecipe?.instructions || [
    'Prepare your ingredients and rinse any fresh produce thoroughly.',
    'Warm your skillet or pot over medium heat with a splash of oil.',
    'Cook proteins or hearty vegetables until tender and aromatic.',
    'Fold in delicate leafy greens, season carefully to taste, and serve hot.',
  ];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Chat & Assistant state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: activeRecipe
        ? `Hands-free guidance ready for "${activeRecipe.title}". Ask about substitutions, heat levels, or say "start an 8-minute timer".`
        : `Hands-free Sous Chef active with ${inventory.length} ingredients in your kitchen. Ask anything or set a timer.`,
      timestamp: 'Just now',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [showAssistantDrawer, setShowAssistantDrawer] = useState(false);

  // Big Timer State (Apple Fitness / Timer style)
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number | null>(null);
  const [timerInitialSeconds, setTimerInitialSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerLabel, setTimerLabel] = useState('Step Timer');

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuestion(transcript);
          handleAskQuestion(transcript);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    } catch {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && activeTimerSeconds !== null && activeTimerSeconds > 0) {
      interval = setInterval(() => {
        setActiveTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (activeTimerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      sounds.playTimerDing();
      speakText('Timer complete! Check your food on the stove.');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, activeTimerSeconds]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  const speakText = (text: string) => {
    if (!autoSpeak || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const handleAskQuestion = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || isThinking) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/cooking-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          currentRecipe: activeRecipe,
          inventory: inventory.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            storage: i.storage,
            expirationDate: i.expirationDate,
          })),
          allergyProfile,
          region,
        }),
      });

      const data = await res.json();
      const assistantText = data.reply || "Stir gently and maintain medium heat.";
      const spoken = data.spokenText || assistantText;

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: assistantText,
        timestamp: 'Just now',
        timerMinutes: data.timerMinutes,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (data.timerMinutes) {
        const secs = Math.round(data.timerMinutes * 60);
        setTimerInitialSeconds(secs);
        setActiveTimerSeconds(secs);
        setIsTimerRunning(true);
        if (data.timerLabel) setTimerLabel(data.timerLabel);
      }

      speakText(spoken);
    } catch {
      const fallbackMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Keep food covered on low heat. Add a splash of broth or water if sauce is reducing too fast.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakText('Keep food covered on low heat and adjust seasoning carefully.');
    } finally {
      setIsThinking(false);
    }
  };

  if (!isOpen) return null;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCustomTimer = (minutes: number, label: string = 'Step Timer') => {
    const secs = minutes * 60;
    setTimerInitialSeconds(secs);
    setActiveTimerSeconds(secs);
    setTimerLabel(label);
    setIsTimerRunning(true);
  };

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#000000]/90 backdrop-blur-2xl text-white flex flex-col justify-between overflow-hidden animate-in fade-in duration-300"
    >
      {/* 1. Top Bar: Title, Step Counter & Controls */}
      <div className="max-w-5xl mx-auto w-full px-6 py-5 flex items-center justify-between border-b border-white/[0.08] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/[0.10] flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-[#34C77B]" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[12px] font-medium text-[#86868B] uppercase tracking-wider">
              {activeRecipe ? activeRecipe.title : 'Cooking Assistant'}
            </div>
            <div className="text-[15px] font-semibold text-white tracking-tight">
              Step {currentStepIndex + 1} of {steps.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute Voice Toggle */}
          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              setAutoSpeak(!autoSpeak);
            }}
            className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-[#86868B] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title={autoSpeak ? 'Mute voice feedback' : 'Enable voice feedback'}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4 text-[#34C77B]" strokeWidth={1.5} /> : <VolumeX className="w-4 h-4" strokeWidth={1.5} />}
          </button>

          {/* Toggle Voice / Chat Assistant Drawer */}
          <button
            onClick={() => setShowAssistantDrawer(!showAssistantDrawer)}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#34C77B]" strokeWidth={1.5} />
            <span>Sous Chef</span>
          </button>

          {/* Close */}
          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
            aria-label="Close Assistant"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* 2. Thin Step Progress Bar */}
      <div className="w-full bg-white/[0.06] h-[2px]">
        <div
          className="h-full bg-[#34C77B] transition-all duration-300"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* 3. Main Stage: Large-Type Step & Big Apple Timer */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 flex flex-col justify-center items-center text-center overflow-y-auto">
        <div className="space-y-6 max-w-2xl">
          {/* Step Number Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] text-[13px] font-medium text-[#86868B]">
            <span>Direction {currentStepIndex + 1}</span>
          </div>

          {/* Large Typography Step Headline */}
          <h2 className="text-[28px] sm:text-[38px] md:text-[44px] font-semibold text-white tracking-tight leading-[1.18] transition-all duration-200">
            {currentStep}
          </h2>

          {/* Next Step Preview */}
          {!isLastStep && steps[currentStepIndex + 1] && (
            <p className="text-[15px] text-[#86868B] max-w-lg mx-auto">
              Up next: {steps[currentStepIndex + 1]}
            </p>
          )}

          {/* Big Timer (Apple Fitness / Timer style) */}
          <div className="pt-6">
            {activeTimerSeconds !== null ? (
              <div className="inline-flex flex-col items-center p-6 rounded-[28px] bg-white/[0.06] border border-white/[0.10] shadow-2xl">
                <div className="text-[12px] font-semibold tracking-wider text-[#86868B] uppercase mb-1">
                  {timerLabel}
                </div>
                <div className="font-mono text-[56px] sm:text-[68px] font-bold tracking-tight text-white leading-none my-2 select-none">
                  {formatTimer(activeTimerSeconds)}
                </div>

                {/* Big Timer Controls */}
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="apple-pill-btn px-6 py-2.5 rounded-full bg-[#34C77B] hover:bg-[#2EB36E] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTimerSeconds((prev) => (prev ? prev + 60 : 60));
                    }}
                    className="apple-pill-btn px-4 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white text-[13px] font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>1 min</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTimerSeconds(timerInitialSeconds);
                      setIsTimerRunning(false);
                    }}
                    className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-[#86868B] hover:text-white flex items-center justify-center cursor-pointer"
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTimerSeconds(null);
                      setIsTimerRunning(false);
                    }}
                    className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-[#86868B] hover:text-white flex items-center justify-center cursor-pointer"
                    title="Dismiss timer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2 text-[12px]">
                <span className="text-[#86868B]">Quick Timers:</span>
                {[
                  { label: '3 min', mins: 3 },
                  { label: '5 min', mins: 5 },
                  { label: '8 min', mins: 8 },
                  { label: '12 min', mins: 12 },
                ].map((t) => (
                  <button
                    key={t.mins}
                    onClick={() => startCustomTimer(t.mins, `${t.label} Timer`)}
                    className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white text-[12px] font-medium transition-colors cursor-pointer"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom Controls: Step Navigation & Finish */}
      <div className="max-w-5xl mx-auto w-full px-6 py-6 border-t border-white/[0.08] flex items-center justify-between shrink-0">
        <button
          onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentStepIndex === 0}
          className="apple-pill-btn px-5 py-3 rounded-full bg-white/[0.08] hover:bg-white/[0.14] disabled:opacity-20 text-white text-[13px] font-medium flex items-center gap-1.5 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Mic Hands-Free Button */}
        {speechSupported && (
          <button
            onClick={toggleListening}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500 text-white ring-4 ring-red-400/40 animate-pulse'
                : 'bg-white/[0.10] hover:bg-white/[0.16] text-[#34C77B]'
            } cursor-pointer`}
            title={isListening ? 'Listening hands-free...' : 'Ask question with voice'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" strokeWidth={1.5} />}
          </button>
        )}

        {isLastStep ? (
          <button
            onClick={() => {
              if (activeRecipe) onFinishCooking?.(activeRecipe);
              onClose();
            }}
            className="apple-pill-btn px-7 py-3 rounded-full bg-[#34C77B] hover:bg-[#2EB36E] text-white text-[14px] font-semibold flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Check className="w-4 h-4" strokeWidth={2} />
            <span>Finish Cooking</span>
          </button>
        ) : (
          <button
            onClick={() => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
            className="apple-pill-btn px-7 py-3 rounded-full bg-[#34C77B] hover:bg-[#2EB36E] text-white text-[14px] font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* 5. Sous Chef Slide-Out Assistant Drawer */}
      {showAssistantDrawer && (
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[400px] bg-[#161618] border-l border-white/[0.10] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-[#34C77B]" />
              <span className="font-semibold text-white text-[14px]">Sous Chef Assistant</span>
            </div>
            <button
              onClick={() => setShowAssistantDrawer(false)}
              className="text-[#86868B] hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-[13px]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-3 rounded-2xl ${
                  m.sender === 'user'
                    ? 'bg-[#34C77B] text-white ml-6'
                    : 'bg-white/[0.06] text-white/90 mr-6'
                }`}
              >
                {m.text}
              </div>
            ))}
            {isThinking && (
              <div className="text-[12px] text-[#86868B] p-2 animate-pulse">
                Sous Chef is reasoning...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-white/[0.08]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion(inputQuestion);
              }}
              className="flex items-center gap-2 bg-white/[0.06] rounded-full px-3 py-1.5"
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Ask about substitutions..."
                className="flex-1 bg-transparent text-white text-[13px] placeholder-[#86868B] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputQuestion.trim() || isThinking}
                className="w-7 h-7 rounded-full bg-[#34C77B] text-white flex items-center justify-center disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
