import { CityData, User } from "./types";

export const DRC_CITIES: CityData[] = [
  {
    name: "Kinshasa",
    communes: [
      {
        name: "Bandalungwa",
        quartiers: ["Synkin", "Adoula", "Bisengo", "Lubudi", "Makelele", "Kimbondo"]
      },
      {
        name: "Gombe",
        quartiers: ["Golf", "Fleuve", "Gare", "Socimat", "Regina", "Baudouin"]
      },
      {
        name: "Ngaliema",
        quartiers: ["Binza Ozone", "Binza Delvaux", "Ma Campagne", "GB", "Kimbwala", "Joli Parc"]
      },
      {
        name: "Limete",
        quartiers: ["Résidentiel", "Kingabwa", "Industriel", "Salongo", "Mombele"]
      },
      {
        name: "Kasa-Vubu",
        quartiers: ["Asosa", "Anciens Combattants", "Katanga", "Lubumbashi", "Revolu"]
      },
      {
        name: "Lingwala",
        quartiers: ["Singa Mape", "Wenze", "Lokole", "Nybonda", "3 Coqs"]
      }
    ]
  },
  {
    name: "Lubumbashi",
    communes: [
      {
        name: "Lubumbashi",
        quartiers: ["Lido", "Golf", "Baudouin", "Kiwele", "Gambela", "Carrefour"]
      },
      {
        name: "Kampemba",
        quartiers: ["Industriel", "Kalebuka", "Luano", "Kafubu"]
      },
      {
        name: "Ruashi",
        quartiers: ["Kalukuluku", "Luilu", "Ruashi", "Matshipisha"]
      },
      {
        name: "Annexes",
        quartiers: ["Kasapa", "Joli Site", "Navundu", "Kisanga"]
      }
    ]
  },
  {
    name: "Goma",
    communes: [
      {
        name: "Goma",
        quartiers: ["Katindo", "Himbi", "Les Volcans", "Mikeno", "Mapendo", "Lac Vert", "Birere"]
      },
      {
        name: "Karisimbi",
        quartiers: ["Ndosho", "Kasika", "Mabanga-Nord", "Majengo", "Mabanga-Sud", "Kyeshero"]
      }
    ]
  },
  {
    name: "Bukavu",
    communes: [
      {
        name: "Ibanda",
        quartiers: ["La Botte", "Nyakaliba", "Panzi", "Ndorola", "Muhungu"]
      },
      {
        name: "Kadutu",
        quartiers: ["Nyamugo", "Kajangu", "Cahi", "Kasali"]
      }
    ]
  }
];

export const AVAILABLE_VIBES = [
  "Rumba",
  "Sape",
  "Amapiano",
  "Gaming",
  "Code",
  "Ciné",
  "Design",
  "Food",
  "Sport",
  "Photo",
  "Livre",
  "Aéro",
  "Politique",
  "Spontané"
];

