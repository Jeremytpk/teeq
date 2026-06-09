import React, { useState, useEffect } from "react";
import { User } from "../types";
import { DRC_CITIES, AVAILABLE_VIBES } from "../data";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, MapPin, UserCheck, ShieldAlert, Key, Heart, Eye, EyeOff } from "lucide-react";

interface AuthProps {
  onLoginSuccess: (user: User) => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
  // Modes: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  
  // Basic Fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [age, setAge] = useState<number>(20);
  const [gender, setGender] = useState<'Homme' | 'Femme' | 'Non-binaire'>('Femme');
  
  // Location Fields
  const [selectedCityName, setSelectedCityName] = useState("Kinshasa");
  const [selectedCommuneName, setSelectedCommuneName] = useState("Bandalungwa");
  const [selectedQuartier, setSelectedQuartier] = useState("Synkin");

  // Vibe interests
  const [selectedVibes, setSelectedVibes] = useState<string[]>(["Rumba", "Spontané"]);

  // Custom visual Avatar
  const [selectedAvatar, setSelectedAvatar] = useState("✨");

  // Errors / feedback
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  const availableAvatars = ["✨", "🕺", "🎨", "🎶", "💻", "🕶️", "🍕", "🦊", "🍿", "🥑", "🎮", "🏎️", "⚽", "🍭", "🎧", "🦄"];

  // Find communes / quartiers for current selection
  const currentCity = DRC_CITIES.find(c => c.name === selectedCityName) || DRC_CITIES[0];
  const communes = currentCity.communes;
  const currentCommune = communes.find(cm => cm.name === selectedCommuneName) || communes[0];
  const quartiers = currentCommune?.quartiers || [];

  // Reset defaults when city or commune changes
  useEffect(() => {
    if (communes.length > 0) {
      setSelectedCommuneName(communes[0].name);
    }
  }, [selectedCityName]);

  useEffect(() => {
    if (currentCommune && currentCommune.quartiers.length > 0) {
      setSelectedQuartier(currentCommune.quartiers[0]);
    } else {
      setSelectedQuartier("");
    }
  }, [selectedCommuneName, selectedCityName]);

