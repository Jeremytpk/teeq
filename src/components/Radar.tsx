import React, { useState, useEffect } from "react";
import { User, Match } from "../types";
import { NEARBY_MOCK_USERS } from "../data";
import { motion, AnimatePresence } from "motion/react";
import { Radar as RadarIcon, Search, Signal, Smartphone, MapPin, Sparkles, Check, HelpCircle } from "lucide-react";

interface RadarProps {
  currentUser: User;
  onInstantMatch: (matchedUser: User) => void;
  matches: Match[];
  realOnlineUsers?: User[];
}

export default function Radar({ currentUser, onInstantMatch, matches, realOnlineUsers = [] }: RadarProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [twinSearchId, setTwinSearchId] = useState("");
  const [isLinkingTwin, setIsLinkingTwin] = useState(false);
  const [twinLinkProgress, setTwinLinkProgress] = useState(0);
  const [twinError, setTwinError] = useState("");
  const [twinSuccess, setTwinSuccess] = useState<User | null>(null);

  // Active simulated nearby users
  const [nearbyProfiles, setNearbyProfiles] = useState<User[]>([]);
  // Random event notifications
  const [proximityAlert, setProximityAlert] = useState<User | null>(null);

  // Initialize simulated and real users
  useEffect(() => {
    const realUsersMapped = realOnlineUsers
      .filter(u => u.id !== currentUser.id)
      .map(u => ({ ...u, isSimulated: false, distance: u.distance || Math.floor(2 + Math.random() * 8) }));

    const mockFiltered = NEARBY_MOCK_USERS
      .filter(u => u.id !== currentUser.id && !realUsersMapped.some(ru => ru.id === u.id))
      .map(u => ({ ...u, isSimulated: true }));

    setNearbyProfiles([...realUsersMapped, ...mockFiltered]);
  }, [currentUser, realOnlineUsers]);

  // Simulate proximity movement and prompt random notifications of "nearby user found!"
  useEffect(() => {
    if (!isScanning) return;

    // Trigger initial notification after 3 seconds, then every 15 seconds
    const initialTimer = setTimeout(() => {
      // Find a user not already matched
      const unmatched = nearbyProfiles.filter(u => !matches.some(m => m.user.id === u.id));
      if (unmatched.length > 0) {
        const randomUser = unmatched[Math.floor(Math.random() * unmatched.length)];
        // Modify distance temporarily to simulate they got very close
        const alertUser = { ...randomUser, distance: Math.floor(2 + Math.random() * 8) };
        setProximityAlert(alertUser);
      }
    }, 4000);

    const interval = setInterval(() => {
      const unmatched = nearbyProfiles.filter(u => !matches.some(m => m.user.id === u.id));
      if (unmatched.length > 0 && Math.random() > 0.4) {
        const randomUser = unmatched[Math.floor(Math.random() * unmatched.length)];
        const alertUser = { ...randomUser, distance: Math.floor(1 + Math.random() * 10) };
        setProximityAlert(alertUser);
      }
      
      // Slightly fluctuate distances on the list for realistic simulation
      setNearbyProfiles(prev => prev.map(p => {
        if (p.distance) {
          const delta = Math.random() > 0.5 ? 1 : -1;
          const trackingDist = Math.max(2, p.distance + delta);
          return { ...p, distance: trackingDist };
        }
        return p;
      }));
    }, 12000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isScanning, nearbyProfiles, matches]);

  // Handle unique ID Twin Lookup
  const handleTwinLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwinError("");
    setTwinSuccess(null);
    const searchIdClean = twinSearchId.trim().toUpperCase();

    if (!searchIdClean) return;

    // Direct lookup of real active online users on server
    try {
      const resp = await fetch("/api/twin-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchId: searchIdClean, selfId: currentUser.id })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.user) {
          const found = data.user;
          if (matches.some(m => m.user.id === found.id)) {
            setTwinError(`Tu es déjà matché et connecté avec ton jumeau ${found.username} !`);
            return;
          }

          setIsLinkingTwin(true);
          setTwinLinkProgress(5);

          const interval = setInterval(() => {
            setTwinLinkProgress(prev => {
              if (prev >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                  setIsLinkingTwin(false);
                  setTwinSuccess({ ...found, isSimulated: false });
                  setTwinSearchId("");
                }, 400);
                return 100;
              }
              return prev + 25;
            });
          }, 100);
          return;
        }
      }
    } catch (err) {
      console.error("Twin lookup err:", err);
    }

    // Fallback to NEARBY_MOCK_USERS standard simulation check
    const foundUser = NEARBY_MOCK_USERS.find(
      u => u.id.toUpperCase() === searchIdClean && u.id !== currentUser.id
    );

    if (!foundUser) {
      setTwinError("Aucun ID Teeq Jumeau correspondant trouvé à proximité réactive.");
      return;
    }

    // Check if already matched
    if (matches.some(m => m.user.id === foundUser.id)) {
      setTwinError(`Tu es déjà matché et connecté avec ton jumeau ${foundUser.username} !`);
      return;
    }

    // Match found! Play linking animation
    setIsLinkingTwin(true);
    setTwinLinkProgress(5);

    const interval = setInterval(() => {
      setTwinLinkProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLinkingTwin(false);
            setTwinSuccess(foundUser);
            setTwinSearchId("");
          }, 400);
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  const confirmTwinMatch = () => {
    if (twinSuccess) {
      onInstantMatch(twinSuccess);
      setTwinSuccess(null);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto px-3 pb-3 pt-1 no-scrollbar">
      
      {/* In-App Spontaneous Proximity Notification Toast */}
      <AnimatePresence>
        {proximityAlert && (
          <motion.div
            initial={{ opacity: 0, y: -80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 left-4 right-4 bg-gradient-to-r from-dark-card to-dark-alt border-2 border-neon-lime p-4 rounded-2xl shadow-2xl z-50 flex items-center justify-between gap-3 overflow-hidden"
          >
            {/* Pulsing indicator line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-lime to-green-500 animate-pulse" />
            <div className="flex items-center gap-3">
              <span className="text-3xl bg-neon-lime/10 p-2.5 rounded-xl border border-neon-lime/30">{proximityAlert.avatar}</span>
              <div className="text-left">
                <p className="text-xs font-mono font-extrabold text-neon-lime uppercase tracking-widest flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-neon-lime animate-ping" /> JUMEAU TEEQ PROCHE DETECTÉ !
                </p>
                <h4 className="text-sm font-display font-black text-white">{proximityAlert.username}, {proximityAlert.age} ans</h4>
                <p className="text-[11px] text-gray-400 font-medium">À seulement {proximityAlert.distance}m dans {proximityAlert.commune}!</p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  onInstantMatch(proximityAlert);
                  setProximityAlert(null);
                }}
                className="bg-neon-lime hover:brightness-115 text-black font-display font-extrabold text-[11px] px-3.5 py-2 rounded-xl text-center cursor-pointer active:scale-95 transition-all shadow-md"
              >
                Viber ⚡
              </button>
              <button
                onClick={() => setProximityAlert(null)}
                className="text-[10px] text-gray-500 font-bold hover:text-gray-300 py-1"
              >
                Ignorer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Radar Screen Visual */}
      <div className="flex flex-col items-center justify-center my-4 py-4 bg-dark-card rounded-3xl border border-dark-border relative overflow-hidden shrink-0">
        {/* Radar Title */}
        <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 flex items-center gap-1 sm:gap-1.5 font-mono text-[10px] sm:text-xs font-bold text-gray-400 z-10 bg-dark-bg/85 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-dark-border">
          <Signal className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-neon-lime ${isScanning ? 'animate-pulse' : ''}`} />
          <span>RADAR ACTIF : {currentUser.commune}</span>
        </div>

        {/* Scan Toggle button */}
        <button
          onClick={() => setIsScanning(!isScanning)}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-10 text-[9px] sm:text-[10px] uppercase font-mono font-extrabold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border transition-all cursor-pointer bg-dark-bg"
          style={{
            borderColor: isScanning ? "rgba(34, 197, 94, 0.4)" : "rgba(236, 72, 153, 0.4)",
            color: isScanning ? "#22c55e" : "#ec4899"
          }}
        >
          {isScanning ? "Désactiver" : "Activer"}
        </button>

        {/* Spinning Radar Layout */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mt-12 mb-4 flex items-center justify-center">
          
          {/* Constant Rotating sweep hand */}
          {isScanning && (
            <div 
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-neon-lime/10 via-transparent to-transparent border-r border-t border-neon-lime/40 animate-[spin_5s_linear_infinite]"
              style={{ clipPath: "polygon(50% 50%, 100% 0, 100% 100%)" }}
            />
          )}

          {/* Glowing radar rings */}
          <div className="absolute w-full h-full rounded-full border border-dark-border" />
          <div className="absolute w-3/4 h-3/4 rounded-full border border-neutral-800" />
          <div className="absolute w-1/2 h-1/2 rounded-full border border-neon-lime/10" />
          <div className="absolute w-1/4 h-1/4 rounded-full border border-neon-lime/20" />

          {/* Pulse sonar rings */}
          {isScanning && (
            <div className="absolute w-1/2 h-1/2 rounded-full border-2 border-neon-lime/30 animate-ping" />
          )}

          {/* Self Center Point */}
          <div className="absolute z-10 flex flex-col items-center justify-center bg-dark-bg border-2 border-neon-lime rounded-full w-12 h-12 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <span className="text-xl leading-none">{currentUser.avatar}</span>
          </div>

          {/* Scattered dots representing online mock users nearby */}
          <AnimatePresence>
            {isScanning && nearbyProfiles.slice(0, 4).map((p, idx) => {
              // Position coordinates around circle
              const angles = [45, 140, 230, 310];
              const radii = [65, 85, 45, 100];
              const angle = angles[idx % angles.length];
              const radius = radii[idx % radii.length];
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;

              const isMatched = matches.some(m => m.user.id === p.id);

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute cursor-pointer group"
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  onClick={() => {
                    const alertUser = { ...p, distance: Math.floor(2 + idx * 8) };
                    setProximityAlert(alertUser);
                  }}
                >
                  <div className={`w-8 h-8 rounded-full bg-dark-card flex items-center justify-center border-2 shadow-md relative hover:scale-110 active:scale-95 transition-all ${
                    isMatched ? 'border-neon-pink' : 'border-neon-lime'
                  }`}>
                    <span className="text-sm">{p.avatar}</span>
                    <span className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border border-dark-bg ${
                      isMatched ? 'bg-neon-pink' : 'bg-green-500'
                    }`} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Scan Status message */}
        <p className="text-xs font-mono font-medium text-gray-400 select-none animate-pulse">
          {isScanning ? "Recherche de signaux Teeq jumeaux ou proximité..." : "Radar en veille silencieuse."}
        </p>
      </div>

      {/* Unique Teeq App ID recognition panel ("Recognize its twin via unique ID") */}
      <div className="bg-dark-card border border-dark-border p-5 rounded-3xl mt-2 relative shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-display font-black text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-neon-pink" /> Connecter par ID Jumeau
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
              Un inconnu à côté de toi t'a partagé son ID? Saisis-le pour synchroniser vos profils.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[9px] font-mono text-neon-pink font-bold bg-neon-pink/10 border border-neon-pink/30 px-2 py-1 rounded-full">
              TWIN CONNECT
            </span>
          </div>
        </div>

        {/* ID input form */}
        <form onSubmit={handleTwinLookup} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              required
              value={twinSearchId}
              onChange={(e) => {
                setTwinSearchId(e.target.value);
                setTwinError("");
              }}
              placeholder="ex: TEEQ-109-KIN"
              className="w-full bg-dark-bg border border-dark-border focus:border-neon-pink rounded-xl px-3 py-3 pl-8 text-xs font-mono text-white tracking-widest focus:outline-none uppercase"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
          <button
            type="submit"
            disabled={isLinkingTwin}
            className="bg-neon-pink hover:brightness-110 text-white font-display font-black text-xs px-4 py-3 rounded-xl transition-all cursor-pointer border border-transparent shrink-0 focus:outline-none btn-vibe"
          >
            Connecter
          </button>
        </form>

        {/* Search status & animations */}
        <AnimatePresence mode="wait">
          {isLinkingTwin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2 text-center"
            >
              <p className="text-[10px] text-neon-lime font-mono animate-pulse">
                ÉTABLISSEMENT DE LA LIAISON JUMEAUX TEEQ EN COURS...
              </p>
              <div className="w-full h-1.5 bg-dark-bg rounded-full overflow-hidden border border-dark-border">
                <div 
                  className="h-full bg-gradient-to-r from-neon-pink to-neon-lime transition-all duration-150"
                  style={{ width: `${twinLinkProgress}%` }}
                />
              </div>
            </motion.div>
          )}

          {twinError && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[11px] text-red-400 mt-2 font-medium"
            >
              ⚠️ {twinError}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Quick Help Guide IDs for simulation purposes */}
        <div className="mt-3.5 pt-3 border-t border-dark-border/40 flex items-center justify-between">
          <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> IDs de test (copie pour tester) :
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setTwinSearchId("TEEQ-109-KIN")}
              className="text-[10px] font-mono font-bold text-gray-400 bg-dark-bg hover:text-white px-2 py-1 rounded border border-dark-border"
            >
              Prisca
            </button>
            <button
              onClick={() => setTwinSearchId("TEEQ-772-KIN")}
              className="text-[10px] font-mono font-bold text-gray-400 bg-dark-bg hover:text-white px-2 py-1 rounded border border-dark-border"
            >
              Davy
            </button>
            <button
              onClick={() => setTwinSearchId("TEEQ-552-GOM")}
              className="text-[10px] font-mono font-bold text-gray-400 bg-dark-bg hover:text-white px-2 py-1 rounded border border-dark-border"
            >
              Esther
            </button>
          </div>
        </div>
      </div>

      {/* Successful Match Backdrop for Twin Recognition */}
      <AnimatePresence>
        {twinSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 text-center"
          >
            {/* Ambient Background glow */}
            <div className="absolute w-80 h-80 bg-neon-lime/20 blur-[100px] rounded-full" />
            
            <span className="text-xl font-mono text-neon-lime font-bold uppercase tracking-widest mb-2 animate-bounce">
              🔥 COMPATIBILITÉ DOUBLE DETECTÉE !
            </span>
            <h2 className="text-3xl font-display font-black text-white leading-none mb-6">
              Jumeaux Teeq Associés !
            </h2>

            {/* Avatars comparison */}
            <div className="flex items-center justify-center gap-6 mb-8 relative">
              {/* User Avatar */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-dark-card border-2 border-neon-pink rounded-full flex items-center justify-center relative shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                  <span className="text-4xl">{currentUser.avatar}</span>
                </div>
                <span className="text-xs font-bold text-gray-300 mt-2">{currentUser.username} (Toi)</span>
                <span className="text-[9px] font-mono text-gray-500">{currentUser.id}</span>
              </div>

              {/* Pulsing Sync lines */}
              <div className="flex items-center justify-center font-mono font-light text-neon-lime animate-pulse text-2xl">
                ⚡🧬⚡
              </div>

              {/* Found Twin Avatar */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-dark-card border-2 border-neon-lime rounded-full flex items-center justify-center relative shadow-[0_0_20px_rgba(163,230,53,0.3)]">
                  <span className="text-4xl">{twinSuccess.avatar}</span>
                </div>
                <span className="text-xs font-bold text-gray-300 mt-2">{twinSuccess.username}</span>
                <span className="text-[9px] font-mono text-gray-500">{twinSuccess.id}</span>
              </div>
            </div>

            {/* Profile Brief card */}
            <div className="bg-dark-card border border-dark-border px-5 py-4 rounded-2xl max-w-sm mb-8 text-left">
              <span className="text-[10px] font-bold text-neon-lime uppercase tracking-wider">{twinSuccess.commune} • {twinSuccess.quartier} ({twinSuccess.city})</span>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed font-medium italic">
                "{twinSuccess.bio}"
              </p>
              <div className="flex gap-1 mt-3">
                {twinSuccess.vibes.map(v => (
                  <span key={v} className="text-[10px] font-bold text-neon-pink bg-neon-pink/10 px-2 py-0.5 rounded-full">#{v}</span>
                ))}
              </div>
            </div>

            {/* Start Chat action */}
            <div className="flex flex-col gap-3 w-full max-w-sm">
              <button
                onClick={confirmTwinMatch}
                className="bg-gradient-to-r from-neon-pink to-neon-lime font-display font-black text-black text-sm py-4 rounded-xl cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                Lancer la Discussion en Direct <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTwinSuccess(null)}
                className="text-xs text-gray-400 hover:text-white py-2 cursor-pointer font-bold"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Nearby Users List */}
      <div className="mt-5 space-y-3 pb-6 shrink-0">
        <h3 className="text-sm font-display font-black text-white text-left ml-1 flex items-center justify-between">
          <span>Utilisateurs en Ligne Proches</span>
          <span className="text-[10px] font-mono font-bold text-green-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" /> {isScanning ? nearbyProfiles.length : 0} Détectés
          </span>
        </h3>

        {!isScanning ? (
          <div className="p-8 text-center bg-dark-card border border-dashed border-dark-border rounded-3xl">
            <p className="text-xs text-gray-400">Le radar est actuellement désactivé. Activez-le pour voir les personnes réelles proches de votre quartier.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {nearbyProfiles.map((user) => {
              const matched = matches.some(m => m.user.id === user.id);
              return (
                <div
                  key={user.id}
                  className="bg-dark-card border border-dark-border p-4 rounded-2.5xl flex items-center justify-between gap-4 select-none hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className="text-3xl bg-dark-bg p-2 rounded-xl border border-dark-border">{user.avatar}</span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-display font-black text-white leading-none">{user.username}</h4>
                        <span className="text-xs text-gray-400 font-bold">{user.age} ans</span>
                        {!user.isSimulated && (
                          <span className="text-[9px] bg-green-500/15 text-green-400 font-mono font-black px-1.5 py-0.5 rounded border border-green-500/30 flex items-center gap-1 animate-pulse uppercase tracking-wider shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" /> En direct
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neon-lime mt-1 font-mono uppercase font-bold tracking-wider">
                        {user.commune} • {user.quartier}
                      </p>
                      {/* Subtitle with distance */}
                      <p className="text-[10px] text-gray-500 font-medium">
                        À {user.distance ? `${user.distance} mètres` : "quelques pas"} • {matched ? "Déjà connecté 🤍" : "Signal Réactif"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onInstantMatch(user)}
                    className={`font-display font-black text-[11px] px-3.5 py-2 rounded-xl text-center cursor-pointer active:scale-95 transition-all text-xs ${
                      matched
                        ? "bg-dark-alt text-gray-500 border border-dark-border"
                        : "bg-neon-lime hover:brightness-110 text-black shadow-md shadow-neon-lime/10"
                    }`}
                  >
                    {matched ? "Discuter" : "Viber ⚡"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
