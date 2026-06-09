import React, { useState, useEffect } from "react";
import { User } from "../types";
import { DRC_CITIES, AVAILABLE_VIBES } from "../data";
import { motion } from "motion/react";
import { Smartphone, Copy, Check, MapPin, Eye, Save, LogOut, Trash2 } from "lucide-react";

interface ProfileEditProps {
  currentUser: User;
  onUpdateUser: (updated: User) => void;
  onLogout: () => void;
}

export default function ProfileEdit({ currentUser, onUpdateUser, onLogout }: ProfileEditProps) {
  const [username, setUsername] = useState(currentUser.username);
  const [age, setAge] = useState<number>(currentUser.age);
  const [gender, setGender] = useState<'Homme' | 'Femme' | 'Non-binaire'>(currentUser.gender);
  
  const [selectedCityName, setSelectedCityName] = useState(currentUser.city);
  const [selectedCommuneName, setSelectedCommuneName] = useState(currentUser.commune);
  const [selectedQuartier, setSelectedQuartier] = useState(currentUser.quartier);
  
  const [bio, setBio] = useState(currentUser.bio || "");
  const [selectedVibes, setSelectedVibes] = useState<string[]>(currentUser.vibes || []);
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar || "✨");
  
  const [copiedId, setCopiedId] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const availableAvatars = ["✨", "🕺", "🎨", "🎶", "💻", "🕶️", "🍕", "🦊", "🍿", "🥑", "🎮", "🏎️", "⚽", "🍭", "🎧", "🦄"];

  // Cascade Location bindings
  const currentCity = DRC_CITIES.find(c => c.name === selectedCityName) || DRC_CITIES[0];
  const communes = currentCity.communes;
  const currentCommune = communes.find(cm => cm.name === selectedCommuneName) || communes[0];
  const quartiers = currentCommune?.quartiers || [];

  // Re-map when locations change
  useEffect(() => {
    // Check if new city has different communes
    const matchCommune = communes.find(cm => cm.name === selectedCommuneName);
    if (!matchCommune && communes.length > 0) {
      setSelectedCommuneName(communes[0].name);
    }
  }, [selectedCityName]);

  useEffect(() => {
    const matchQuartier = currentCommune?.quartiers.includes(selectedQuartier);
    if (!matchQuartier && currentCommune && currentCommune.quartiers.length > 0) {
      setSelectedQuartier(currentCommune.quartiers[0]);
    }
  }, [selectedCommuneName, selectedCityName]);

  const toggleVibe = (vibe: string) => {
    if (selectedVibes.includes(vibe)) {
      setSelectedVibes(prev => prev.filter(v => v !== vibe));
    } else {
      if (selectedVibes.length < 5) {
        setSelectedVibes(prev => [...prev, vibe]);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUser.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedUser: User = {
      ...currentUser,
      username: username.trim(),
      age,
      gender,
      city: selectedCityName,
      commune: selectedCommuneName,
      quartier: selectedQuartier,
      bio: bio.trim(),
      avatar: selectedAvatar,
      vibes: selectedVibes
    };

    onUpdateUser(updatedUser);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto px-3 pb-4 pt-1 no-scrollbar">
      
      {/* Header title */}
      <div className="text-left px-1 pt-2 mb-6 shrink-0">
        <h2 className="text-xl font-display font-black">Mon Compte</h2>
        <p className="text-xs text-gray-500 font-medium">Gère tes informations de profil et d'ID unique.</p>
      </div>

      {/* Special App Unique Teeq ID Showcase Card */}
      <div className="bg-gradient-to-tr from-dark-alt to-dark-card border border-dark-border p-5 rounded-3xl relative overflow-hidden mb-6 shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/10 blur-[40px] rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-3.5">
          <Smartphone className="w-5 h-5 text-neon-lime" />
          <span className="text-xs font-mono font-bold text-gray-400">MON IDENTIFICATION TEEQ-TWIN</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-2xl md:text-3xl font-mono font-black text-white tracking-widest">{currentUser.id}</span>
            <p className="text-[10px] text-lime-400 font-mono mt-1 font-bold">RECONNU COMME JUMEAU UNIQUE</p>
          </div>
          <button
            onClick={copyToClipboard}
            className="w-10 h-10 bg-dark-bg hover:bg-dark-border border border-dark-border text-gray-300 rounded-xl flex items-center justify-center cursor-pointer transition-colors active:scale-95 shrink-0"
          >
            {copiedId ? <Check className="w-4.5 h-4.5 text-neon-lime" /> : <Copy className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5 shrink-0 pb-8">
        
        {/* Basic fields */}
        <div className="bg-dark-card border border-dark-border p-5 rounded-3xl space-y-4">
          <h3 className="text-xs font-mono font-bold text-gray-400 mb-2 uppercase">Informations de Profil</h3>

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 pl-1">Nom d'utilisateur</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border focus:border-neon-lime rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Grid Age & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 pl-1">Âge: <span className="text-neon-lime font-bold">{age} ans</span></label>
              <input
                type="range"
                min="18"
                max="80"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
                className="w-full accent-neon-lime cursor-pointer bg-dark-bg h-2 rounded-lg border border-dark-border"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 pl-1">Genre</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-dark-bg border border-dark-border focus:border-neon-lime rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="Femme">Femme</option>
                <option value="Homme">Homme</option>
                <option value="Non-binaire">Autre</option>
              </select>
            </div>
          </div>

          {/* Avatar selector */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-gray-400 pl-1">Mon Badge Visuel</label>
            <div className="flex gap-2 p-1.5 bg-dark-bg rounded-xl border border-dark-border overflow-x-auto no-scrollbar">
              {availableAvatars.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`text-xl p-2 rounded-xl border transition-all shrink-0 cursor-pointer ${
                    selectedAvatar === av ? "bg-neon-lime/20 border-neon-lime transform scale-110" : "border-transparent"
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* DRC Cascade Location Card */}
        <div className="bg-dark-card border border-dark-border p-5 rounded-3xl space-y-4">
          <h3 className="text-xs font-mono font-bold text-gray-400 mb-2 uppercase flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-neon-pink" /> Localisation d'Origine
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* City */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Ville</span>
              <select
                value={selectedCityName}
                onChange={(e) => setSelectedCityName(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer font-medium"
              >
                {DRC_CITIES.map(city => (
                  <option key={city.name} value={city.name}>{city.name}</option>
                ))}
              </select>
            </div>

            {/* Commune */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Commune</span>
              <select
                value={selectedCommuneName}
                onChange={(e) => setSelectedCommuneName(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer font-medium"
              >
                {communes.map(comm => (
                  <option key={comm.name} value={comm.name}>{comm.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quartier */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Quartier</span>
            <select
              value={selectedQuartier}
              onChange={(e) => setSelectedQuartier(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-xs text-white focus:outline-none cursor-pointer font-medium"
            >
              {quartiers.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Biography Text & Vibes card */}
        <div className="bg-dark-card border border-dark-border p-5 rounded-3xl space-y-4">
          {/* Bio Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 pl-1">Ma Biographie Teeq</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Décris un peu qui tu es, tes styles..."
              className="w-full bg-dark-bg border border-dark-border focus:border-neon-lime rounded-xl px-4 py-3 text-xs text-white focus:outline-none placeholder:text-gray-600 leading-relaxed font-medium"
            />
          </div>

          {/* Vibes select */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-400 pl-1 block">Modifier mes Vibes ({selectedVibes.length}/5)</span>
            <div className="flex flex-wrap gap-1 p-2 bg-dark-bg border border-dark-border rounded-2xl max-h-36 overflow-y-auto no-scrollbar">
              {AVAILABLE_VIBES.map((vibe) => {
                const active = selectedVibes.includes(vibe);
                return (
                  <button
                    key={vibe}
                    type="button"
                    onClick={() => toggleVibe(vibe)}
                    className={`text-[11px] px-2.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                      active
                        ? "bg-gradient-to-r from-neon-pink to-neon-magenta text-white border-transparent font-bold"
                        : "bg-dark-alt text-gray-400 border-dark-border hover:text-white"
                    }`}
                  >
                    #{vibe}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Save & Reset buttons */}
        <div className="flex flex-col gap-3">
          <button
            type="submit"
            className="w-full cursor-pointer py-4 rounded-xl font-display font-extrabold text-black bg-gradient-to-r from-neon-pink to-neon-lime hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 text-sm shadow-md"
          >
            {savedSuccess ? (
              <>
                Modifications Enregistrées ! <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                Enregistrer mon Profil <Save className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3 rounded-xl font-display font-bold text-gray-400 bg-transparent border border-dark-border/80 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/50 transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer focus:outline-none"
          >
            Se déconnecter de Teeq <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

      </form>
    </div>
  );
}