  const toggleVibe = (vibe: string) => {
    if (selectedVibes.includes(vibe)) {
      setSelectedVibes(prev => prev.filter(v => v !== vibe));
    } else {
      if (selectedVibes.length < 5) {
        setSelectedVibes(prev => [...prev, vibe]);
      } else {
        setErrorText("Tu peux choisir au maximum 5 vibes musicales/styles ! Keep it focused !");
        setTimeout(() => setErrorText(""), 4000);
      }
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");

    if (!username.trim() || !password.trim()) {
      setErrorText("Veuillez remplir tous les champs requis !");
      return;
    }

    if (username.length < 3) {
      setErrorText("Le nom d'utilisateur doit faire au moins 3 caractères.");
      return;
    }

    if (password.length < 4) {
      setErrorText("Le mot de passe doit faire au moins 4 caractères.");
      return;
    }

    setLoading(true);

    if (authMode === "register") {
      // Age Check between 18 to 80
      if (age < 18 || age > 80) {
        setErrorText("L'âge requis sur teeq doit être impérativement entre 18 et 80 ans.");
        setLoading(false);
        return;
      }

      // Generate a cool unique App ID
      const randomID = Math.floor(100 + Math.random() * 900); // 3 digits
      const cityCode = selectedCityName.substring(0, 3).toUpperCase();
      const generatedTeeqID = `TEEQ-${randomID}-${cityCode}`;

      const newUser: User = {
        id: generatedTeeqID,
        username: username.trim(),
        age,
        gender,
        city: selectedCityName,
        commune: selectedCommuneName,
        quartier: selectedQuartier,
        bio: `Salut ! Moi c'est ${username.trim()}, fier habitant de ${selectedCommuneName}. Vibe et complicité garanties ⚡`,
        avatar: selectedAvatar,
        vibes: selectedVibes,
        isSimulated: false
      };

      // Store in LocalStorage and notify parent
      localStorage.setItem("teeq_user", JSON.stringify(newUser));
      localStorage.setItem(`teeq_pwd_${username.trim().toLowerCase()}`, password);
      
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess(newUser);
      }, 1000);

    } else {
      // Login flow
      const savedPwd = localStorage.getItem(`teeq_pwd_${username.trim().toLowerCase()}`);
      const savedProfileStr = localStorage.getItem("teeq_user");
      
      if (savedPwd === password) {
        if (savedProfileStr) {
          const user = JSON.parse(savedProfileStr) as User;
          // Just double check it matches the logged in user, otherwise generate a fit profile
          if (user.username.toLowerCase() === username.trim().toLowerCase()) {
            setTimeout(() => {
              setLoading(false);
              onLoginSuccess(user);
            }, 8000);
            return;
          }
        }
        
        // Generate fallback profile if password matched but user info is missing
        const randomID = Math.floor(100 + Math.random() * 900);
        const fallbackUser: User = {
          id: `TEEQ-${randomID}-KIN`,
          username: username.trim(),
          age: 23,
          gender: "Homme",
          city: "Kinshasa",
          commune: "Gombe",
          quartier: "Socimat",
          bio: "Heureux d'être de retour sur teeq ! Discutons !",
          avatar: "🕶️",
          vibes: ["Rumba", "Amapiano"],
          isSimulated: false
        };
        localStorage.setItem("teeq_user", JSON.stringify(fallbackUser));
        setTimeout(() => {
          setLoading(false);
          onLoginSuccess(fallbackUser);
        }, 800);
      } else {
        setTimeout(() => {
          setLoading(false);
          setErrorText("Nom d'utilisateur ou mot de passe incorrect. Re-vérifie tes identifiants ! (Ou crée un compte)");
        }, 800);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 w-full relative">
      {/* Background radial overlays */}
      <div className="absolute top-[20%] left-[-10%] w-72 h-72 bg-neon-lime/10 blur-[90px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-72 h-72 bg-neon-pink/10 blur-[90px] rounded-full pointer-events-none" />

      {/* Title */}
      <div className="flex flex-col items-center mb-8 text-center z-10 select-none">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-neon-pink to-neon-lime flex items-center justify-center font-display font-black text-black text-2xl shadow-lg">t</span>
          <h1 className="font-display font-black text-4xl tracking-tighter text-white">teeq</h1>
        </div>
        <p className="text-xs text-lime-400 uppercase font-mono tracking-widest font-bold">Vibration & Proximité • DRC</p>
      </div>

      {/* Main card */}
      <motion.div 
        layout
        className="w-full max-w-md bg-dark-card border border-dark-border p-6 rounded-3xl shadow-xl z-10"
      >
        {/* Toggle headers */}
        <div className="flex bg-dark-bg p-1 rounded-2xl border border-dark-border mb-6">
          <button
            type="button"
            onClick={() => { setAuthMode("register"); setErrorText(""); }}
            className={`flex-1 py-3 text-center rounded-xl text-xs font-display font-bold transition-all cursor-pointer ${
              authMode === "register" ? "bg-dark-alt text-white border border-dark-border shadow-md" : "text-gray-400 hover:text-gray-300"
            }`}
          >
            S'inscrire
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode("login"); setErrorText(""); }}
            className={`flex-1 py-3 text-center rounded-xl text-xs font-display font-bold transition-all cursor-pointer ${
              authMode === "login" ? "bg-dark-alt text-white border border-dark-border shadow-md" : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Se connecter
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {/* Error notifications */}
          <AnimatePresence>
            {errorText && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-red-900/40 border border-red-500/50 text-red-200 rounded-xl text-xs flex items-center gap-2 font-medium"
              >
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorText}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 ml-1">Nom d'utilisateur</label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: Glody_Kin"
                className="w-full bg-dark-bg border border-dark-border focus:border-neon-lime rounded-2xl px-4 py-3.5 pl-10 text-sm text-white focus:outline-none transition-all placeholder:text-gray-600 font-medium"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-gray-300">Mot de passe</label>
              {authMode === "register" && <span className="text-[10px] text-gray-500">(Min. 4 cars)</span>}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-dark-bg border border-dark-border focus:border-neon-lime rounded-2xl px-4 py-3.5 pl-10 pr-10 text-sm text-white focus:outline-none transition-all placeholder:text-gray-600 font-mono"
              />
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Additional Register Fields */}
          {authMode === "register" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* Grid: Age & Genre */}
              <div className="grid grid-cols-2 gap-4">
                {/* Age Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 ml-1">Âge: <span className="text-neon-lime">{age} ans</span></label>
                  <input
                    type="range"
                    min="18"
                    max="80"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value))}
                    className="w-full accent-neon-lime cursor-pointer bg-dark-bg h-2.5 rounded-lg border border-dark-border"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>18</span>
                    <span>80 ans</span>
                  </div>
                </div>

                {/* Genre Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 ml-1">Genre</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-dark-bg border border-dark-border focus:border-neon-lime rounded-2xl px-3 py-3 text-xs text-white focus:outline-none focus:ring-0 cursor-pointer"
                  >
                    <option value="Femme">Femme</option>
                    <option value="Homme">Homme</option>
                    <option value="Non-binaire">Autre</option>
                  </select>
                </div>
              </div>

              {/* Avatar Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 ml-1">Choisis ton Badge / Avatar</label>
                <div className="flex gap-2 p-2 bg-dark-bg rounded-2xl border border-dark-border overflow-x-auto no-scrollbar py-2.5">
                  {availableAvatars.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`text-xl p-2 rounded-xl border transition-all shrink-0 cursor-pointer hover:bg-dark-alt ${
                        selectedAvatar === av ? "bg-neon-lime/20 border-neon-lime transform scale-110" : "border-transparent text-gray-400"
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* DRC Location Selectors */}
              <div className="space-y-3 p-3 bg-dark-bg border border-dark-border rounded-2xl">
                <div className="flex items-center gap-1 text-xs font-mono font-bold text-neon-lime ml-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>LOCALISATION EN R.D. CONGO</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* City Select */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Ville</span>
                    <select
                      value={selectedCityName}
                      onChange={(e) => setSelectedCityName(e.target.value)}
                      className="w-full bg-dark-card border border-dark-border rounded-xl p-2 text-xs text-white focus:outline-none cursor-pointer font-medium"
                    >
                      {DRC_CITIES.map(city => (
                        <option key={city.name} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Commune Select */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Commune</span>
                    <select
                      value={selectedCommuneName}
                      onChange={(e) => setSelectedCommuneName(e.target.value)}
                      className="w-full bg-dark-card border border-dark-border rounded-xl p-2 text-xs text-white focus:outline-none cursor-pointer font-medium animate-none"
                    >
                      {communes.map(comm => (
                        <option key={comm.name} value={comm.name}>{comm.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quartier Input / Pick */}
                <div className="space-y-1 mt-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Quartier</span>
                  <select
                    value={selectedQuartier}
                    onChange={(e) => setSelectedQuartier(e.target.value)}
                    className="w-full bg-dark-card border border-dark-border rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer font-medium"
                  >
                    {quartiers.map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vibes Selector */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <span className="text-xs font-bold text-gray-300">Sélectionne tes Vibes ({selectedVibes.length}/5)</span>
                  <span className="text-[10px] font-mono text-gray-500">Style & Son</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-dark-bg border border-dark-border rounded-2xl no-scrollbar">
                  {AVAILABLE_VIBES.map((vibe) => {
                    const active = selectedVibes.includes(vibe);
                    return (
                      <button
                        key={vibe}
                        type="button"
                        onClick={() => toggleVibe(vibe)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                          active
                            ? "bg-gradient-to-r from-neon-pink to-neon-magenta text-white border-transparent font-semibold shadow-sm"
                            : "bg-dark-alt text-gray-400 border-dark-border hover:text-white"
                        }`}
                      >
                        #{vibe}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer py-4 rounded-2xl font-display font-extrabold text-black bg-gradient-to-r from-neon-pink to-neon-lime hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm md:text-base leading-none shadow-lg mt-2 focus:outline-none"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : authMode === "register" ? (
              <>
                S'inscrire et Découvrir <Heart className="w-4 h-4 fill-black" />
              </>
            ) : (
              <>
                Se connecter à teeq <UserCheck className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Note about Privacy and Community Rules */}
      <p className="text-[10px] text-gray-500 mt-6 text-center max-w-[280px] leading-relaxed select-none">
        En rejoignant teeq, vous acceptez de respecter notre charte communautaire : respect total, bienveillance et vibrations positives en RDC.
      </p>
    </div>
  );
}
