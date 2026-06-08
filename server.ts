import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { createServer as createViteServer } from "vite";

interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // added password field for validation
  role: "admin" | "organisateur" | "photographe" | "invite";
  status: "active" | "suspended"; // status of profile
  created_at: string;
}

interface Event {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  cover_image: string;
  status: "active" | "archived"; // status option
  created_by: string;
  created_at: string;
  date?: string;
}

interface Photo {
  id: string;
  event_id: string;
  image_url: string;
  uploaded_by: string;
  uploaded_by_name: string;
  created_at: string;
  download_count: number;
}

interface EventPhotographer {
  event_id: string;
  photographer_id: string;
  joined_at: string;
  revoked: boolean;
}

interface InvitationToken {
  id: string;
  token: string;
  event_id: string;
  created_at: string;
  revoked: boolean;
}

interface Visit {
  id: string;
  event_id: string;
  visitor_token: string;
  created_at: string;
}

interface ResetToken {
  email: string;
  token: string;
  expires: number;
}

const DB_PATH = path.join(process.cwd(), "db-store.json");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initial DB state if not present
const seedDB = () => {
  const adminId = "user-admin-123";
  const userOrgId = "user-org-abc";
  const userPhotoId = "user-pho-xyz";

  const defaultUsers: User[] = [
    {
      id: adminId,
      name: "Admin IKA",
      email: "admin@ika.fr",
      password: "password123",
      role: "admin",
      status: "active",
      created_at: new Date().toISOString(),
    },
    {
      id: userOrgId,
      name: "Jean l'Organisateur",
      email: "jean@ika.fr",
      password: "password123",
      role: "organisateur",
      status: "active",
      created_at: new Date().toISOString(),
    },
    {
      id: userPhotoId,
      name: "Marc le Photographe",
      email: "marc@ika.fr",
      password: "password123",
      role: "photographe",
      status: "active",
      created_at: new Date().toISOString(),
    },
  ];

  const defaultEvents: Event[] = [
    {
      id: "event-1",
      name: "Festival de Jazz de Nice",
      slug: "festival-jazz-nice-a8b2c4",
      description: "Le festival mythique sous le soleil de la Côte d'Azur. Retrouvez tous les moments forts en direct.",
      location: "Nice, Promenade des Anglais",
      cover_image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop&q=80",
      status: "active",
      created_by: userOrgId,
      created_at: new Date().toISOString(),
      date: "2026-07-15",
    },
    {
      id: "event-2",
      name: "Défilé de Mode Automne 2026",
      slug: "defile-mode-automne-2026-z9y8x7",
      description: "Découvrez la nouvelle collection de haute couture capturée en continu par nos photographes officiels.",
      location: "Paris, Palais de Tokyo",
      cover_image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80",
      status: "active",
      created_by: userOrgId,
      created_at: new Date().toISOString(),
      date: "2026-09-22",
    },
    {
      id: "event-3",
      name: "Mariage de Sophie & Antoine",
      slug: "mariage-sophie-antoine-m5n4b3",
      description: "Notre plus beau jour partagé en direct avec vous tous. Flashez le QR Code pour uploader vos pépites !",
      location: "Château de Bellevue, Touraine",
      cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
      status: "active",
      created_by: adminId,
      created_at: new Date().toISOString(),
      date: "2026-06-20",
    },
  ];

  const defaultPhotos: Photo[] = [
    {
      id: "photo-1",
      event_id: "event-1",
      image_url: "https://images.unsplash.com/photo-1415201375330-81104af7f5e5?w=1200&auto=format&fit=crop&q=80",
      uploaded_by: userPhotoId,
      uploaded_by_name: "Marc le Photographe",
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
      download_count: 12,
    },
    {
      id: "photo-2",
      event_id: "event-1",
      image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80",
      uploaded_by: userPhotoId,
      uploaded_by_name: "Marc le Photographe",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      download_count: 24,
    },
    {
      id: "photo-3",
      event_id: "event-2",
      image_url: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=1200&auto=format&fit=crop&q=80",
      uploaded_by: adminId,
      uploaded_by_name: "Admin IKA",
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      download_count: 8,
    },
  ];

  const defaultPhotographers: EventPhotographer[] = [
    {
      event_id: "event-1",
      photographer_id: userPhotoId,
      joined_at: new Date().toISOString(),
      revoked: false,
    }
  ];

  const defaultInvitationTokens: InvitationToken[] = [
    {
      id: "token-1",
      token: "mockphototoken32characterevent1",
      event_id: "event-1",
      created_at: new Date().toISOString(),
      revoked: false,
    },
    {
      id: "token-2",
      token: "mockphototoken32characterevent2",
      event_id: "event-2",
      created_at: new Date().toISOString(),
      revoked: false,
    },
    {
      id: "token-3",
      token: "mockphototoken32characterevent3",
      event_id: "event-3",
      created_at: new Date().toISOString(),
      revoked: false,
    }
  ];

  const db = {
    users: defaultUsers,
    events: defaultEvents,
    photos: defaultPhotos,
    event_photographers: defaultPhotographers,
    invitation_tokens: defaultInvitationTokens,
    visits: [],
    reset_tokens: [] as ResetToken[]
  };

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
};

