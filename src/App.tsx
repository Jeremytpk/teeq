import React, { useState, useEffect } from "react";
import { User, Match, Message } from "./types";
import Onboarding from "./components/Onboarding";
import Auth from "./components/Auth";
import SwipeCards from "./components/SwipeCards";
import Radar from "./components/Radar";
import Chat from "./components/Chat";
import ProfileEdit from "./components/ProfileEdit";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Compass, MessageSquare, User as UserIcon, BellRing, Volume2, Sparkles, HelpCircle } from "lucide-react";

export default function App() {
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'swipe' | 'radar' | 'chat' | 'profile'>('swipe');
  
  // Storage bindings
  const [matches, setMatches] = useState<Match[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  // In-app banner alerts
  const [globalNotification, setGlobalNotification] = useState<string | null>(null);

  // Real devices online array synced via Backend API
  const [realOnlineUsers, setRealOnlineUsers] = useState<User[]>([]);

  // Periodically report heartbeat and poll backend synchronization data
  useEffect(() => {
    if (!currentUser) return;

    // Send instant heartbeat on mount/change
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: currentUser }),
        });
      } catch (err) {
        console.warn("Heartbeat reporting skipped (offline or booting):", err);
      }
    };

    sendHeartbeat();

    // Set up rapid polling interval (every 3 seconds) for real-time interactions
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sync?userId=${encodeURIComponent(currentUser.id)}`);
        if (!res.ok) return;
        const data = await res.json();

        // 1. Maintain list of other online devices
        setRealOnlineUsers(data.onlineUsers || []);

        // 2. Overwrite / merge matches (only for matches involving user IDs to avoid overriding local simulation files)
        setMatches(prev => {
          const merged = [...prev];
          (data.matches || []).forEach((srvMatch: Match) => {
            // Find matched item by target user id or match id
            const existingIdx = merged.findIndex(
              m => m.id === srvMatch.id || m.user.id === srvMatch.user.id
            );
            if (existingIdx !== -1) {
              merged[existingIdx] = {
                ...merged[existingIdx],
                id: srvMatch.id, // Align correct server ID
                lastMessage: srvMatch.lastMessage || merged[existingIdx].lastMessage,
              };
            } else {
              merged.unshift(srvMatch);
              // Trigger high quality vibration synth
              try {
                const context = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = context.createOscillator();
                const gain = context.createGain();
                osc.connect(gain);
                gain.connect(context.destination);
                osc.frequency.setValueAtTime(659.25, context.currentTime);
                gain.gain.setValueAtTime(0.04, context.currentTime);
                osc.start();
                gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.4);
                osc.stop(context.currentTime + 0.45);
              } catch (e) {}
              showBannerAlert(`🔥 Vibe mutuelle avec ${srvMatch.user.username} ! Chat débloqué.`);
            }
          });
          return merged;
        });

        // 3. Sync real-time messages securely
        setMessages(prev => {
          const merged = [...prev];
          (data.messages || []).forEach((srvMsg: Message) => {
            // Uniquely insert only missing message ids
            if (!merged.some(m => m.id === srvMsg.id)) {
              // Map senderId from server user UID into system-expected format (relative to me/peer)
              const mappedSenderId = srvMsg.senderId === currentUser.id ? "me" : "peer";
              merged.push({
                ...srvMsg,
                senderId: mappedSenderId,
              });
            }
          });
          return merged;
        });

      } catch (e) {
        console.warn("API sync polling error:", e);
      }
    }, 2800);

    return () => clearInterval(pollInterval);
  }, [currentUser]);

  // Parse localStorage on mount
  useEffect(() => {
    const onboardedStr = localStorage.getItem("teeq_onboarded");
    if (onboardedStr === "true") {
      setHasOnboarded(true);
    }

    const savedUserStr = localStorage.getItem("teeq_user");
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        setCurrentUser(parsed);
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }

    // Load matching & messages
    const savedMatches = localStorage.getItem("teeq_matches");
    if (savedMatches) {
      try {
        setMatches(JSON.parse(savedMatches));
      } catch (e) {}
    }

    const savedMsgs = localStorage.getItem("teeq_messages");
    if (savedMsgs) {
      try {
        setMessages(JSON.parse(savedMsgs));
      } catch (e) {}
    }
  }, []);

  // Sync methods to localStorage
  const handleOnboardingComplete = () => {
    localStorage.setItem("teeq_onboarded", "true");
    setHasOnboarded(true);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("teeq_user", JSON.stringify(user));
    
    // Auto sync an introductory conversation message
    showBannerAlert(`Karibu! Bienvenue sur teeq, @${user.username} !`);
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("teeq_user", JSON.stringify(updatedUser));
    showBannerAlert("Ton profil teeq a été mis à jour !");
  };

  const handleLogout = () => {
    localStorage.removeItem("teeq_user");
    localStorage.removeItem("teeq_onboarded");
    localStorage.removeItem("teeq_matches");
    localStorage.removeItem("teeq_messages");
    setCurrentUser(null);
    setHasOnboarded(false);
    setMatches([]);
    setMessages([]);
    setActiveMatchId(null);
    setActiveTab("swipe");
  };

  const showBannerAlert = (msg: string) => {
    setGlobalNotification(msg);
    // Play light synth bleep-like effect
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.frequency.setValueAtTime(587.33, context.currentTime); // D5 high vibe pitch
      gain.gain.setValueAtTime(0.04, context.currentTime);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.3);
      osc.stop(context.currentTime + 0.35);
    } catch(e){}

    setTimeout(() => {
      setGlobalNotification(null);
    }, 4500);
  };

  // Setup Instant Match
  const handleInstantMatch = async (matchedUser: User) => {
    // If the peer profile is not simulated (meaning they represent a real online device)
    if (matchedUser.isSimulated === false && currentUser) {
      try {
        const response = await fetch("/api/like", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromId: currentUser.id,
            toId: matchedUser.id,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.matchCreated) {
            // Reciprocal swipe match has been created! Add locally immediately
            const srvMatch = data.match;
            const newMatch: Match = {
              id: srvMatch.id,
              user: matchedUser,
              timestamp: srvMatch.timestamp,
              lastMessage: srvMatch.lastMessage,
              unreadCount: 0,
            };
            setMatches(prev => [newMatch, ...prev]);
            setActiveMatchId(srvMatch.id);
            setActiveTab("chat");
            showBannerAlert(`🔥 Connecté en direct ! Nouveau match Réel avec ${matchedUser.username}`);
          } else {
            // Signal logged, waiting for peer device to reciprocate inside Swipe Cards or Radar!
            showBannerAlert(`⚡ Signal envoyé à ${matchedUser.username} ! Attends sa réciprocité.`);
          }
        }
      } catch (err) {
        console.error("Failing to register real-time match:", err);
      }
      return;
    }

    // Check if match already exists
    const existing = matches.find(m => m.user.id === matchedUser.id);
    if (existing) {
      // Just focus him on chat tab
      setActiveTab("chat");
      setActiveMatchId(existing.id);
      return;
    }

    // Create Match record
    const matchId = `match_${Date.now()}`;
    const timestampStr = new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    });
    
    const newMatch: Match = {
      id: matchId,
      user: matchedUser,
      timestamp: timestampStr,
      lastMessage: `Vibe synchronisée avec ${matchedUser.username} !`,
      unreadCount: 1
    };

    const updatedMatches = [newMatch, ...matches];
    setMatches(updatedMatches);
    localStorage.setItem("teeq_matches", JSON.stringify(updatedMatches));

    // Play high pitch match synthesizer sound effect
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, context.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, context.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, context.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.05, context.currentTime);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.5);
      osc.stop(context.currentTime + 0.55);
    } catch(err){}

    // Trigger instant chat focus
    setActiveMatchId(matchId);
    setActiveTab("chat");
    showBannerAlert(`🔥 Nouveau Match Teeq ! Discute maintenant avec ${matchedUser.username}`);
  };

  // Send communication message
  const handleSendMessage = async (matchId: string, text: string) => {
    const timestampStr = new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    });

    // Determine if our match target is a real device (not simulated)
    const matchTarget = matches.find(m => m.id === matchId);
    const isRealDevice = matchTarget && matchTarget.user.isSimulated === false;

    if (isRealDevice && currentUser) {
      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matchId,
            senderId: currentUser.id,
            text,
          }),
        });
        if (response.ok) {
          // Immediately display locally to render sent message
          const newMsg: Message = {
            id: `msg_local_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            matchId,
            senderId: "me",
            text,
            timestamp: timestampStr,
          };
          setMessages(prev => [...prev, newMsg]);

          setMatches(prev => prev.map(m => {
            if (m.id === matchId) {
              return { ...m, lastMessage: text, unreadCount: 0 };
            }
            return m;
          }));
        }
      } catch (err) {
        console.error("Failed to transmit chat message to server:", err);
      }
      return;
    }

    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      matchId,
      senderId: "me", // Will be overwritten if bot
      text,
      timestamp: timestampStr
    };

    // If text parameters belong to Bot, adjust sender ID
    const isBotSender = text.startsWith("BotSender:");
    if (isBotSender) {
      newMsg.senderId = "peer";
      newMsg.text = text.replace("BotSender:", "");
    }

    // Append message
    const updatedMsgs = [...messages, newMsg];
    setMessages(updatedMsgs);
    localStorage.setItem("teeq_messages", JSON.stringify(updatedMsgs));

    // Update match preview stats
    const updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          lastMessage: newMsg.text,
          unreadCount: isBotSender && activeMatchId !== matchId ? m.unreadCount + 1 : 0
        };
      }
      return m;
    });
    setMatches(updatedMatches);
    localStorage.setItem("teeq_matches", JSON.stringify(updatedMatches));
  };

  const handleClearChats = () => {
    if (window.confirm("Voulez-vous réinitialiser et vider toutes vos discussions de teeq ?")) {
      setMatches([]);
      setMessages([]);
      setActiveMatchId(null);
      localStorage.removeItem("teeq_matches");
      localStorage.removeItem("teeq_messages");
      showBannerAlert("Toutes les conversations ont été effacées.");
    }
  };

  // Custom intermediary proxy message sender for bot responses
  const handleSendMessageProxy = (matchId: string, text: string) => {
    // If sent by user, just publish. Otherwise wrap bot slang
    if (messages.length > 0 && messages[messages.length - 1].senderId === "me" && !text.startsWith("Karibu") && !text.includes("Vibe synchronisée")) {
      // It is the bot reply simulation
      handleSendMessage(matchId, `BotSender:${text}`);
    } else {
      handleSendMessage(matchId, text);
    }
  };

  // Render navigation tab panels
  const renderTabContent = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case 'swipe':
        return (
          <SwipeCards
            currentUser={currentUser}
            onInstantMatch={handleInstantMatch}
            matches={matches}
            realOnlineUsers={realOnlineUsers}
          />
        );
      case 'radar':
        return (
          <Radar
            currentUser={currentUser}
            onInstantMatch={handleInstantMatch}
            matches={matches}
            realOnlineUsers={realOnlineUsers}
          />
        );
      case 'chat':
        return (
          <Chat
            currentUser={currentUser}
            matches={matches}
            onSendMessage={handleSendMessageProxy}
            onClearChats={handleClearChats}
            messages={messages}
            activeMatchId={activeMatchId}
            setActiveMatchId={setActiveMatchId}
          />
        );
      case 'profile':
        return (
          <ProfileEdit
            currentUser={currentUser}
            onUpdateUser={handleUpdateProfile}
            onLogout={handleLogout}
          />
        );
      default:
        return null;
    }
  };

  // Stage router: onboarding vs auth vs main dashboard view
  if (!hasOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (!currentUser) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen max-h-screen bg-dark-bg text-white overflow-hidden">
      
      {/* Desktop Informative Sidebar Hero Panel */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-dark-card via-dark-bg to-[#0A0A0C] flex-col justify-between p-12 pr-6 overflow-hidden relative h-full">
        <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-neon-lime/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-neon-pink/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Branding header */}
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-neon-pink to-neon-lime flex items-center justify-center font-display font-black text-black text-2xl shadow-xl">t</span>
          <span className="font-display font-black text-3xl tracking-tighter text-white">teeq</span>
        </div>

        {/* Centered Pitch Title */}
        <div className="max-w-xl my-6 text-left">
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-dark-card border border-dark-border/60 rounded-full text-xs font-mono font-bold text-neon-lime mb-4">
            <Volume2 className="w-3.5 h-3.5" /> PROXIMITÉ ACTIVE EN RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-black leading-[1.05] tracking-tight mb-4 text-white">
            Rencontre de <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-magenta">nouvelles têtes</span> près d'ici !
          </h1>
          <p className="text-sm lg:text-base text-gray-400 leading-relaxed max-w-lg mb-6 font-medium">
            Partage ton ID jumeau secret <span className="text-white bg-dark-card px-2 py-0.5 rounded font-mono text-xs border border-dark-border">{currentUser?.id}</span> ou allume le balayage radar pour voir qui vibe dans la même pièce à <span className="text-neon-lime font-bold">{currentUser?.commune}</span>.
          </p>

          {/* Quick tips */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-dark-border/40 text-left">
            <div>
              <h4 className="text-xs font-mono font-black text-neon-lime uppercase">L'ID Jumeau secret</h4>
              <p className="text-[11px] text-gray-500 mt-1">Sers-toi de l'ID unique pour te synchroniser instantanément avec le jumeau d'un inconnu croisé dans la ruelle.</p>
            </div>
            <div>
              <h4 className="text-xs font-mono font-black text-neon-pink uppercase">100% Congo-Ready</h4>
              <p className="text-[11px] text-gray-500 mt-1">Conçu spécialement avec les communes et quartiers réels (Bandal, Gombe, Limete, Himbi, Golf, etc.).</p>
            </div>
          </div>
        </div>

        {/* App footer note */}
        <div className="text-[11px] text-gray-600 flex items-center justify-between">
          <span>teeq v1.4.0 • Tous droits réservés RDC</span>
          <span className="font-mono text-[10px]">Utilisateur connecté : @{currentUser?.username}</span>
        </div>
      </div>

      {/* Interactive Mobile Responsive Core App Viewport Frame */}
      <div className="flex-1 w-full md:w-1/2 lg:w-2/5 h-full md:h-screen max-h-screen md:border-l border-dark-border bg-dark-bg flex flex-col justify-between relative shadow-2xl overflow-hidden self-stretch md:my-0 md:rounded-none">
        
        {/* Top App Header layout */}
        {activeMatchId === null && (
          <div className="flex justify-between items-center px-4 py-3 bg-dark-card/90 border-b border-dark-border z-20 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-neon-pink to-neon-lime flex items-center justify-center font-display font-extrabold text-black text-sm">t</span>
              <span className="font-display font-black text-lg tracking-tighter text-white">teeq</span>
            </div>

            {/* Micro active user details */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-gray-400 bg-dark-bg border border-dark-border/80 px-2 py-1 rounded-md">
                {currentUser.commune}
              </span>
              <span className="text-xl shrink-0">{currentUser.avatar}</span>
            </div>
          </div>
        )}

        {/* Interactive Notification banner */}
        <AnimatePresence>
          {globalNotification && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-neon-pink text-white text-[11px] font-mono font-extrabold px-4 py-2 text-center flex items-center justify-center gap-1.5 z-30 shadow-md select-none"
            >
              <BellRing className="w-3 h-3 animate-bounce" />
              <span>{globalNotification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Core dynamic content panel */}
        <div className="flex-1 relative overflow-hidden bg-dark-bg">
          {renderTabContent()}
        </div>

        {/* Bottom Tab Routing Navigation Bar */}
        {activeMatchId === null && (
          <div className="bg-dark-card/95 border-t border-dark-border/80 flex justify-around items-center h-16 shrink-0 z-20 relative px-2">
            
            {/* Tab Swipe button */}
            <button
              onClick={() => setActiveTab('swipe')}
              className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer focus:outline-none transition-colors ${
                activeTab === 'swipe' ? 'text-neon-pink' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Flame className="w-5.5 h-5.5" />
              <span className="text-[9px] font-bold font-display mt-1">Glisser</span>
            </button>

            {/* Tab Radar button */}
            <button
              onClick={() => setActiveTab('radar')}
              className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer focus:outline-none transition-colors ${
                activeTab === 'radar' ? 'text-neon-lime' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Compass className={`w-5.5 h-5.5 ${activeTab === 'radar' ? 'animate-spin-slow' : ''}`} />
              <span className="text-[9px] font-bold font-display mt-1">Radar Proche</span>
            </button>

            {/* Tab Chat button */}
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer focus:outline-none transition-colors relative ${
                activeTab === 'chat' ? 'text-neon-pink' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <MessageSquare className="w-5.5 h-5.5" />
              {matches.some(m => m.unreadCount > 0) && (
                <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-neon-pink animate-ping" />
              )}
              <span className="text-[9px] font-bold font-display mt-1">Discussions</span>
            </button>

            {/* Tab My Profile button */}
            <button
              onClick={() => {
                setActiveTab('profile');
                // Ensure profile detail state resets unread focus
              }}
              className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer focus:outline-none transition-colors ${
                activeTab === 'profile' ? 'text-neon-lime' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <UserIcon className="w-5.5 h-5.5" />
              <span className="text-[9px] font-bold font-display mt-1">Moi / ID</span>
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
