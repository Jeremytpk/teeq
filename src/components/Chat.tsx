import React, { useState, useEffect, useRef } from "react";
import { User, Match, Message } from "../types";
import { CHAT_BOT_RESPONSES } from "../data";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, ArrowLeft, MoreVertical, ShieldAlert, BadgeCheck, Phone, Video } from "lucide-react";

interface ChatProps {
  currentUser: User;
  matches: Match[];
  onSendMessage: (matchId: string, text: string) => void;
  onClearChats: () => void;
  messages: Message[];
  activeMatchId: string | null;
  setActiveMatchId: (id: string | null) => void;
}

export default function Chat({
  currentUser,
  matches,
  onSendMessage,
  onClearChats,
  messages,
  activeMatchId,
  setActiveMatchId
}: ChatProps) {
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeMatch = matches.find(m => m.id === activeMatchId);
  const activeMessages = messages.filter(msg => msg.matchId === activeMatchId);

  // Auto scroll to bottom of chat when new message or typing starts
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, isTyping, activeMatchId]);

  // Handle send message form
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = inputText.trim();
    if (!cleanText || !activeMatchId) return;

    // Send user message
    onSendMessage(activeMatchId, cleanText);
    setInputText("");

    // Simulate reactive bot reply after short delay
    setIsTyping(true);
    
    // Choose responses based on peer profile
    const peer = activeMatch?.user;
    if (!peer) return;

    const repliesList = CHAT_BOT_RESPONSES[peer.personalityType || "generic"] || CHAT_BOT_RESPONSES.generic;
    
    // Pick response by tracking conversation lengths
    const userMsgCount = activeMessages.filter(m => m.senderId === "me").length;
    const responseIndex = userMsgCount % repliesList.length;
    let draftReply = repliesList[responseIndex];

    // Tailor answer to user location
    draftReply = draftReply.replace(/\[Commune\]/g, currentUser.commune);

    setTimeout(() => {
      setIsTyping(false);
      onSendMessage(activeMatchId, draftReply);
    }, 1800);
  };

  return (
    <div className="flex flex-col h-full w-full bg-dark-bg text-white relative">
      
      <AnimatePresence mode="wait">
        {!activeMatchId ? (
          /* Match Threads List View */
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex-1 flex flex-col p-3 pb-4 overflow-y-auto no-scrollbar"
          >
            {/* Header titles */}
            <div className="flex justify-between items-center mb-6 px-1 pt-2">
              <div>
                <h2 className="text-xl font-display font-black">Tes Discussions</h2>
                <p className="text-xs text-gray-500 font-medium">Tes jumeaux Teeq connects et vibes partagées.</p>
              </div>
              
              {matches.length > 0 && (
                <button
                  onClick={onClearChats}
                  className="text-[10px] uppercase font-mono text-gray-400 border border-dark-border px-2.5 py-1 rounded bg-dark-card hover:text-white"
                >
                  Vider
                </button>
              )}
            </div>

            {matches.length === 0 ? (
              /* Fallback empty view */
              <div className="my-auto py-12 px-6 text-center bg-dark-card border border-dark-border rounded-3xl flex flex-col items-center">
                <div className="w-14 h-14 bg-dark-bg border border-dark-border text-gray-500 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-display font-black text-gray-200">Aucune discussion active</h4>
                <p className="text-xs text-gray-500 mt-2 max-w-[240px] leading-relaxed">
                  Utilise le radar ou fais défiler les profils à droite à Bandal ou Gombe pour former des jumeaux teeq et commencer à tchatter !
                </p>
              </div>
            ) : (
              /* Matches thread lists */
              <div className="space-y-2.5">
                {matches.map((match) => {
                  const lastMsg = messages.filter(m => m.matchId === match.id).slice(-1)[0];
                  
                  return (
                    <button
                      key={match.id}
                      onClick={() => setActiveMatchId(match.id)}
                      className="w-full text-left bg-dark-card border border-dark-border p-3.5 rounded-2.5xl flex items-center justify-between gap-3 hover:border-gray-700 transition-colors focus:outline-none select-none cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl bg-dark-bg p-2 rounded-xl border border-dark-border">{match.user.avatar}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-display font-black text-white leading-none">{match.user.username}</h4>
                            <span className="text-[9px] font-mono text-gray-500 bg-neutral-900 px-1.5 py-0.5 rounded border border-dark-border">{match.user.id}</span>
                          </div>
                          
                          {/* Last preview message */}
                          <p className="text-xs text-gray-400 mt-1.5 truncate max-w-[190px] font-medium italic">
                            {lastMsg ? lastMsg.text : `Connecté avec ${match.user.username} !`}
                          </p>
                          <span className="text-[10px] font-mono text-neon-lime mt-1 block">
                            {match.user.commune} • {match.user.quartier}
                          </span>
                        </div>
                      </div>

                      {/* Right unread / stats markers */}
                      <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch py-0.5">
                        <span className="text-[9px] text-gray-500 font-medium font-mono">En ligne</span>
                        {match.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-neon-pink text-white text-[10px] font-mono font-bold flex items-center justify-center shadow-md">
                            {match.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          /* Active Chat Window View */
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex-1 flex flex-col h-full bg-dark-bg pl-0 relative"
          >
            {/* Chat Thread Header */}
            <div className="bg-dark-card border-b border-dark-border px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5 max-w-[70%]">
                <button
                  onClick={() => setActiveMatchId(null)}
                  className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-dark-alt transition-colors focus:outline-none cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{activeMatch?.user.avatar}</span>
                  <div className="text-left">
                    <div className="flex items-center gap-1">
                      <h3 className="text-sm font-display font-black text-white leading-none whitespace-nowrap">{activeMatch?.user.username}</h3>
                      <BadgeCheck className="w-3.5 h-3.5 text-neon-lime shrink-0" />
                    </div>
                    <span className="text-[9px] font-mono text-gray-400 font-semibold">{activeMatch?.user.id}</span>
                  </div>
                </div>
              </div>

              {/* Header icons: phone options */}
              <div className="flex items-center gap-1 text-gray-500">
                <button className="p-2 hover:text-gray-300">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 hover:text-gray-300">
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-2 hover:text-gray-300">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Micro warning notice about location */}
            <div className="p-1 px-4 bg-lime-400/5 border-b border-dark-border text-[10px] font-semibold font-mono text-neon-lime flex items-center justify-between">
              <span>LOCALISATION ACTIVE : À {activeMatch?.user.distance || 15}M</span>
              <span>COMMUNE: {activeMatch?.user.commune.toUpperCase()}</span>
            </div>

            {/* Messages body logs */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar pb-10">
              
              {/* Initial systems text notification on connection */}
              <div className="mx-auto text-center py-2 max-w-[280px]">
                <p className="text-[10px] font-mono text-gray-500 bg-dark-card border border-dark-border px-3.5 py-1.5 rounded-full inline-block leading-normal shadow-sm">
                  🔗 TEEQ-TWIN LIÉ AVEC SUCCESS !<br/>
                  Début de la conversation sécurisée.
                </p>
              </div>

              {activeMessages.map((msg) => {
                const isMe = msg.senderId === "me";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isMe
                          ? "bg-gradient-to-r from-neon-pink to-neon-magenta text-white rounded-tr-none text-right font-medium"
                          : "bg-dark-card border border-dark-border text-gray-200 rounded-tl-none text-left font-medium"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-[8px] font-mono text-gray-400 mt-1 block tracking-tight">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Bot typing simulator indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-dark-card border border-dark-border rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Floating text message sender form */}
            <form onSubmit={handleSend} className="p-3 bg-dark-card border-t border-dark-border flex gap-2 w-full">
              <input
                type="text"
                required
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Envoyer un message à ${activeMatch?.user.username}...`}
                className="flex-1 bg-dark-bg border border-dark-border focus:border-neon-pink rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none"
              />
              <button
                type="submit"
                className="bg-neon-pink text-white w-12 h-12 flex items-center justify-center rounded-xl transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <Send className="w-4.5 h-4.5 transform rotate-0" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
