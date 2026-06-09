import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface OnlineUser {
  id: string; // The user's Teeq ID (e.g. TEEQ-123-ABC)
  username: string;
  age: number;
  gender: string;
  city: string;
  commune: string;
  quartier: string;
  bio: string;
  avatar: string;
  vibes: string[];
  lastActive: number; // UTC timestamp of last heartbeat
}

interface Like {
  fromId: string;
  toId: string;
  timestamp: number;
}

interface DBState {
  users: Record<string, OnlineUser>;
  likes: Like[];
  matches: Array<{
    id: string;
    user1Id: string;
    user2Id: string;
    timestamp: string;
    lastMessage?: string;
  }>;
  messages: Array<{
    id: string;
    matchId: string;
    senderId: string;
    text: string;
    timestamp: string;
    timestampMs: number;
  }>;
}

const DB_FILE = path.join(process.cwd(), "teeq_db.json");

// Helper to load/save state
function loadState(): DBState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Could not read teeq_db.json, starting fresh", e);
  }
  return { users: {}, likes: [], matches: [], messages: [] };
}

function saveState(state: DBState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.error("Could not save to teeq_db.json", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS middleware for cross-origin deployments (like Netlify)
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // 1. Healthcheck endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // 2. Heartbeat to report device presence and profile details
  app.post("/api/heartbeat", (req, res) => {
    const { user } = req.body;
    if (!user || !user.id) {
      return res.status(400).json({ error: "User profile details required with ID" });
    }

    const state = loadState();
    
    // Upsert user profile & mark active
    state.users[user.id] = {
      ...user,
      lastActive: Date.now(),
    };

    saveState(state);
    res.json({ success: true });
  });

  // 3. Real-time active items sync (online users, messages, likes, matches)
  app.get("/api/sync", (req, res) => {
    const { userId } = req.query;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "Missing required query string: userId" });
    }

    const state = loadState();
    const now = Date.now();
    const ACTIVE_TIMEOUT = 120 * 1000; // 2 minutes active window

    // Mark current user as active since they are syncing
    let registered = true;
    if (state.users[userId]) {
      state.users[userId].lastActive = now;
      saveState(state);
    } else {
      registered = false;
    }

    // Retrieve active people (last active < 2 mins ago) excluding current user
    const onlineUsers = Object.values(state.users).filter(
      (u) => u.id !== userId && now - u.lastActive < ACTIVE_TIMEOUT
    );

    // Retrieve matches that involve the current user
    const matchesRaw = state.matches.filter(
      (m) => m.user1Id === userId || m.user2Id === userId
    );

    // Build the matches data structures with correct profile of the alternate peer
    const matchedProfiles = matchesRaw.map((m) => {
      const peerId = m.user1Id === userId ? m.user2Id : m.user1Id;
      // Resolve peer user details (fallback to simulation or placeholder if offline/removed)
      const peerProfile = state.users[peerId] || {
        id: peerId,
        username: "Utilisateur Teeq",
        avatar: "👤",
        age: 20,
        gender: "Homme",
        city: "Kinshasa",
        commune: "Gombe",
        quartier: "Centre",
        bio: "Ancien utilisateur Teeq.",
        vibes: ["vibe"],
      };

      return {
        id: m.id,
        user: peerProfile,
        timestamp: m.timestamp,
        lastMessage: m.lastMessage,
        unreadCount: 0, // client side unread tracker increment
      };
    });

    // Obtain all messages for matches the user is part of
    const matchIds = matchesRaw.map((m) => m.id);
    const messages = state.messages.filter((m) => matchIds.includes(m.matchId));

    res.json({
      onlineUsers,
      matches: matchedProfiles,
      messages,
      registered,
    });
  });

  // 4. Register a Like/Vibe & detect mutual match
  app.post("/api/like", (req, res) => {
    const { fromId, toId } = req.body;
    if (!fromId || !toId) {
      return res.status(400).json({ error: "fromId and toId are required" });
    }

    const state = loadState();
    
    // Fast deduplication of likes
    const exists = state.likes.some((l) => l.fromId === fromId && l.toId === toId);
    if (!exists) {
      state.likes.push({ fromId, toId, timestamp: Date.now() });
    }

    // Check for reciprocity
    const reciprocal = state.likes.some((l) => l.fromId === toId && l.toId === fromId);
    let matchCreated = false;
    let matchRecord = null;

    if (reciprocal) {
      // Check if Match already exists
      const matchExists = state.matches.find(
        (m) =>
          (m.user1Id === fromId && m.user2Id === toId) ||
          (m.user1Id === toId && m.user2Id === fromId)
      );

      if (!matchExists) {
        const matchId = `match_${Date.now()}`;
        const timeNowStr = new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        matchRecord = {
          id: matchId,
          user1Id: fromId,
          user2Id: toId,
          timestamp: timeNowStr,
          lastMessage: `Vibe synchronisée en direct !`,
        };

        state.matches.push(matchRecord);
        matchCreated = true;
      }
    }

    saveState(state);
    res.json({ matchCreated, match: matchRecord });
  });

  // 5. Send message across peer channels
  app.post("/api/messages", (req, res) => {
    const { matchId, senderId, text } = req.body;
    if (!matchId || !senderId || !text) {
      return res.status(400).json({ error: "Missing required properties: matchId, senderId, text" });
    }

    const state = loadState();
    const timestampStr = new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      matchId,
      senderId,
      text,
      timestamp: timestampStr,
      timestampMs: Date.now(),
    };

    state.messages.push(newMessage);

    // Update match's last message
    state.matches = state.matches.map((m) => {
      if (m.id === matchId) {
        return { ...m, lastMessage: text };
      }
      return m;
    });

    saveState(state);
    res.json({ success: true, message: newMessage });
  });

  // 6. Direct lookup of active real online users via Twin ID
  app.post("/api/twin-lookup", (req, res) => {
    const { searchId, selfId } = req.body;
    if (!searchId) {
      return res.status(400).json({ error: "searchId is required" });
    }

    const state = loadState();
    const formattedSearchId = searchId.trim().toUpperCase();

    // Look for users matching this custom Teeq ID (who were active recently)
    const matchedUser = Object.values(state.users).find(
      (u) => u.id.toUpperCase() === formattedSearchId && u.id !== selfId
    );

    res.json({ user: matchedUser || null });
  });

  // 7. Reset simulation database
  app.post("/api/reset-db", (req, res) => {
    saveState({ users: {}, likes: [], matches: [], messages: [] });
    res.json({ success: true });
  });

  // Setup Vite middleware or production static pathways
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
