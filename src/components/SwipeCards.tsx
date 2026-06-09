import React, { useState, useEffect } from "react";
import { User, Match } from "../types";
import { NEARBY_MOCK_USERS } from "../data";
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from "motion/react";
import { Heart, X, MapPin, Sparkles, RefreshCcw, Check, Flame } from "lucide-react";

interface SwipeCardsProps {
  currentUser: User;
  onInstantMatch: (matchedUser: User) => void;
  matches: Match[];
  realOnlineUsers?: User[];
}

export default function SwipeCards({ currentUser, onInstantMatch, matches, realOnlineUsers = [] }: SwipeCardsProps) {
  const [deck, setDeck] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Match overlay popup state
  const [matchCelebration, setMatchCelebration] = useState<User | null>(null);

  // Re-generate list on load merging real devices first
  useEffect(() => {
    const realUsersMapped = realOnlineUsers
      .filter(u => u.id !== currentUser.id)
      .map(u => ({ ...u, isSimulated: false }));

    const mockFiltered = NEARBY_MOCK_USERS
      .filter(u => u.id !== currentUser.id && !realUsersMapped.some(ru => ru.id === u.id))
      .map(u => ({ ...u, isSimulated: true }));

    setDeck([...realUsersMapped, ...mockFiltered]);
    setCurrentIndex(0);
  }, [currentUser, realOnlineUsers]);

  const activeUser = deck[currentIndex];

  // Motion physics parameters for swipe drag
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  const vibeOpacity = useTransform(x, [0, 80], [0, 1]);
  const zapOpacity = useTransform(x, [-80, 0], [1, 0]);
  const controls = useAnimation();

  // Color banners according to user styles
  const getBannerGradient = (user: User) => {
    switch(user.personalityType) {
      case 'davy': return 'from-[#fda4af] to-[#f43f5e]'; // Rose/Sunset
      case 'naomi': return 'from-[#67e8f9] to-[#06b6d4]'; // Cyan/Aero
      case 'esther': return 'from-[#fde047] to-[#e11d48]'; // Yellow volcanic sunset
      case 'christian': return 'from-[#86efac] to-[#15803d]'; // TP Mazembe Green
      case 'glody': return 'from-[#c084fc] to-[#6d28d9]'; // Tech violet
      default: return 'from-[#f472b6] to-[#db2777]'; // Neon hot pink
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (currentIndex >= deck.length) return;

    if (direction === 'right') {
      // Simulate beautiful vibration and Match Celebration modal!
      const currentSwipedPeer = deck[currentIndex];
      // Check if already matched in parent list
      const alreadyMatched = matches.some(m => m.user.id === currentSwipedPeer.id);
      
      if (!alreadyMatched) {
        setMatchCelebration(currentSwipedPeer);
      }
    }

    // Play swipe exit animation
    await controls.start({
      x: direction === 'left' ? -350 : 350,
      opacity: 0,
      transition: { duration: 0.3 }
    });

    // Reset coordinates and move to next
    x.set(0);
    setCurrentIndex(prev => prev + 1);
  };

  const handleDragEnd = (event: any, info: any) => {
    const swipeOffset = info.offset.x;
    if (swipeOffset > 100) {
      handleSwipe('right');
    } else if (swipeOffset < -100) {
      handleSwipe('left');
    } else {
      controls.start({ x: 0, opacity: 1, transition: { type: "spring", stiffness: 150, damping: 15 } });
    }
  };

  const triggerReset = () => {
    setCurrentIndex(0);
  };

  const handleMatchConfirm = () => {
    if (matchCelebration) {
      onInstantMatch(matchCelebration);
      setMatchCelebration(null);
    }
  };

  return (
    <div className="flex flex-col h-full w-full justify-between px-3 pb-2 pt-1 relative overflow-hidden">
      
      {/* Dynamic Match Celebration Modal */}
      <AnimatePresence>
        {matchCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 text-center select-none"
          >
            {/* Ambient colorful backdrop */}
            <div className="absolute w-72 h-72 bg-neon-pink/20 blur-[100px] rounded-full" />
            
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neon-pink/10 border border-neon-pink/40 mb-3 animate-pulse">
              <Flame className="w-4 h-4 text-neon-pink fill-neon-pink" />
              <span className="text-[10px] font-mono font-black text-neon-pink uppercase tracking-widest">
                LA VIBE EST PARFAITE !
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-display font-black text-white leading-none mb-1 text-center">
              C'est un Match !
            </h2>
            <p className="text-xs text-lime-400 font-mono font-bold tracking-tight mb-8">
              SYNCHRONISATION TEEQ 100% OPÉRATIONNELLE
            </p>

            {/* Combined Avatar Bubbles */}
            <div className="flex items-center justify-center gap-6 mb-10 relative">
              {/* User Avatar Bubble */}
              <div className="flex flex-col items-center transform -rotate-6">
                <div className="w-24 h-24 bg-dark-card border-4 border-neon-lime rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(163,230,53,0.35)]">
                  <span className="text-5xl">{currentUser.avatar}</span>
                </div>
                <h4 className="text-xs font-bold text-gray-300 mt-2.5">{currentUser.username} (Toi)</h4>
                <p className="text-[10px] font-mono text-gray-500">{currentUser.id}</p>
              </div>

              {/* Pulsing Interlocking Love Heart */}
              <div className="w-12 h-12 rounded-full bg-neon-pink flex items-center justify-center animate-ping absolute" />
              <div className="w-12 h-12 rounded-full bg-neon-pink/80 flex items-center justify-center relative z-10 shadow-lg shadow-pink-500/30">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>

              {/* Matched Avatar Bubble */}
              <div className="flex flex-col items-center transform rotate-6">
                <div className="w-24 h-24 bg-dark-card border-4 border-neon-pink rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(236,72,153,0.35)]">
                  <span className="text-5xl">{matchCelebration.avatar}</span>
                </div>
                <h4 className="text-xs font-bold text-gray-300 mt-2.5">{matchCelebration.username}</h4>
                <p className="text-[10px] font-mono text-gray-500">{matchCelebration.id}</p>
              </div>
            </div>

            {/* Interactive short message preview */}
            <div className="bg-dark-card/90 border border-dark-border p-4.5 rounded-2.5xl max-w-sm mb-8 relative select-none">
              <span className="absolute -top-2.5 right-4 bg-lime-400 text-black text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">COMMUNE DE {matchCelebration.commune.toUpperCase()}</span>
              <p className="text-xs text-gray-400 mt-0.5 italic leading-relaxed font-semibold">
                "{matchCelebration.bio}"
              </p>
            </div>

            {/* Match CTA buttons */}
            <div className="flex flex-col gap-3 w-full max-w-sm z-10">
              <button
                onClick={handleMatchConfirm}
                className="bg-neon-lime text-black font-display font-extrabold text-sm py-4 rounded-xl cursor-pointer shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 hover:brightness-110"
              >
                Envoyer un premier message <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMatchCelebration(null)}
                className="text-xs text-gray-400 hover:text-white py-2 cursor-pointer font-bold transition-colors"
              >
                Continuer à swiper pour plus de connexions
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Swipe Deck Layout */}
      <div className="flex-1 flex flex-col items-center justify-center relative mt-4">
        {currentIndex < deck.length ? (
          /* Swiper Frame Wrapper */
          <div className="w-full max-w-sm aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] relative flex items-center justify-center">
            
            {/* Underlying backdrop stack card if exist */}
            {currentIndex + 1 < deck.length && (
              <div 
                className="absolute w-[92%] h-[95%] bg-dark-card border border-dark-border/60 rounded-3xl -bottom-2 opacity-60 pointer-events-none scale-95 transition-all"
                style={{ zIndex: 5 }}
              >
                <div className="w-full h-20 bg-gray-800/10 rounded-t-3xl" />
              </div>
            )}
            
            {/* Active Swipe Card Frame */}
            <motion.div
              style={{ x, rotate, opacity, zIndex: 10 }}
              drag="x"
              dragConstraints={{ left: -100, right: 100 }}
              onDragEnd={handleDragEnd}
              animate={controls}
              className="absolute w-full h-full bg-dark-card border border-dark-border rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between cursor-grab active:cursor-grabbing select-none"
            >
              {/* Profile Photo & Dynamic Theme Banner Area */}
              <div className="h-52 sm:h-64 bg-dark-alt relative flex items-center justify-center overflow-hidden transition-all border-b border-dark-border/40">
                {activeUser.photoUrl ? (
                  <img 
                    src={activeUser.photoUrl} 
                    alt={activeUser.username}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${getBannerGradient(activeUser)}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                
                {/* Small, stylish circular emoji badge overlay at the bottom right */}
                <div className="absolute bottom-3 right-3.5 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-dark-card/90 backdrop-blur-md border-2 border-brand-orange shadow-lg flex items-center justify-center text-xl sm:text-2xl relative z-25 hover:rotate-12 transition-transform">
                  <span className="leading-none">{activeUser.avatar}</span>
                </div>

                {/* Left/Right Floating guides during drag */}
                <motion.div 
                  style={{ opacity: vibeOpacity }}
                  className="absolute right-4 top-4 bg-green-500 text-black text-[10px] sm:text-xs font-mono font-black px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-green-300 pointer-events-none shadow-md"
                >
                  VIBE ♥
                </motion.div>
                <motion.div 
                  style={{ opacity: zapOpacity }}
                  className="absolute left-4 top-4 bg-rose-500 text-white text-[10px] sm:text-xs font-mono font-black px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-rose-400 pointer-events-none shadow-md"
                >
                  ZAPPER ✕
                </motion.div>
              </div>

              {/* Profile Bio Details Body */}
              <div className="flex-1 pt-4 sm:pt-5 p-4 sm:p-5 text-left flex flex-col justify-between relative overflow-hidden">
                <div>
                  {/* Title & Age */}
                  <div className="flex items-baseline gap-1.5">
                    <h3 className="text-lg sm:text-xl font-display font-black text-white">{activeUser.username}</h3>
                    <span className="text-xs sm:text-sm font-bold text-gray-400">{activeUser.age} ans</span>
                  </div>

                  {/* Congolese location tags */}
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs text-neon-lime mt-0.5 sm:mt-1 font-mono font-bold">
                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{activeUser.commune} • {activeUser.quartier} ({activeUser.city})</span>
                  </div>

                  {/* Vibe Unique ID indicator */}
                  <p className="text-[9px] sm:text-[10px] font-mono font-extrabold text-neon-pink bg-neon-pink/5 border border-neon-pink/20 px-2 py-0.5 rounded-md inline-block mt-1.5">
                    ID : {activeUser.id}
                  </p>

                  {/* Description biography */}
                  <p className="text-[11px] sm:text-xs text-gray-300 mt-2.5 leading-relaxed font-medium line-clamp-2 sm:line-clamp-none">
                    "{activeUser.bio}"
                  </p>
                </div>

                {/* Vibe Hashtags List */}
                <div className="mt-2.5 sm:mt-4">
                  <span className="text-[9px] sm:text-[10px] uppercase font-mono font-bold text-gray-500 block mb-1">Centres d'intérêt / Vibes</span>
                  <div className="flex flex-wrap gap-1">
                    {activeUser.vibes.slice(0, 3).map((v) => (
                      <span
                        key={v}
                        className="text-[9px] sm:text-[10px] font-bold text-neon-pink bg-neon-pink/10 border border-neon-pink/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm"
                      >
                        #{v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          /* Empty Deck fallback */
          <div className="p-8 text-center bg-dark-card border border-dashed border-dark-border rounded-3xl max-w-sm w-full py-16">
            <Sparkles className="w-12 h-12 text-neon-lime mx-auto mb-4 animate-pulse" />
            <h4 className="text-lg font-display font-black text-white">Fin de la Pile !</h4>
            <p className="text-xs text-gray-400 mt-2 max-w-[240px] mx-auto leading-relaxed">
              Tu as glissé sur tous les profils à proximité réactive dans ta zone géographique en République Démocratique du Congo.
            </p>
            <button
              onClick={triggerReset}
              className="mt-6 bg-dark-alt border border-dark-border hover:text-white px-5 py-2.5 rounded-xl text-xs text-gray-300 cursor-pointer flex items-center gap-1.5 mx-auto active:scale-95 transition-all"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Réinitialiser la Pile
            </button>
          </div>
        )}
      </div>

      {/* Manual Swiper controllers */}
      {currentIndex < deck.length && (
        <div className="flex items-center justify-center gap-6 mt-6 select-none">
          {/* Dislike button */}
          <button
            onClick={() => handleSwipe('left')}
            className="w-14 h-14 rounded-full bg-dark-card border border-dark-border hover:border-rose-500/50 hover:bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-lg active:scale-90 transition-all cursor-pointer select-none"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Sparkle decorative button */}
          <button
            onClick={() => handleSwipe('right')}
            className="w-10 h-10 rounded-full bg-dark-card border border-dark-border text-yellow-500 flex items-center justify-center active:scale-90 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-yellow-500" />
          </button>

          {/* Like/Vibe button */}
          <button
            onClick={() => handleSwipe('right')}
            className="w-14 h-14 rounded-full bg-dark-card border border-dark-border hover:border-neon-lime/50 hover:bg-neon-lime/10 flex items-center justify-center text-neon-lime shadow-lg active:scale-90 transition-all cursor-pointer select-none"
          >
            <Heart className="w-6 h-6 fill-neon-lime" />
          </button>
        </div>
      )}

    </div>
  );
}
