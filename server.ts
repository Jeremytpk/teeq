import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Firestore } from "@google-cloud/firestore";

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

// Initialize Firestore
let dbClient: Firestore | null = null;
let useFirestore = false;

try {
  dbClient = new Firestore();
  useFirestore = true;
  console.log("SUCCESS: Cloud Firestore initialization check. Verifying live API on first read/write...");
} catch (e: any) {
  console.warn("WARNING: Firestore initiation skipped. Defaulting to teeq_db.json local storage. Reason:", e?.message);
  useFirestore = false;
  dbClient = null;
}

// Global catcher to detect API access permissions and automatically degrade gracefully
function handleDBCatch(err: any, context: string) {
  const errMsg = String(err?.message || err || "");
  console.warn(`Firestore ${context} fell back to JSON:`, errMsg);

  if (
    errMsg.includes("PERMISSION_DENIED") ||
    errMsg.includes("has not been used") ||
    errMsg.includes("disabled") ||
    errMsg.includes("7")
  ) {
    if (useFirestore) {
      console.warn("CRITICAL DETECTED: Firestore is not enabled or permission is denied on this GCP project. Automatically transitioning system to high-availability local teeq_db.json sync for the remaining lifetime of this process. This resolves all potential latency or permission issues.");
      useFirestore = false;
      dbClient = null;
    }
  }
}