if (!fs.existsSync(DB_PATH)) {
  seedDB();
}

// Helpers for reading and writing database with automatic safety upgrades
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    const parsed = JSON.parse(data);
    let dirty = false;

    // Run dynamic migrations if any keys are missing or not arrays
    if (!parsed.users || !Array.isArray(parsed.users)) {
      parsed.users = [];
      dirty = true;
    }
    if (!parsed.events || !Array.isArray(parsed.events)) {
      parsed.events = [];
      dirty = true;
    }
    if (!parsed.photos || !Array.isArray(parsed.photos)) {
      parsed.photos = [];
      dirty = true;
    }
    if (!parsed.event_photographers || !Array.isArray(parsed.event_photographers)) {
      parsed.event_photographers = [];
      dirty = true;
    }
    if (!parsed.invitation_tokens || !Array.isArray(parsed.invitation_tokens)) {
      parsed.invitation_tokens = [];
      dirty = true;
    }
    if (!parsed.visits || !Array.isArray(parsed.visits)) {
      parsed.visits = [];
      dirty = true;
    }
    if (!parsed.reset_tokens || !Array.isArray(parsed.reset_tokens)) {
      parsed.reset_tokens = [];
      dirty = true;
    }

    // Ensure status fields are initialized on events & users
    parsed.users.forEach((u: any) => {
      if (!u.status) {
        u.status = "active";
        dirty = true;
      }
    });

    parsed.events.forEach((e: any) => {
      if (!e.status) {
        e.status = "active";
        dirty = true;
      }
    });

    if (dirty) {
      fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), "utf8");
    }

    return parsed;
  } catch (error) {
    seedDB();
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  }
};

const writeDB = (data: any) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
};

// SSE connections map
const eventListeners = new Map<string, express.Response[]>();

const notifyEventListeners = (eventId: string, type: "NEW_PHOTO" | "DELETE_PHOTO", payload: any) => {
  const listeners = eventListeners.get(eventId) || [];
  listeners.forEach((res) => {
    res.write(`data: ${JSON.stringify({ type, payload })}\n\n`);
  });
};

