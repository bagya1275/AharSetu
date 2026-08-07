var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_path = __toESM(require("path"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_pdfkit = __toESM(require("pdfkit"), 1);
var import_nodemailer = __toESM(require("nodemailer"), 1);

// src/server/db.ts
var DatabaseStore = class {
  constructor() {
    this.users = [];
    this.donations = [];
    this.notifications = [];
  }
  // User operations
  getUsers() {
    return this.users;
  }
  getUserById(id) {
    return this.users.find((u) => u.id === id);
  }
  getUserByEmail(email) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  createUser(user) {
    this.users.push(user);
    return user;
  }
  updateUser(id, updates) {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...updates };
      return this.users[idx];
    }
    return void 0;
  }
  setUserRole(id, role) {
    return this.updateUser(id, { role });
  }
  // Donation operations
  getDonations() {
    return this.donations;
  }
  getDonationById(id) {
    return this.donations.find((d) => d.id === id);
  }
  createDonation(donation) {
    this.donations.unshift(donation);
    const ngos = this.users.filter((u) => u.role === "ngo");
    ngos.forEach((ngo) => {
      this.addNotification({
        id: "notif_" + Date.now() + Math.random().toString(36).substring(2, 5),
        userId: ngo.id,
        title: "New Surplus Food Available!",
        message: `${donation.donorName} posted ${donation.quantityServings} servings of ${donation.title}`,
        type: "info",
        read: false,
        link: `/donations/${donation.id}`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    });
    return donation;
  }
  updateDonation(id, updates) {
    const idx = this.donations.findIndex((d) => d.id === id);
    if (idx !== -1) {
      this.donations[idx] = { ...this.donations[idx], ...updates, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
      return this.donations[idx];
    }
    return void 0;
  }
  // Notifications
  getNotificationsForUser(userId) {
    return this.notifications.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  addNotification(notif) {
    this.notifications.unshift(notif);
    return notif;
  }
  markNotificationRead(id) {
    const n = this.notifications.find((x) => x.id === id);
    if (n) n.read = true;
  }
  // Analytics & Leaderboard derived strictly from stored data
  getAnalytics() {
    const completed = this.donations.filter((d) => d.status === "delivered");
    const totalServings = completed.reduce((sum, d) => sum + d.quantityServings, 0);
    const totalKg = completed.reduce((sum, d) => sum + (d.quantityWeightKg || d.quantityServings * 0.35), 0);
    return {
      totalMealsServed: totalServings,
      totalDonationsCompleted: completed.length,
      totalActiveDonors: this.users.filter((u) => u.role === "donor").length,
      totalNgosVerified: this.users.filter((u) => u.role === "ngo" && u.verified).length,
      totalVolunteersActive: this.users.filter((u) => u.role === "volunteer").length,
      co2SavedKg: Math.round(totalKg * 2.5),
      foodSavedKg: Math.round(totalKg),
      activePendingDonations: this.donations.filter((d) => d.status === "pending" || d.status === "accepted" || d.status === "assigned").length
    };
  }
  getLeaderboard() {
    const userStatsMap = /* @__PURE__ */ new Map();
    this.donations.forEach((d) => {
      if (d.status === "delivered") {
        const donorStat = userStatsMap.get(d.donorId) || { meals: 0, deliveries: 0, impact: 0 };
        donorStat.meals += d.quantityServings;
        donorStat.impact += d.quantityServings * 10;
        userStatsMap.set(d.donorId, donorStat);
        if (d.ngoId) {
          const ngoStat = userStatsMap.get(d.ngoId) || { meals: 0, deliveries: 0, impact: 0 };
          ngoStat.deliveries += 1;
          ngoStat.impact += d.quantityServings * 8;
          userStatsMap.set(d.ngoId, ngoStat);
        }
        if (d.volunteerId) {
          const volStat = userStatsMap.get(d.volunteerId) || { meals: 0, deliveries: 0, impact: 0 };
          volStat.deliveries += 1;
          volStat.impact += 100;
          userStatsMap.set(d.volunteerId, volStat);
        }
      }
    });
    const entries = this.users.filter((u) => u.role !== "unassigned").map((u) => {
      const stats = userStatsMap.get(u.id) || { meals: 0, deliveries: 0, impact: u.impactScore || 0 };
      return {
        rank: 0,
        id: u.id,
        name: u.name,
        role: u.role,
        organization: u.organization,
        avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`,
        totalMealsDonated: stats.meals,
        totalDeliveries: stats.deliveries,
        impactScore: stats.impact,
        badgesCount: u.badges ? u.badges.length : 0
      };
    }).sort((a, b) => b.impactScore - a.impactScore);
    entries.forEach((e, idx) => {
      e.rank = idx + 1;
    });
    return entries;
  }
};
var db = new DatabaseStore();

// server.ts
var JWT_SECRET = process.env.JWT_SECRET || "aharsetu-super-secret-jwt-key-2026";
var SYSTEM_ADMIN_EMAIL = "bagya1275@gmail.com";
var mailTransporter = import_nodemailer.default.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: "aharsetu_system@ethereal.email",
    pass: "secret_email_pass"
  }
});
async function sendDeliveryNotificationEmail(donorEmail, donationTitle, recipientCount) {
  try {
    const info = await mailTransporter.sendMail({
      from: '"AharSetu Redistribution Network" <notifications@aharsetu.org>',
      to: donorEmail,
      subject: `\u{1F389} Mission Accomplished: Your donation "${donationTitle}" was delivered!`,
      text: `Hello,

Your generous food donation "${donationTitle}" has been successfully delivered and distributed to ${recipientCount} recipients today!

Thank you for ensuring zero food waste.

Warm regards,
Team AharSetu`,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #F9FBFA;">
        <h2 style="color: #16A34A;">AharSetu Delivery Confirmation</h2>
        <p>Your generous surplus food donation <strong>"${donationTitle}"</strong> has been successfully picked up, transported, and distributed to <strong>${recipientCount}</strong> souls today!</p>
        <p style="margin-top: 15px;">Your tax 80G impact certificate is now available for download in your donor dashboard.</p>
        <hr style="border: none; border-top: 1px solid #E8EEEA;" />
        <p style="font-size: 12px; color: #6B7280;">AharSetu Zero Hunger Platform | 100% Non-Monetary Food Redistribution</p>
      </div>`
    }).catch((err) => {
      console.log("Nodemailer simulated email sent for:", donorEmail, donationTitle);
    });
  } catch (err) {
    console.log("Email delivery notification logged for:", donorEmail);
  }
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use((0, import_cors.default)());
  app.use(import_express.default.json({ limit: "10mb" }));
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      req.user = null;
      return next();
    }
    try {
      const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
      req.user = db.getUserById(decoded.id) || null;
    } catch (err) {
      req.user = null;
    }
    next();
  };
  app.use(authenticateToken);
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "AharSetu Express API operational", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, role, phone, organization, address } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required." });
      }
      const cleanEmail = email.trim().toLowerCase();
      const isSystemAdmin = cleanEmail === SYSTEM_ADMIN_EMAIL;
      if (role === "admin" && !isSystemAdmin) {
        return res.status(403).json({ error: "Admin registration is restricted exclusively to authorized administrators." });
      }
      const existing = db.getUserByEmail(cleanEmail);
      if (existing) {
        return res.status(400).json({ error: "Account with this email already exists." });
      }
      const hashedPassword = password ? await import_bcryptjs.default.hash(password, 10) : await import_bcryptjs.default.hash("defaultpass123", 10);
      const assignedRole = isSystemAdmin ? "admin" : role && role !== "admin" ? role : "unassigned";
      const newUser = {
        id: "usr_" + Date.now(),
        name: isSystemAdmin ? "System Administrator" : name,
        email: cleanEmail,
        password: hashedPassword,
        role: assignedRole,
        phone: phone || (isSystemAdmin ? "+91 99999 00000" : "+91 98000 00000"),
        organization: organization || (isSystemAdmin ? "AharSetu Central Administration" : name),
        address: address || "New Delhi, India",
        verified: true,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        rating: 5,
        badges: isSystemAdmin ? ["system_admin"] : ["new_member"],
        impactScore: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.createUser(newUser);
      const token = import_jsonwebtoken.default.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });
      res.json({
        message: "Registration successful",
        token,
        user: newUser
      });
    } catch (err) {
      res.status(500).json({ error: "Registration failed", details: err.message });
    }
  });
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const cleanEmail = email.trim().toLowerCase();
      const isSystemAdmin = cleanEmail === SYSTEM_ADMIN_EMAIL;
      let user = db.getUserByEmail(cleanEmail);
      if (!user) {
        const hashedPassword = await import_bcryptjs.default.hash(password || "default123", 10);
        const rawName = cleanEmail.split("@")[0];
        const formattedName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : "User";
        user = {
          id: "usr_" + Date.now(),
          name: isSystemAdmin ? "System Administrator" : formattedName,
          email: cleanEmail,
          password: hashedPassword,
          role: isSystemAdmin ? "admin" : "unassigned",
          // System admin email automatically receives admin role
          phone: isSystemAdmin ? "+91 99999 00000" : "+91 98765 00000",
          organization: isSystemAdmin ? "AharSetu Central Administration" : formattedName,
          address: "Delhi NCR, India",
          verified: true,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanEmail)}`,
          rating: 5,
          badges: isSystemAdmin ? ["system_admin"] : ["new_member"],
          impactScore: 0,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        db.createUser(user);
      } else if (isSystemAdmin && user.role !== "admin") {
        user = db.updateUser(user.id, { role: "admin" }) || user;
      }
      const token = import_jsonwebtoken.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      res.json({
        message: "Login successful",
        token,
        user
      });
    } catch (err) {
      res.status(500).json({ error: "Login failed", details: err.message });
    }
  });
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ error: "Email and new password are required." });
      }
      const cleanEmail = email.trim().toLowerCase();
      const user = db.getUserByEmail(cleanEmail);
      if (!user) {
        return res.status(404).json({ error: "No account found with this email address. Please check your email or register." });
      }
      const hashedPassword = await import_bcryptjs.default.hash(newPassword, 10);
      const updatedUser = db.updateUser(user.id, { password: hashedPassword });
      res.json({ message: "Password updated successfully! You can now log in with your new password.", user: updatedUser });
    } catch (err) {
      res.status(500).json({ error: "Failed to reset password", details: err.message });
    }
  });
  app.put("/api/auth/set-role", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    const { role } = req.body;
    if (!role || !["donor", "ngo", "requester", "volunteer", "admin"].includes(role)) {
      return res.status(400).json({ error: "Valid role (donor, ngo, requester, volunteer) is required" });
    }
    if (role === "admin" && req.user.email.trim().toLowerCase() !== SYSTEM_ADMIN_EMAIL) {
      return res.status(403).json({ error: "Admin role is restricted strictly to authorized administrators." });
    }
    const updatedUser = db.setUserRole(req.user.id, role);
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    const token = import_jsonwebtoken.default.sign({ id: updatedUser.id, email: updatedUser.email, role: updatedUser.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      message: `Role set to ${role} successfully`,
      token,
      user: updatedUser
    });
  });
  app.get("/api/auth/me", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    res.json({ user: req.user });
  });
  app.put("/api/auth/profile", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    const updated = db.updateUser(req.user.id, req.body);
    res.json({ user: updated });
  });
  app.get("/api/donations", (req, res) => {
    const { status, foodType, dietaryType, donorId, ngoId, volunteerId, search } = req.query;
    let list = db.getDonations();
    if (status) {
      list = list.filter((d) => d.status === status);
    }
    if (foodType) {
      list = list.filter((d) => d.foodType === foodType);
    }
    if (dietaryType) {
      list = list.filter((d) => d.dietaryType === dietaryType);
    }
    if (donorId) {
      list = list.filter((d) => d.donorId === donorId);
    }
    if (ngoId) {
      list = list.filter((d) => d.ngoId === ngoId);
    }
    if (volunteerId) {
      list = list.filter((d) => d.volunteerId === volunteerId);
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (d) => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || d.address.toLowerCase().includes(q) || d.donorName.toLowerCase().includes(q)
      );
    }
    res.json({ donations: list });
  });
  app.get("/api/donations/:id", (req, res) => {
    const donation = db.getDonationById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }
    res.json({ donation });
  });
  app.post("/api/donations", (req, res) => {
    const user = req.user;
    const body = req.body;
    if (!body.title || !body.quantityServings) {
      return res.status(400).json({ error: "Title and servings quantity are required" });
    }
    const expiryHours = Number(body.expiryHours) || 6;
    const now = /* @__PURE__ */ new Date();
    const expiryTimestamp = new Date(now.getTime() + expiryHours * 3600 * 1e3).toISOString();
    const newDonation = {
      id: "don_" + Date.now(),
      donorId: user ? user.id : "usr_anon",
      donorName: user ? user.name : body.donorName || "Surplus Food Donor",
      donorPhone: user ? user.phone : body.donorPhone || "+91 98000 00000",
      donorOrg: user ? user.organization : body.donorOrg || "Food Outlet",
      title: body.title,
      description: body.description || "",
      foodType: body.foodType || "cooked_meal",
      dietaryType: body.dietaryType || "veg",
      quantityServings: Number(body.quantityServings),
      quantityWeightKg: Number(body.quantityWeightKg) || Math.round(Number(body.quantityServings) * 0.35),
      cookedTime: body.cookedTime || now.toISOString(),
      expiryHours,
      expiryTimestamp,
      images: body.images && body.images.length ? body.images : ["https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600"],
      address: body.address || "Central Delhi, New Delhi",
      status: body.isDraft ? "draft" : "pending",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    db.createDonation(newDonation);
    res.status(201).json({
      message: body.isDraft ? "Draft saved successfully" : "Surplus food donation posted!",
      donation: newDonation
    });
  });
  app.post("/api/donations/:id/accept", (req, res) => {
    const user = req.user;
    const donation = db.getDonationById(req.params.id);
    const { pickupMethod, pickupNotes, ngoName } = req.body || {};
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }
    const updated = db.updateDonation(donation.id, {
      status: "accepted",
      ngoId: user ? user.id : "usr_ngo",
      ngoName: ngoName || (user ? user.organization || user.name : "Verified Beneficiary / NGO"),
      ngoPhone: user ? user.phone : "+91 98000 11111",
      pickupMethod: pickupMethod || "volunteer",
      pickupNotes: pickupNotes || ""
    });
    db.addNotification({
      id: "notif_" + Date.now(),
      userId: donation.donorId,
      title: "Donation Claimed!",
      message: `${updated?.ngoName} claimed your food donation "${donation.title}". Pickup Method: ${pickupMethod === "self_pickup" ? "Self Pickup" : "Volunteer Courier"}.`,
      type: "success",
      read: false,
      link: `/donations/${donation.id}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.json({ message: "Donation claimed successfully", donation: updated });
  });
  const foodRequestsList = [
    {
      id: "req_101",
      requesterId: "usr_req1",
      requesterName: "Anand Dham Orphanage",
      organizationName: "Anand Dham Trust",
      phone: "+91 98111 22334",
      address: "Lajpat Nagar IV, New Delhi",
      title: "Need 40 Servings Cooked Meal for Evening Dinner",
      servingsNeeded: 40,
      dietaryPreference: "veg",
      urgency: "high",
      status: "open",
      notes: "Prefer fresh rice & dal or sabzi rotis before 7:00 PM.",
      createdAt: new Date(Date.now() - 36e5 * 4).toISOString()
    }
  ];
  app.get("/api/food-requests", (req, res) => {
    res.json({ requests: foodRequestsList });
  });
  app.post("/api/food-requests", (req, res) => {
    const user = req.user;
    const body = req.body;
    if (!body.title || !body.servingsNeeded) {
      return res.status(400).json({ error: "Title and servings needed are required" });
    }
    const newReq = {
      id: "req_" + Date.now(),
      requesterId: user ? user.id : "usr_req_anon",
      requesterName: user ? user.name : "Food Requester",
      organizationName: body.organizationName || (user ? user.organization : "Community Shelter"),
      phone: user ? user.phone : "+91 98000 00000",
      address: body.address || "Delhi NCR",
      title: body.title,
      servingsNeeded: Number(body.servingsNeeded),
      dietaryPreference: body.dietaryPreference || "veg",
      urgency: body.urgency || "normal",
      status: "open",
      notes: body.notes || "",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    foodRequestsList.unshift(newReq);
    res.status(201).json({ message: "Food request posted successfully", request: newReq });
  });
  app.post("/api/donations/:id/assign-volunteer", (req, res) => {
    const { volunteerId, volunteerName, volunteerPhone } = req.body;
    const donation = db.getDonationById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }
    const vId = volunteerId || (req.user ? req.user.id : "usr_volunteer");
    const vName = volunteerName || (req.user ? req.user.name : "Express Volunteer");
    const vPhone = volunteerPhone || "+91 97000 22222";
    const updated = db.updateDonation(donation.id, {
      status: "assigned",
      volunteerId: vId,
      volunteerName: vName,
      volunteerPhone: vPhone
    });
    db.addNotification({
      id: "notif_" + Date.now(),
      userId: vId,
      title: "Pickup Task Assigned",
      message: `You have been assigned to pick up food from ${donation.donorName}`,
      type: "warning",
      read: false,
      link: `/volunteer/dashboard`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.json({ message: "Volunteer assigned successfully", donation: updated });
  });
  app.post("/api/donations/:id/pickup", (req, res) => {
    const { proofImage, pickupNotes } = req.body;
    const donation = db.getDonationById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }
    const updated = db.updateDonation(donation.id, {
      status: "picked_up",
      pickupProof: proofImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300",
      pickupNotes: pickupNotes || "Picked up in pristine condition.",
      pickupTimestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.json({ message: "Food pickup marked complete", donation: updated });
  });
  app.post("/api/donations/:id/deliver", async (req, res) => {
    const { deliveryProof, deliveryNotes, recipientCount } = req.body;
    const donation = db.getDonationById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }
    const updated = db.updateDonation(donation.id, {
      status: "delivered",
      deliveryProof: deliveryProof || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=300",
      deliveryNotes: deliveryNotes || "Food successfully delivered and distributed to families.",
      recipientCount: Number(recipientCount) || donation.quantityServings,
      deliveryTimestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    const donor = db.getUserById(donation.donorId);
    if (donor && donor.email) {
      sendDeliveryNotificationEmail(donor.email, donation.title, updated?.recipientCount || donation.quantityServings);
    }
    db.addNotification({
      id: "notif_" + Date.now(),
      userId: donation.donorId,
      title: "\u{1F389} Mission Complete! Food Delivered",
      message: `Your donation "${donation.title}" fed ${updated?.recipientCount || donation.quantityServings} people today!`,
      type: "success",
      read: false,
      link: `/donations/${donation.id}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.json({ message: "Food delivery confirmed and completed!", donation: updated });
  });
  app.get("/api/donations/:id/receipt", (req, res) => {
    const donation = db.getDonationById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: "Donation record not found" });
    }
    try {
      const doc = new import_pdfkit.default({ margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="AharSetu_Receipt_${donation.id}.pdf"`);
      doc.pipe(res);
      doc.fillColor("#16A34A").fontSize(24).text("AharSetu Food Rescue Network", { align: "center" });
      doc.fillColor("#6B7280").fontSize(10).text("100% Non-Monetary Surplus Food Redistribution", { align: "center" });
      doc.moveDown();
      doc.strokeColor("#E8EEEA").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      doc.fillColor("#111827").fontSize(16).text("OFFICIAL DONATION IMPACT RECEIPT (80G CERTIFICATE)", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor("#374151");
      doc.text(`Receipt Reference ID: ${donation.id}`);
      doc.text(`Issue Date: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", { dateStyle: "full" })}`);
      doc.text(`Donation Status: ${donation.status.toUpperCase()}`);
      doc.moveDown();
      doc.fillColor("#16A34A").fontSize(13).text("Donor Details:");
      doc.fillColor("#374151").fontSize(11);
      doc.text(`Donor Name: ${donation.donorName}`);
      doc.text(`Organization: ${donation.donorOrg || "Individual Partner"}`);
      doc.text(`Contact: ${donation.donorPhone}`);
      doc.moveDown();
      doc.fillColor("#16A34A").fontSize(13).text("Food Rescue Details:");
      doc.fillColor("#374151").fontSize(11);
      doc.text(`Item Title: ${donation.title}`);
      doc.text(`Food Category: ${donation.foodType.toUpperCase()} (${donation.dietaryType.toUpperCase()})`);
      doc.text(`Quantity Servings: ${donation.quantityServings} Portions (${donation.quantityWeightKg || "N/A"} kg)`);
      doc.text(`Pickup Address: ${donation.address}`);
      doc.moveDown();
      if (donation.ngoName) {
        doc.fillColor("#16A34A").fontSize(13).text("Recipient NGO / Shelter:");
        doc.fillColor("#374151").fontSize(11);
        doc.text(`Claimed By: ${donation.ngoName}`);
        doc.text(`Beneficiaries Fed: ${donation.recipientCount || donation.quantityServings} Individuals`);
        doc.moveDown();
      }
      doc.moveDown(2);
      doc.fontSize(10).fillColor("#9CA3AF").text("This digital document certifies non-monetary food donation under Section 80G tax exemptions.", { align: "center" });
      doc.text("Thank you for helping eliminate hunger across India.", { align: "center" });
      doc.end();
    } catch (err) {
      console.error("PDF Receipt Generation Error:", err);
      res.status(500).json({ error: "Failed to generate PDF receipt", details: err.message });
    }
  });
  app.get("/api/notifications", (req, res) => {
    if (!req.user) {
      return res.json({ notifications: [] });
    }
    const notifs = db.getNotificationsForUser(req.user.id);
    res.json({ notifications: notifs });
  });
  app.put("/api/notifications/:id/read", (req, res) => {
    db.markNotificationRead(req.params.id);
    res.json({ success: true });
  });
  app.get("/api/leaderboard", (req, res) => {
    res.json({ leaderboard: db.getLeaderboard(), badges: db.getUsers() });
  });
  app.get("/api/analytics", (req, res) => {
    res.json({ analytics: db.getAnalytics() });
  });
  app.get("/api/admin/users", (req, res) => {
    if (!req.user || req.user.role !== "admin" || req.user.email.trim().toLowerCase() !== SYSTEM_ADMIN_EMAIL) {
      return res.status(403).json({ error: "Access denied. System administrator privileges required." });
    }
    res.json({ users: db.getUsers() });
  });
  app.post("/api/admin/verify-user", (req, res) => {
    if (!req.user || req.user.role !== "admin" || req.user.email.trim().toLowerCase() !== SYSTEM_ADMIN_EMAIL) {
      return res.status(403).json({ error: "Access denied. System administrator privileges required." });
    }
    const { userId, verified } = req.body;
    const updated = db.updateUser(userId, { verified });
    res.json({ user: updated });
  });
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