// Database Abstraction Layer supporting seamless Firestore + Local JSON fallback
const DB = {
  async upsertUser(user: any): Promise<void> {
    const timestamp = Date.now();
    if (useFirestore && dbClient) {
      try {
        await dbClient.collection("users").doc(user.id).set({
          ...user,
          lastActive: timestamp
        }, { merge: true });
        return;
      } catch (err) {
        handleDBCatch(err, "user upsert");
      }
    }
    const state = loadState();
    state.users[user.id] = { ...user, lastActive: timestamp };
    saveState(state);
  },

  async markActive(userId: string): Promise<boolean> {
    const timestamp = Date.now();
    if (useFirestore && dbClient) {
      try {
        const userRef = dbClient.collection("users").doc(userId);
        const doc = await userRef.get();
        if (doc.exists) {
          await userRef.set({ lastActive: timestamp }, { merge: true });
          return true;
        }
        return false;
      } catch (err) {
        handleDBCatch(err, "markActive");
      }
    }
    const state = loadState();
    if (state.users[userId]) {
      state.users[userId].lastActive = timestamp;
      saveState(state);
      return true;
    }
    return false;
  },

  async getOnlineUsers(excludeUserId: string, now: number, timeout: number): Promise<any[]> {
    if (useFirestore && dbClient) {
      try {
        const usersSnap = await dbClient.collection("users")
          .where("lastActive", ">", now - timeout)
          .get();
        return usersSnap.docs
          .map(doc => doc.data())
          .filter((u: any) => u.id !== excludeUserId);
      } catch (err) {
        handleDBCatch(err, "getOnlineUsers");
      }
    }
    const state = loadState();
    return Object.values(state.users).filter(
      (u) => u.id !== excludeUserId && now - u.lastActive < timeout
    );
  },

  async getSyncData(userId: string, now: number, timeout: number) {
    let onlineUsers: any[] = [];
    let matches: any[] = [];
    let messages: any[] = [];
    let registered = false;

    if (useFirestore && dbClient) {
      try {
        registered = await this.markActive(userId);

        // Retrieve active people
        onlineUsers = await this.getOnlineUsers(userId, now, timeout);

        // Fetch matches involving the user
        const [matchSnap1, matchSnap2] = await Promise.all([
          dbClient.collection("matches").where("user1Id", "==", userId).get(),
          dbClient.collection("matches").where("user2Id", "==", userId).get(),
        ]);

        const matchesRaw = [
          ...matchSnap1.docs.map(doc => doc.data()),
          ...matchSnap2.docs.map(doc => doc.data()),
        ];

        // Resolve alternate peer details
        matches = await Promise.all(matchesRaw.map(async (m: any) => {
          const peerId = m.user1Id === userId ? m.user2Id : m.user1Id;
          const peerDoc = await dbClient!.collection("users").doc(peerId).get();
          const peerProfile = peerDoc.exists ? peerDoc.data() : {
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
            unreadCount: 0,
          };
        }));

        // Retrieve messages for active matches
        const matchIds = matchesRaw.map(m => m.id);
        if (matchIds.length > 0) {
          const msgSnaps = await Promise.all(matchIds.map(mid =>
            dbClient!.collection("messages").where("matchId", "==", mid).get()
          ));
          messages = msgSnaps.flatMap(snap => snap.docs.map(doc => doc.data()));
        }

        return { onlineUsers, matches, messages, registered };
      } catch (err) {
        handleDBCatch(err, "sync");
      }
    }

    // JSON Fallback logic
    const state = loadState();
    registered = state.users[userId] ? true : false;
    if (registered) {
      state.users[userId].lastActive = now;
      saveState(state);
    }

    onlineUsers = Object.values(state.users).filter(
      (u) => u.id !== userId && now - u.lastActive < timeout
    );

    const matchesRaw = state.matches.filter(
      (m) => m.user1Id === userId || m.user2Id === userId
    );

    matches = matchesRaw.map((m) => {
      const peerId = m.user1Id === userId ? m.user2Id : m.user1Id;
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
        unreadCount: 0,
      };
    });

    const matchIds = matchesRaw.map((m) => m.id);
    messages = state.messages.filter((m) => matchIds.includes(m.matchId));

    return { onlineUsers, matches, messages, registered };
  },

  async submitLike(fromId: string, toId: string) {
    if (useFirestore && dbClient) {
      try {
        const docId = `${fromId}_${toId}`;
        await dbClient.collection("likes").doc(docId).set({
          fromId,
          toId,
          timestamp: Date.now()
        });

        // Check reciprocity cleanly
        const reciprocalDoc = await dbClient.collection("likes").doc(`${toId}_${fromId}`).get();
        const reciprocal = reciprocalDoc.exists;
        let matchCreated = false;
        let matchRecord: any = null;

        if (reciprocal) {
          const matchId = fromId < toId ? `match_${fromId}_${toId}` : `match_${toId}_${fromId}`;
          const matchDoc = await dbClient.collection("matches").doc(matchId).get();
          if (!matchDoc.exists) {
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
            await dbClient.collection("matches").doc(matchId).set(matchRecord);
            matchCreated = true;
          } else {
            matchRecord = matchDoc.data();
          }
        }
        return { matchCreated, match: matchRecord };
      } catch (err) {
        handleDBCatch(err, "submitLike");
      }
    }

    // JSON Fallback logic
    const state = loadState();
    const exists = state.likes.some((l) => l.fromId === fromId && l.toId === toId);
    if (!exists) {
      state.likes.push({ fromId, toId, timestamp: Date.now() });
    }

    const reciprocal = state.likes.some((l) => l.fromId === toId && l.toId === fromId);
    let matchCreated = false;
    let matchRecord: any = null;

    if (reciprocal) {
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
      } else {
        matchRecord = matchExists;
      }
    }

    saveState(state);
    return { matchCreated, match: matchRecord };
  },

  async saveMessage(matchId: string, senderId: string, text: string) {
    const timestampStr = new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    const newMessage = {
      id: messageId,
      matchId,
      senderId,
      text,
      timestamp: timestampStr,
      timestampMs: Date.now(),
    };

    if (useFirestore && dbClient) {
      try {
        await Promise.all([
          dbClient.collection("messages").doc(messageId).set(newMessage),
          dbClient.collection("matches").doc(matchId).set({ lastMessage: text }, { merge: true }),
        ]);
        return newMessage;
      } catch (err) {
        handleDBCatch(err, "saveMessage");
      }
    }

    // JSON Fallback logic
    const state = loadState();
    state.messages.push(newMessage);
    state.matches = state.matches.map((m) => {
      if (m.id === matchId) {
        return { ...m, lastMessage: text };
      }
      return m;
    });
    saveState(state);
    return newMessage;
  },

  async twinLookup(searchId: string, selfId: string) {
    const formattedSearchId = searchId.trim().toUpperCase();

    if (useFirestore && dbClient) {
      try {
        const userDoc = await dbClient.collection("users").doc(formattedSearchId).get();
        if (userDoc.exists) {
          const u = userDoc.data();
          const live = Date.now() - u!.lastActive < 120 * 1000;
          if (live && u!.id !== selfId) {
            return u;
          }
        }
        return null;
      } catch (err) {
        handleDBCatch(err, "twinLookup");
      }
    }

    // JSON Fallback logic
    const state = loadState();
    return Object.values(state.users).find(
      (u) => u.id.toUpperCase() === formattedSearchId && u.id !== selfId
    ) || null;
  },

  async clear() {
    if (useFirestore && dbClient) {
      try {
        const collections = ["users", "likes", "matches", "messages"];
        for (const col of collections) {
          const snapshot = await dbClient.collection(col).limit(100).get();
          const batch = dbClient.batch();
          snapshot.docs.forEach((doc) => batch.delete(doc.ref));
          await batch.commit();
        }
      } catch (err) {
        handleDBCatch(err, "clear");
      }
    }
    saveState({ users: {}, likes: [], matches: [], messages: [] });
  }
};

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
  app.post("/api/heartbeat", async (req, res) => {
    const { user } = req.body;
    if (!user || !user.id) {
      return res.status(400).json({ error: "User profile details required with ID" });
    }

    await DB.upsertUser(user);
    res.json({ success: true });
  });

  // 3. Real-time active items sync (online users, messages, likes, matches)
  app.get("/api/sync", async (req, res) => {
    const { userId } = req.query;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "Missing required query string: userId" });
    }

    const now = Date.now();
    const ACTIVE_TIMEOUT = 120 * 1000; // 2 minutes active window

    const syncData = await DB.getSyncData(userId, now, ACTIVE_TIMEOUT);
    res.json(syncData);
  });

  // 4. Register a Like/Vibe & detect mutual match
  app.post("/api/like", async (req, res) => {
    const { fromId, toId } = req.body;
    if (!fromId || !toId) {
      return res.status(400).json({ error: "fromId and toId are required" });
    }

    const result = await DB.submitLike(fromId, toId);
    res.json(result);
  });

  // 5. Send message across peer channels
  app.post("/api/messages", async (req, res) => {
    const { matchId, senderId, text } = req.body;
    if (!matchId || !senderId || !text) {
      return res.status(400).json({ error: "Missing required properties: matchId, senderId, text" });
    }

    const newMessage = await DB.saveMessage(matchId, senderId, text);
    res.json({ success: true, message: newMessage });
  });

  // 6. Direct lookup of active real online users via Twin ID
  app.post("/api/twin-lookup", async (req, res) => {
    const { searchId, selfId } = req.body;
    if (!searchId) {
      return res.status(400).json({ error: "searchId is required" });
    }

    const matchedUser = await DB.twinLookup(searchId, selfId);
    res.json({ user: matchedUser });
  });

  // 7. Reset simulation database
  app.post("/api/reset-db", async (req, res) => {
    await DB.clear();
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
