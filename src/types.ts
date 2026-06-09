export interface User {
  id: string; // Special App ID: TEEQ-XXXX-DRC
  username: string;
  age: number;
  gender: 'Homme' | 'Femme' | 'Non-binaire';
  city: string;
  commune: string;
  quartier: string;
  bio: string;
  avatar: string; // Emoji character or URL
  photoUrl?: string; // High-resolution profile portrait URL
  vibes: string[]; // List of hashtags
  distance?: number; // In meters
  isSimulated?: boolean;
  personalityType?: string; // Custom reply behavior
}

export interface Match {
  id: string;
  user: User;
  timestamp: string;
  lastMessage?: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string; // "me" or matching unique ID
  text: string;
  timestamp: string;
}

export interface CommuneData {
  name: string;
  quartiers: string[];
}

export interface CityData {
  name: string;
  communes: CommuneData[];
}