export const NEARBY_MOCK_USERS: User[] = [
  {
    id: "TEEQ-772-KIN",
    username: "Davy",
    age: 22,
    gender: "Homme",
    city: "Kinshasa",
    commune: "Bandalungwa",
    quartier: "Synkin",
    bio: "Sapeur dans l'âme, passionné de rumba et amapiano. On se capte à Bandal pour un verre et refaire le monde ? Toujours propre sur moi 😎🎸",
    avatar: "🕺",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&h=600&q=80",
    vibes: ["Sape", "Rumba", "Amapiano", "Sport"],
    distance: 12,
    isSimulated: true,
    personalityType: "davy"
  },
  {
    id: "TEEQ-319-KIN",
    username: "Naomi",
    age: 21,
    gender: "Femme",
    city: "Kinshasa",
    commune: "Gombe",
    quartier: "Socimat",
    bio: "Étudiante en archi d'intérieur, café addict ☕. Si tu aimes parler d'art, de photographie ou de sneakers, tu es au bon endroit ! Vibe calme et peace ✨",
    avatar: "🎨",
    photoUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&h=600&q=80",
    vibes: ["Design", "Photo", "Food", "Ciné"],
    distance: 45,
    isSimulated: true,
    personalityType: "naomi"
  },
  {
    id: "TEEQ-552-GOM",
    username: "Esther",
    age: 23,
    gender: "Femme",
    city: "Goma",
    commune: "Goma",
    quartier: "Himbi",
    bio: "Amoureuse de la nature sauvage, randonnées au volcan Nyiragongo, couchers du soleil magiques au bord du Lac Kivu. On chill autour d'une guitare ? 🌋⛵",
    avatar: "⛺",
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&h=600&q=80",
    vibes: ["Sport", "Photo", "Livre", "Spontané"],
    distance: 150,
    isSimulated: true,
    personalityType: "esther"
  },
  {
    id: "TEEQ-911-LUB",
    username: "Christian",
    age: 26,
    gender: "Homme",
    city: "Lubumbashi",
    commune: "Lubumbashi",
    quartier: "Golf",
    bio: "Entrepreneur, grand fan du TP Mazembe ⚽, amateur de Kamundele (brochettes) bien épicé. Cherche des têtes rafraîchissantes pour de vrais projets et d'humour.",
    avatar: "🦁",
    photoUrl: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=600&h=600&q=80",
    vibes: ["Sport", "Food", "Gaming", "Politique"],
    distance: 280,
    isSimulated: true,
    personalityType: "christian"
  },
  {
    id: "TEEQ-428-KIN",
    username: "Glody",
    age: 24,
    gender: "Homme",
    city: "Kinshasa",
    commune: "Ngaliema",
    quartier: "Ma Campagne",
    bio: "Dev fullstack de nuit 💻, passionné de tech et de prod musicale. Actuellement en train de composer de l'afro-house d'un autre niveau. Viens on tchat !",
    avatar: "💻",
    photoUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=600&h=600&q=80",
    vibes: ["Code", "Gaming", "Amapiano", "Design"],
    distance: 98,
    isSimulated: true,
    personalityType: "glody"
  },
  {
    id: "TEEQ-109-KIN",
    username: "Prisca",
    age: 20,
    gender: "Femme",
    city: "Kinshasa",
    commune: "Limete",
    quartier: "Résidentiel",
    bio: "Souriante, fan inconditionnelle de rumba classique (Fally, Madilu System) et de fufu chaud. Je ris à toutes les blagues, viens tester ma bonne humeur ! 😄",
    avatar: "🎶",
    photoUrl: "https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?auto=format&fit=crop&w=600&h=600&q=80",
    vibes: ["Rumba", "Food", "Livre", "Ciné"],
    distance: 14,
    isSimulated: true,
    personalityType: "prisca"
  }
];

export const CHAT_BOT_RESPONSES: Record<string, string[]> = {
  davy: [
    "Eza makasi ! Salut l'ami, comment se passe ta journée à [Commune] ? Quelle est la bonne humeur ?",
    "Ah Bandal eza toujours chaud ! Tu connais un bon coin sympa là-bas ou on improvise une petite sape ?",
    "S'enja grave ! Le style, la fraîcheur et la bonne musique, c'est l'essence même de Kinshasa. Tu t'y connais ?"
  ],
  naomi: [
    "Coucou ! Ravie que notre vibe se soit synchronisée ✨. Tu es aussi de passage ou tu habites dans le coin ?",
    "Le design et la lumière rdc, c'est toute une poésie. Est-ce que tu prends souvent des photos par ici ?",
    "Carrément ! J'adore tester les nouveaux spots chill. On devrait aller prendre un café un de ces quatre !"
  ],
  esther: [
    "Salut toi ! J'espère que tu as une superbe énergie aujourd'hui. Le lac est magnifique sous ce ciel calme.",
    "Randonner c'est ma thérapie ! Le volcan reste majestueux. Tu es plutôt nature ou restau branché ?",
    "Génial ! On partage tellement de vibes en commun. On se capte bientôt pour chanter ?"
  ],
  christian: [
    "Salut chef ! Très content du match. Comment va ta commune ? Lubum ou Kin, la force reste la même.",
    "Ici au Golf on est bien, mais rien ne vaut un bon match de foot ensemble avec des Kamundele au barbecue !",
    "Absolument, l'authenticité d'abord. On garde le contact pour se caler un plan réel ?"
  ],
  glody: [
    "Hey ! Tu as trouvé mon twin ID ou c'est la proximité ? En tout cas, le ping est parfait ⚡.",
    "MDR je suis en train de debugger un bug de CSS insupportable en écoutant de l'amapiano. Tu codes aussi ?",
    "Ah ah yes ! On fait parler les ondes. Écris-moi dès que tu as une minute libre, on se fait un call !"
  ],
  prisca: [
    "Allô ! Comment tu vas ? 😄 ton profil a l'air tellement cool, je devais absolument swiper !",
    "Lol oui ! La musique guérit tout, surtout une bonne rumba nostalgique. Quelle est ta chanson préférée ?",
    "Grave ! Rions un peu, la vie à Kinshasa est trop courte pour bouder ! À très bientôt j'espère."
  ],
  generic: [
    "Salut ! La vibe teeq est connectée ⚡",
    "Trop cool d'être matchés ! Tu es dans quel quartier en ce moment ?",
    "Impeccable. Dis-moi, tu écoutes quoi comme son en ce moment ?"
  ]
};