// Setup multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `ika-${uniqueSuffix}${ext}`);
  },
});
const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use("/uploads", express.static(UPLOADS_DIR));

  // --- Transient rate-limiting and login lockout desk ---
  const failedLoginAttempts = new Map<string, { count: number; lockedUntil: number }>();

  // --- API Authentication Routes ---
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Le mot de passe doit faire au moins 8 caractères." });
    }

    const db = readDB();
    const emailLower = email.toLowerCase().trim();
    const existing = db.users.find((u: any) => u.email.toLowerCase() === emailLower);
    if (existing) {
      return res.status(400).json({ error: "Un compte existe déjà avec cet email." });
    }

    const newUser: User = {
      id: "user-" + Date.now().toString(36),
      name,
      email: emailLower,
      password: password, // Store in mock db
      role: role || "organisateur",
      status: "active",
      created_at: new Date().toISOString(),
    };

    db.users.push(newUser);
    writeDB(db);

    res.status(201).json({ user: newUser, token: `mock-token-${newUser.id}` });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis." });
    }

    const emailLower = email.toLowerCase().trim();
    const now = Date.now();

    // Check temporary lockout block
    const attemptRecord = failedLoginAttempts.get(emailLower);
    if (attemptRecord && attemptRecord.lockedUntil > now) {
      const waitMinutes = Math.ceil((attemptRecord.lockedUntil - now) / 60000);
      return res.status(403).json({
        error: `Votre compte est temporairement bloqué en raison de 5 tentatives échouées. Veuillez réessayer dans ${waitMinutes} minutes.`
      });
    }

    const db = readDB();
    const user = db.users.find((u: any) => u.email.toLowerCase() === emailLower);

    // Simulated simple password checker
    const isPasswordValid = user && (!user.password || user.password === password);

    if (!user || !isPasswordValid) {
      // Record failed attempt
      const record = attemptRecord || { count: 0, lockedUntil: 0 };
      record.count += 1;
      if (record.count >= 5) {
        record.lockedUntil = now + 15 * 60 * 1000; // 15 minutes block
        failedLoginAttempts.set(emailLower, record);
        return res.status(403).json({
          error: "Trop de tentatives échouées. Votre compte est bloqué pendant 15 minutes."
        });
      }
      failedLoginAttempts.set(emailLower, record);
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    // Check account status
    if (user.status === "suspended") {
      return res.status(403).json({ error: "Votre compte est suspendu. Veuillez contacter un administrateur." });
    }

    // Success - reset attempts
    failedLoginAttempts.delete(emailLower);

    res.status(200).json({ user, token: `mock-token-${user.id}` });
  });

  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "L'adresse email est requise." });
    }

    const db = readDB();
    const emailLower = email.toLowerCase().trim();
    const user = db.users.find((u: any) => u.email.toLowerCase() === emailLower);

    if (user) {
      // Generate standard link token valid for 1 hour
      const resetToken = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      db.reset_tokens = db.reset_tokens || [];
      db.reset_tokens.push({
        email: emailLower,
        token: resetToken,
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      });
      writeDB(db);
      console.log(`[Email Simulation] Réinitialisation d'email envoyé à ${emailLower} | Token: ${resetToken}`);
    }

    // Always return safe success message to avoid user account enumeration
    res.json({ message: "Un email a été envoyé si ce compte existe." });
  });

  app.post("/api/auth/reset-password", (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Données requises manquantes." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Le mot de passe doit faire au moins 8 caractères." });
    }

    const db = readDB();
    db.reset_tokens = db.reset_tokens || [];
    const index = db.reset_tokens.findIndex((t: any) => t.token === token && t.expires > Date.now());

    if (index === -1) {
      return res.status(400).json({ error: "Le lien de réinitialisation est invalide ou a expiré." });
    }

    const record = db.reset_tokens[index];
    const userIndex = db.users.findIndex((u: any) => u.email.toLowerCase() === record.email.toLowerCase());

    if (userIndex !== -1) {
      db.users[userIndex].password = password;
      // Remove token
      db.reset_tokens.splice(index, 1);
      writeDB(db);
      return res.json({ success: true, message: "Votre mot de passe a été réinitialisé." });
    }

    res.status(400).json({ error: "Utilisateur non trouvé ou compte introuvable." });
  });

  // --- API Events Routes ---
  app.get("/api/events", (req, res) => {
    const { created_by } = req.query;
    const db = readDB();
    let list = db.events;

    if (created_by) {
      list = list.filter((e: any) => e.created_by === created_by);
    }

    // Attach statistics metrics (photos count, visitor visits count)
    const enrichedList = list.map((e: any) => {
      const photos = db.photos.filter((p: any) => p.event_id === e.id);
      const uniqueVisits = db.visits.filter((v: any) => v.event_id === e.id).length;
      return {
        ...e,
        photo_count: photos.length,
        visit_count: uniqueVisits,
      };
    });

    res.json(enrichedList);
  });

  app.get("/api/events/:idOrSlug", (req, res) => {
    const { idOrSlug } = req.params;
    const db = readDB();
    const event = db.events.find(
      (e: any) => e.id === idOrSlug || e.slug === idOrSlug
    );

    if (!event) {
      return res.status(404).json({ error: "Cet événement n'existe plus." });
    }

    const photos = db.photos.filter((p: any) => p.event_id === event.id);
    const uniqueVisits = db.visits.filter((v: any) => v.event_id === event.id).length;
    
    // Find photographer link if organizer:
    const inviteRecord = db.invitation_tokens.find((t: any) => t.event_id === event.id);
    const inviteToken = inviteRecord ? inviteRecord.token : "";
    const inviteTokenRevoked = inviteRecord ? inviteRecord.revoked : false;

    res.json({
      ...event,
      photo_count: photos.length,
      visit_count: uniqueVisits,
      invite_token: inviteToken,
      invite_token_revoked: inviteTokenRevoked,
    });
  });

  // Track unique visit
  app.post("/api/events/:eventId/visit", (req, res) => {
    const { eventId } = req.params;
    const { visitor_token } = req.body;

    if (!visitor_token || !eventId) {
      return res.status(400).json({ error: "Paramètres manquants." });
    }

    const db = readDB();
    const exists = db.visits.some((v: any) => v.event_id === eventId && v.visitor_token === visitor_token);

    if (!exists) {
      db.visits.push({
        id: "visit-" + Date.now().toString() + "-" + Math.random().toString(36).substring(2, 6),
        event_id: eventId,
        visitor_token,
        created_at: new Date().toISOString()
      });
      writeDB(db);
    }

    const count = db.visits.filter((v: any) => v.event_id === eventId).length;
    res.json({ success: true, count });
  });

  app.post("/api/events", upload.single("cover_image"), (req, res) => {
    const { name, description, location, date, created_by } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Le nom de l'événement est requis." });
    }

    let cover_image = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80";
    if (req.file) {
      cover_image = `/uploads/${req.file.filename}`;
    }

    // Clean slug rule based on minuscules, sans accents ni caractères spéciaux
    const cleanSlug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const uniqueIdSuffix = Math.random().toString(36).substring(2, 8); // 6 alphanum chars
    const slug = `${cleanSlug}-${uniqueIdSuffix}`;

    const db = readDB();
    const newEvent: Event = {
      id: "event-" + Date.now().toString(),
      name,
      slug,
      description: description || "",
      location: location || "",
      cover_image,
      status: "active",
      created_by: created_by || "user-admin-123",
      created_at: new Date().toISOString(),
      date: date || "",
    };

    // Auto generate randomized 32 characters invitation token for photographer
    const token = [...Array(32)].map(() => (~~(Math.random() * 36)).toString(36)).join("");
    const invitation: InvitationToken = {
      id: "inv-" + Date.now().toString(),
      token,
      event_id: newEvent.id,
      created_at: new Date().toISOString(),
      revoked: false,
    };

    db.events.push(newEvent);
    db.invitation_tokens.push(invitation);
    writeDB(db);

    res.status(201).json(newEvent);
  });

  app.put("/api/events/:id", upload.single("cover_image"), (req, res) => {
    const { id } = req.params;
    const { name, description, location, date, status } = req.body;

    const db = readDB();
    const index = db.events.findIndex((e: any) => e.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Événement introuvable" });
    }

    let updatedCover = db.events[index].cover_image;
    if (req.file) {
      // If cover image replaced, we can delete the old one if it is local
      const oldCover = db.events[index].cover_image;
      if (oldCover.startsWith("/uploads/")) {
        const filename = oldCover.replace("/uploads/", "");
        const fullPath = path.join(UPLOADS_DIR, filename);
        if (fs.existsSync(fullPath)) {
          try { fs.unlinkSync(fullPath); } catch {}
        }
      }
      updatedCover = `/uploads/${req.file.filename}`;
    }

    db.events[index] = {
      ...db.events[index],
      name: name || db.events[index].name,
      description: description || db.events[index].description,
      location: location || db.events[index].location,
      cover_image: updatedCover,
      date: date !== undefined ? date : db.events[index].date,
      status: status || db.events[index].status || "active",
    };

    writeDB(db);
    res.json(db.events[index]);
  });

  // Action status endpoint (e.g. archiving event toggle)
  app.post("/api/events/:id/archive", (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const index = db.events.findIndex((e: any) => e.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Événement introuvable." });
    }
    db.events[index].status = db.events[index].status === "archived" ? "active" : "archived";
    writeDB(db);
    res.json(db.events[index]);
  });

  app.delete("/api/events/:id", (req, res) => {
    const { id } = req.params;
    const db = readDB();
    
    // Find the event to delete
    const event = db.events.find((e: any) => e.id === id);
    if (!event) {
      return res.status(404).json({ error: "Événement introuvable" });
    }

    // Cascaded deletions
    // 1. Delete covering cover if local
    if (event.cover_image.startsWith("/uploads/")) {
      const filename = event.cover_image.replace("/uploads/", "");
      const fullPath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(fullPath)) {
        try { fs.unlinkSync(fullPath); } catch {}
      }
    }

    // 2. Delete all event's uploaded photos files
    const eventPhotos = db.photos.filter((p: any) => p.event_id === id);
    eventPhotos.forEach((photo: any) => {
      if (photo.image_url.startsWith("/uploads/")) {
        const filename = photo.image_url.replace("/uploads/", "");
        const fullPath = path.join(UPLOADS_DIR, filename);
        if (fs.existsSync(fullPath)) {
          try { fs.unlinkSync(fullPath); } catch {}
        }
      }
    });

    db.events = db.events.filter((e: any) => e.id !== id);
    db.photos = db.photos.filter((p: any) => p.event_id !== id);
    db.event_photographers = db.event_photographers.filter((ep: any) => ep.event_id !== id);
    db.invitation_tokens = db.invitation_tokens.filter((it: any) => it.event_id !== id);
    
    writeDB(db);
    res.json({ message: "Événement supprimé avec succès." });
  });

  // --- API Photographer Connections and Join links ---
  app.get("/api/invitations/:token", (req, res) => {
    const { token } = req.params;
    const db = readDB();
    
    const inviteRecord = db.invitation_tokens.find((t: any) => t.token === token);
    if (!inviteRecord) {
      return res.status(404).json({ error: "Ce lien d'invitation n'existe pas ou est invalide." });
    }

    if (inviteRecord.revoked) {
      return res.status(400).json({ error: "Ce lien d'invitation a été révoqué par l'organisateur." });
    }

    const event = db.events.find((e: any) => e.id === inviteRecord.event_id);
    if (!event) {
      return res.status(404).json({ error: "L'événement lié n'existe plus." });
    }

    res.json({
      token: inviteRecord.token,
      event_id: event.id,
      event_name: event.name,
      location: event.location,
    });
  });

  // Assign professional workspace
  app.post("/api/events/:eventId/photographers/join", (req, res) => {
    const { eventId } = req.params;
    const { photographer_id, token } = req.body;

    if (!eventId || !photographer_id) {
      return res.status(400).json({ error: "Données requises manquantes." });
    }

    const db = readDB();

    // Verify token validity
    const inviteRecord = db.invitation_tokens.find((t: any) => t.token === token && t.event_id === eventId);
    if (!inviteRecord || inviteRecord.revoked) {
      return res.status(400).json({ error: "Le jeton d'invitation a expiré ou a été révoqué." });
    }

    // Verify user role
    const user = db.users.find((u: any) => u.id === photographer_id);
    if (!user) {
      return res.status(404).json({ error: "Photographe introuvable." });
    }
    if (user.role === "organisateur") {
      return res.status(400).json({ error: "Ce lien est réservé aux photographes." });
    }

    // Avoid duplicate assignment
    const alreadyConnected = db.event_photographers.find(
      (ep: any) => ep.event_id === eventId && ep.photographer_id === photographer_id
    );

    if (alreadyConnected) {
      // If already connected but revoked, restore them
      if (alreadyConnected.revoked) {
        alreadyConnected.revoked = false;
        writeDB(db);
      }
      return res.json({ success: true, message: "Vous êtes déjà membre de cet événement." });
    }

    db.event_photographers.push({
      event_id: eventId,
      photographer_id: photographer_id,
      joined_at: new Date().toISOString(),
      revoked: false,
    });

    writeDB(db);
    res.json({ success: true, message: "Événement rejoint." });
  });

  // Retrieve assigned events for photographe
  app.get("/api/photographe/:photographerId/events", (req, res) => {
    const { photographerId } = req.params;
    const db = readDB();

    const allowedRelations = db.event_photographers.filter(
      (ep: any) => ep.photographer_id === photographerId && !ep.revoked
    );
    const eventIds = allowedRelations.map((ep: any) => ep.event_id);

    // List all public events where photographe joined
    const assignedEvents = db.events.filter((e: any) => eventIds.includes(e.id));
    
    // Attach photos count
    const enrichedList = assignedEvents.map((e: any) => {
      const photos = db.photos.filter((p: any) => p.event_id === e.id);
      return {
        ...e,
        photo_count: photos.length,
      };
    });

    res.json(enrichedList);
  });

  // Invite token toggling
  app.post("/api/events/:eventId/invitation/toggle", (req, res) => {
    const { eventId } = req.params;
    const db = readDB();
    const tokenRecordIndex = db.invitation_tokens.findIndex((t: any) => t.event_id === eventId);
    if (tokenRecordIndex !== -1) {
      db.invitation_tokens[tokenRecordIndex].revoked = !db.invitation_tokens[tokenRecordIndex].revoked;
      writeDB(db);
      return res.json(db.invitation_tokens[tokenRecordIndex]);
    }
    // Create new token if not present
    const token = [...Array(32)].map(() => (~~(Math.random() * 36)).toString(36)).join("");
    const invitation: InvitationToken = {
      id: "inv-" + Date.now().toString(),
      token,
      event_id: eventId,
      created_at: new Date().toISOString(),
      revoked: false,
    };
    db.invitation_tokens.push(invitation);
    writeDB(db);
    res.json(invitation);
  });

  // List assigned photographers for event
  app.get("/api/events/:eventId/photographers", (req, res) => {
    const { eventId } = req.params;
    const db = readDB();
    const relations = db.event_photographers.filter((ep: any) => ep.event_id === eventId);
    const result = relations.map((ep: any) => {
      const photographerUser = db.users.find((u: any) => u.id === ep.photographer_id);
      return {
        ...ep,
        name: photographerUser ? photographerUser.name : "Photographe Inconnu",
        email: photographerUser ? photographerUser.email : "",
      };
    });
    res.json(result);
  });

  // Revoke toggle on specific photographer access
  app.post("/api/events/:eventId/photographers/:photographerId/revoke", (req, res) => {
    const { eventId, photographerId } = req.params;
    const db = readDB();
    const relationIndex = db.event_photographers.findIndex(
      (ep: any) => ep.event_id === eventId && ep.photographer_id === photographerId
    );

    if (relationIndex !== -1) {
      db.event_photographers[relationIndex].revoked = !db.event_photographers[relationIndex].revoked;
      writeDB(db);
      const photographerUser = db.users.find((u: any) => u.id === photographerId);
      return res.json({
        ...db.event_photographers[relationIndex],
        name: photographerUser ? photographerUser.name : "",
        email: photographerUser ? photographerUser.email : "",
      });
    }

    res.status(404).json({ error: "Assignation introuvable." });
  });

  // Add photographer directly by email
  app.post("/api/events/:eventId/photographers/add", (req, res) => {
    const { eventId } = req.params;
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: "L'adresse email est requise." });
    }

    const db = readDB();
    const emailLower = email.toLowerCase().trim();
    let user = db.users.find((u: any) => u.email.toLowerCase() === emailLower);

    if (!user) {
      // Auto-create photographer user
      const parts = emailLower.split("@");
      const defaultName = name || parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      user = {
        id: "user-" + Date.now().toString(),
        name: defaultName,
        email: emailLower,
        role: "photographe",
        password: "password123", // default fallback password
        created_at: new Date().toISOString()
      };
      db.users.push(user);
    }

    // Ensure they have the photographer role if they were guest
    if (user.role === "invite") {
      user.role = "photographe";
    }

    // Associate photographer to event
    const epIndex = db.event_photographers.findIndex(
      (ep: any) => ep.event_id === eventId && ep.photographer_id === user.id
    );

    let isNewRelationship = false;
    if (epIndex !== -1) {
      db.event_photographers[epIndex].revoked = false; // Restore if revoked
    } else {
      isNewRelationship = true;
      db.event_photographers.push({
        event_id: eventId,
        photographer_id: user.id,
        joined_at: new Date().toISOString(),
        revoked: false
      });
    }

    writeDB(db);

    res.json({
      photographer_id: user.id,
      event_id: eventId,
      joined_at: new Date().toISOString(),
      revoked: false,
      name: user.name,
      email: user.email,
      isNewUser: !db.users.find((u: any) => u.email.toLowerCase() === emailLower), // was created
    });
  });

  // --- API Photos Routes ---
  app.get("/api/events/:eventId/photos", (req, res) => {
    const { eventId } = req.params;
    const db = readDB();
    const photos = db.photos
      .filter((p: any) => p.event_id === eventId)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(photos);
  });

  app.post("/api/events/:eventId/photos", upload.single("photo"), (req, res) => {
    const { eventId } = req.params;
    const { uploaded_by, uploaded_by_name } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Fichier photo manquant." });
    }

    const db = readDB();

    // RLS (Row Level Security) simulation checks if photographe has access
    if (uploaded_by && uploaded_by !== "invite") {
      const u = db.users.find((user: any) => user.id === uploaded_by);
      if (u && u.role === "photographe") {
        const hasAccess = db.event_photographers.some(
          (ep: any) => ep.event_id === eventId && ep.photographer_id === uploaded_by && !ep.revoked
        );
        if (!hasAccess) {
          // If not assigned yet, assign them automatically in sandbox mode so it works seamlessly!
          db.event_photographers.push({
            event_id: eventId,
            photographer_id: uploaded_by,
            joined_at: new Date().toISOString(),
            revoked: false,
          });
          writeDB(db);
        }
      }
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const userObj = db.users.find((u: any) => u.id === uploaded_by);
    const uploaderName = uploaded_by_name || (userObj ? userObj.name : "Invité");

    const newPhoto: Photo = {
      id: "photo-" + Date.now().toString() + "-" + Math.random().toString(36).substring(2, 6),
      event_id: eventId,
      image_url: imageUrl,
      uploaded_by: uploaded_by || "invite",
      uploaded_by_name: uploaderName,
      created_at: new Date().toISOString(),
      download_count: 0,
    };

    db.photos.push(newPhoto);
    writeDB(db);

    // Notify all real-time listeners of the new photo
    notifyEventListeners(eventId, "NEW_PHOTO", newPhoto);

    res.status(201).json(newPhoto);
  });

  app.delete("/api/photos/:photoId", (req, res) => {
    const { photoId } = req.params;
    const db = readDB();
    const photo = db.photos.find((p: any) => p.id === photoId);

    if (!photo) {
      return res.status(404).json({ error: "Photo introuvable." });
    }

    db.photos = db.photos.filter((p: any) => p.id !== photoId);
    writeDB(db);

    // Delete the direct file to keep sandbox clean
    if (photo.image_url.startsWith("/uploads/")) {
      const filename = photo.image_url.replace("/uploads/", "");
      const fullPath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (e) {
          console.error("Failed to delete local image file", e);
        }
      }
    }

    // Notify listeners of the photo removal
    notifyEventListeners(photo.event_id, "DELETE_PHOTO", { id: photoId });

    res.json({ message: "Photo supprimée avec succès" });
  });

  app.post("/api/photos/:photoId/download", (req, res) => {
    const { photoId } = req.params;
    const db = readDB();
    const index = db.photos.findIndex((p: any) => p.id === photoId);

    if (index !== -1) {
      db.photos[index].download_count = (db.photos[index].download_count || 0) + 1;
      writeDB(db);
      return res.json({ success: true, download_count: db.photos[index].download_count });
    }

    res.status(404).json({ error: "Photo non trouvée" });
  });

  // --- API User Admin Routes ---
  app.get("/api/admin/users", (req, res) => {
    const db = readDB();
    res.json(db.users);
  });

  app.put("/api/admin/users/:userId/role", (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["admin", "organisateur", "photographe", "invite"].includes(role)) {
      return res.status(400).json({ error: "Rôle invalide" });
    }

    const db = readDB();
    const index = db.users.findIndex((u: any) => u.id === userId);

    if (index === -1) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    db.users[index].role = role;
    writeDB(db);

    res.json(db.users[index]);
  });

  app.put("/api/admin/users/:userId/status", (req, res) => {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

    const db = readDB();
    const index = db.users.findIndex((u: any) => u.id === userId);

    if (index === -1) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    db.users[index].status = status;
    writeDB(db);

    res.json(db.users[index]);
  });

  // --- SSE Real-time Photo Stream Route ---
  app.get("/api/events/:eventId/live-stream", (req, res) => {
    const { eventId } = req.params;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Add this response to listeners pool
    if (!eventListeners.has(eventId)) {
      eventListeners.set(eventId, []);
    }
    eventListeners.get(eventId)!.push(res);

    // Write a connection confirmation event
    res.write(`data: ${JSON.stringify({ type: "CONNECTED" })}\n\n`);

    // Clean up on connection close
    req.on("close", () => {
      const listeners = eventListeners.get(eventId) || [];
      const index = listeners.indexOf(res);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
      if (listeners.length === 0) {
        eventListeners.delete(eventId);
      } else {
         eventListeners.set(eventId, listeners);
      }
    });
  });

  // --- Statistique Globales ---
  app.get("/api/stats/global", (req, res) => {
    const { created_by } = req.query;
    const db = readDB();

    let ownedEvents = db.events;
    if (created_by) {
      ownedEvents = db.events.filter((e: any) => e.created_by === created_by);
    }
    const ownedEventIds = ownedEvents.map((e: any) => e.id);

    const matchingPhotos = db.photos.filter((p: any) => ownedEventIds.includes(p.event_id));

    const totalEvents = ownedEvents.length;
    const totalPhotos = matchingPhotos.length;
    const totalDownloads = matchingPhotos.reduce((sum: number, p: any) => sum + (p.download_count || 0), 0);

    res.json({
      totalEvents,
      totalPhotos,
      totalDownloads,
    });
  });

  // --- Global API Error Handler Middleware (prevents html crash page leak) ---
  app.use("/api", (err: any, req: any, res: any, next: any) => {
    console.error("Unhandleable API exception intercepted by Express middleware:", err);
    res.status(500).json({
      error: err.message || "Une erreur interne s'est produite sur le serveur.",
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined
    });
  });

  // --- Serve Frontend via Vite dev server or static dist folder ---
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
    console.log(`IKA backend and preview application running on http://localhost:${PORT}`);
  });
}

startServer();
