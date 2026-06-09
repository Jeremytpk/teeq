import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Compass, Shield, Flame, ChevronRight, Zap } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Ton ID Teeq Unique",
      description: "Chaque utilisateur possède un ID jumeau secret (ex: TEEQ-772-KIN). Entre l'ID de quelqu'un que tu croises pour connecter instantanément vos profils comme des âmes sœurs numériques.",
      icon: <Zap className="w-8 h-8 text-lime-400" />,
      tagline: "LA RECONNAISSANCE TWIN DIRECTE",
      visual: (
        <svg viewBox="0 0 400 300" className="w-full h-56 md:h-64 drop-shadow-[0_0_15px_rgba(163,230,53,0.15)]">
          <defs>
            <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#a3e635" />
            </linearGradient>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a3e635" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Grid background */}
          <path d="M50 0 v300 M100 0 v300 M150 0 v300 M200 0 v300 M250 0 v300 M300 0 v300 M350 0 v300" stroke="#1e293b" strokeWidth="0.5" />
          <path d="M0 50 h400 M0 100 h400 M0 150 h400 M0 200 h400 M0 250 h400" stroke="#1e293b" strokeWidth="0.5" />
          
          {/* Glow center */}
          <circle cx="200" cy="150" r="100" fill="url(#glow)" />

          {/* Phone Left */}
          <g transform="translate(100, 70)">
            <rect width="70" height="140" rx="12" fill="#141620" stroke="#2e334a" strokeWidth="3" />
            <rect x="5" y="5" width="60" height="130" rx="8" fill="#090a0f" />
            {/* Screen content */}
            <rect x="15" y="20" width="40" height="10" rx="2" fill="#2e334a" />
            <text x="35" y="47" fill="#a3e635" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">TEEQ-772-KIN</text>
            <circle cx="35" cy="85" r="15" fill="#a3e635" fillOpacity="0.2" stroke="#a3e635" strokeWidth="1" />
            <text x="35" y="89" fill="#a3e635" fontSize="12" textAnchor="middle">🕺</text>
          </g>

          {/* Pulsing bridge */}
          <path d="M175 140 Q200 110 225 140" fill="none" stroke="url(#neonGrad)" strokeWidth="3" strokeDasharray="5,5" className="animate-pulse" />
          <polygon points="200,115 195,125 205,125" fill="#ec4899" />

          {/* Phone Right */}
          <g transform="translate(230, 70)">
            <rect width="70" height="140" rx="12" fill="#141620" stroke="#2e334a" strokeWidth="3" />
            <rect x="5" y="5" width="60" height="130" rx="8" fill="#090a0f" />
            {/* Screen content */}
            <rect x="15" y="20" width="40" height="10" rx="2" fill="#2e334a" />
            <text x="35" y="47" fill="#ec4899" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">TEEQ-319-KIN</text>
            <circle cx="35" cy="85" r="15" fill="#ec4899" fillOpacity="0.2" stroke="#ec4899" strokeWidth="1" />
            <text x="35" y="89" fill="#ec4899" fontSize="12" textAnchor="middle">🎨</text>
          </g>

          {/* Decorative icons */}
          <circle cx="330" cy="50" r="10" fill="#a3e635" fillOpacity="0.1" />
          <circle cx="70" cy="240" r="15" fill="#ec4899" fillOpacity="0.1" />
        </svg>
      )
    },
    {
      title: "Radar Ultra-Proximité",
      description: "Que tu sois à Bandal ou à la Gombe, à Himbi ou au Golf d'un simple toucher, active le radar pour détecter les téléphones actifs à moins de 50 mètres de toi et commence à vibrer.",
      icon: <Compass className="w-8 h-8 text-emerald-400 animate-spin-slow" />,
      tagline: "DÉTECTION DE PROXIMITÉ TEMPS RÉEL",
      visual: (
        <svg viewBox="0 0 400 300" className="w-full h-56 md:h-64 drop-shadow-[0_0_15px_rgba(34,197,94,0.15)]">
          <defs>
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#22c55e" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="300" fill="#090a0f" rx="16" />
          
          {/* Radar grids */}
          <circle cx="200" cy="150" r="120" stroke="#1e293b" fill="none" strokeWidth="1" />
          <circle cx="200" cy="150" r="80" stroke="#22c55e" strokeOpacity="0.2" fill="none" strokeWidth="1.5" />
          <circle cx="200" cy="150" r="40" stroke="#22c55e" strokeOpacity="0.4" fill="none" strokeWidth="1.5" />
          <circle cx="200" cy="150" r="10" fill="url(#radarGlow)" />
          
          {/* Center User */}
          <circle cx="200" cy="150" r="12" fill="#22c55e" />
          <text x="200" y="154" fontSize="11" textAnchor="middle">👑</text>

          {/* Sweeper lines with rotation animation simulation */}
          <line x1="200" y1="150" x2="300" y2="80" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" className="opacity-70" />
          <path d="M200 150 L300 80 A120 120 0 0 0 250 40 Z" fill="#22c55e" fillOpacity="0.15" />

          {/* Nearby targets with distance */}
          <g transform="translate(250, 70)" className="animate-bounce">
            <circle cx="0" cy="0" r="16" fill="#141620" stroke="#22c55e" strokeWidth="2" />
            <text x="0" y="4" fontSize="12" textAnchor="middle">🎨</text>
            <rect x="15" y="-10" width="45" height="14" rx="4" fill="#22c55e" />
            <text x="37" y="1" fill="#090a0f" fontSize="8" fontWeight="bold" textAnchor="middle">12 mètres</text>
          </g>

          <g transform="translate(100, 190)">
            <circle cx="0" cy="0" r="16" fill="#141620" stroke="#ec4899" strokeWidth="2" />
            <text x="0" y="4" fontSize="12" textAnchor="middle">🎶</text>
            <rect x="-60" y="-10" width="45" height="14" rx="4" fill="#ec4899" />
            <text x="-37" y="1" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">8 mètres</text>
          </g>

          <g transform="translate(300, 200)">
            <circle cx="0" cy="0" r="14" fill="#141620" stroke="#2e334a" strokeWidth="1" />
            <text x="0" y="4" fontSize="11" textAnchor="middle">🦁</text>
          </g>
        </svg>
      )
    },
    {
      title: "Glisse, Match & Vibe",
      description: "Trop timide pour parler en vrai ? Utilise le glissement intelligent de profils (Swipe) pour trouver des personnes de ta commune. S'il y a match, la discussion démarre instantanément dans une ambiance décontractée.",
      icon: <Flame className="w-8 h-8 text-pink-500 animate-pulse" />,
      tagline: "VIBES, DISCUSSIONS ET PLUS",
      visual: (
        <svg viewBox="0 0 400 300" className="w-full h-56 md:h-64 drop-shadow-[0_0_15px_rgba(236,72,153,0.15)]">
          <defs>
            <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="#090a0f" rx="16" />
          
          {/* Swiped Card background Left */}
          <g transform="translate(80, 160) rotate(-15)">
            <rect x="-45" y="-70" width="90" height="130" rx="10" fill="#141620" stroke="#334155" strokeWidth="2" />
            <text x="0" y="40" fill="#94a3b8" fontSize="24" textAnchor="middle" fontWeight="bold">✕</text>
          </g>

          {/* Swiped Card background Right - Highly active */}
          <g transform="translate(320, 160) rotate(15)">
            <rect x="-45" y="-70" width="90" height="130" rx="10" fill="#1e1824" stroke="#ec4899" strokeWidth="2" />
            <text x="0" y="40" fill="#ec4899" fontSize="24" textAnchor="middle" fontWeight="bold">♥</text>
          </g>

          {/* Core Matching Card */}
          <g transform="translate(200, 140)">
            <rect x="-65" y="-95" width="130" height="180" rx="14" fill="#1d1e2e" stroke="#a3e635" strokeWidth="3" />
            <rect x="-55" y="-85" width="110" height="95" rx="10" fill="#0c0d15" />
            
            {/* Avatar & Badges */}
            <circle cx="0" cy="-35" r="28" fill="#a3e635" fillOpacity="0.15" />
            <text x="0" y="-24" fontSize="32" textAnchor="middle">🕺</text>
            
            {/* Info text inside card */}
            <text x="0" y="28" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">Davy, 22</text>
            <text x="0" y="45" fill="#a3e635" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Bandalungwa • Kin</text>

            {/* Interest tag badge */}
            <rect x="-35" y="58" width="70" height="15" rx="8" fill="#312e81" />
            <text x="0" y="68" fill="#c084fc" fontSize="8" fontWeight="bold" textAnchor="middle">#Sapeur 👔</text>
          </g>

          {/* Match sparks icons */}
          <circle cx="100" cy="60" r="12" fill="#a3e635" fillOpacity="0.2" />
          <path d="M96 60 h8 M100 56 v8" stroke="#a3e635" strokeWidth="2" />
        </svg>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8 md:py-16 w-full relative overflow-hidden bg-dark-bg">
      {/* Absolute Neon glowing orbs */}
      <div className="absolute top-[-10%] right-[-20%] w-72 h-72 bg-gradient-to-br from-neon-pink to-transparent opacity-20 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-10%] left-[-20%] w-80 h-80 bg-gradient-to-tr from-neon-lime to-transparent opacity-15 blur-[120px] pointer-events-none rounded-full" />

      <div className="flex-1 w-full max-w-md flex flex-col justify-between items-center z-10">
        {/* Top Header - Teeq Title */}
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-neon-pink to-neon-lime flex items-center justify-center font-display font-extrabold text-black text-lg">t</span>
            <span className="font-display font-black text-2xl tracking-tighter text-white">teeq</span>
          </div>
          <button 
            onClick={onComplete}
            className="text-xs font-semibold text-gray-400 hover:text-white px-3 py-1.5 rounded-full bg-dark-card border border-dark-border cursor-pointer transition-colors"
          >
            Sauter
          </button>
        </div>

        {/* Main Slider Panel */}
        <div className="w-full my-auto flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="w-full flex flex-col items-center"
            >
              {/* Visual Vector Container */}
              <div className="w-full h-64 flex items-center justify-center p-2 rounded-2xl bg-dark-card border border-dark-border mb-6 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-transparent pointer-events-none" />
                {steps[currentStep].visual}
              </div>

              {/* Step Tagline */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-alt border border-dark-border mb-3">
                {steps[currentStep].icon}
                <span className="text-[10px] md:text-xs font-mono font-bold tracking-wider text-lime-400">
                  {steps[currentStep].tagline}
                </span>
              </div>

              {/* Step Title */}
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-center text-white mb-3 tracking-tight">
                {steps[currentStep].title}
              </h2>

              {/* Step Description */}
              <p className="text-sm text-gray-400 text-center leading-relaxed px-2">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Controls */}
        <div className="w-full flex flex-col items-center gap-6 mt-6">
          {/* Step Indicators */}
          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-8 bg-gradient-to-r from-neon-pink to-neon-lime' : 'w-2 bg-dark-border hover:bg-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={handleNext}
            className="w-full py-4 text-center cursor-pointer rounded-2xl font-display font-extrabold text-black bg-gradient-to-r from-neon-lime to-green-400 shadow-lg active:scale-95 hover:brightness-110 transition-all flex items-center justify-center gap-2 group"
          >
            {currentStep === steps.length - 1 ? (
              <>
                Créer mon Profil Teeq <Sparkles className="w-5 h-5 animate-pulse" />
              </>
            ) : (
              <>
                Suivant <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
