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
var import_express3 = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");

// server/config/db.ts
var import_mongoose = __toESM(require("mongoose"), 1);
var MemoryStore = class {
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.donations = /* @__PURE__ */ new Map();
  }
};
var memoryDb = new MemoryStore();
var isMongoConnected = () => {
  return import_mongoose.default.connection.readyState === 1;
};
var connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  import_mongoose.default.set("bufferCommands", false);
  if (!mongoUri) {
    console.log("\u2139\uFE0F MONGODB_URI not provided. Operating in in-memory persistence mode.");
    return;
  }
  try {
    const conn = await import_mongoose.default.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500
      // Fast timeout for local dev or missing clusters
    });
    console.log(`\u2705 MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    const errMsg = err?.message || "Connection failed";
    console.log(`\u2139\uFE0F MongoDB notice: ${errMsg}. Operating in in-memory persistence mode.`);
  }
};

// server/routes/authRoutes.ts
var import_express = require("express");

// server/controllers/authController.ts
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);

// server/models/User.ts
var import_mongoose2 = __toESM(require("mongoose"), 1);
var UserSchema = new import_mongoose2.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["UNASSIGNED", "DONOR", "NGO", "VOLUNTEER", "ADMIN", "REQUESTER"],
    default: "UNASSIGNED"
  },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  verificationStatus: { type: Boolean, default: false },
  shelterLocation: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});
var User = import_mongoose2.default.models.User || import_mongoose2.default.model("User", UserSchema);

// server/middleware/authMiddleware.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var JWT_SECRET = process.env.JWT_SECRET || "aharsestu_super_secret_key_2026";
var authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Access token required" });
  }
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};
var requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(", ")}]`
      });
    }
    if (req.user.role === "ADMIN" && req.user.email.toLowerCase().trim() !== "bagya1725@gmail.com") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Admin portal access is strictly restricted to bagya1725@gmail.com"
      });
    }
    next();
  };
};

// server/controllers/authController.ts
var generateToken = (id, email, role, name) => {
  return import_jsonwebtoken2.default.sign({ id, email, role, name }, JWT_SECRET, { expiresIn: "7d" });
};
var register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }
    if (phone && !/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, message: "Mobile number must be exactly 10 numeric digits" });
    }
    const lowerEmail = email.toLowerCase().trim();
    let existingUser = null;
    if (isMongoConnected()) {
      try {
        existingUser = await User.findOne({ email: lowerEmail });
      } catch {
        existingUser = memoryDb.users.get(lowerEmail);
      }
    } else {
      existingUser = memoryDb.users.get(lowerEmail);
    }
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }
    const hashedPassword = await import_bcryptjs.default.hash(password, 10);
    const userId = "usr_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
    const newUserObj = {
      _id: userId,
      id: userId,
      name,
      email: lowerEmail,
      password: hashedPassword,
      role: "UNASSIGNED",
      // Mandatory default as per requirement
      phone: phone || "",
      address: address || "",
      verificationStatus: true,
      createdAt: /* @__PURE__ */ new Date()
    };
    let savedInMongo = false;
    if (isMongoConnected()) {
      try {
        const dbUser = new User(newUserObj);
        await dbUser.save();
        savedInMongo = true;
      } catch {
      }
    }
    if (!savedInMongo) {
      memoryDb.users.set(lowerEmail, newUserObj);
    }
    const token = generateToken(userId, lowerEmail, "UNASSIGNED", name);
    return res.status(201).json({
      success: true,
      message: "Registration successful. Please select your role.",
      token,
      user: {
        id: userId,
        name,
        email: lowerEmail,
        role: "UNASSIGNED",
        phone: newUserObj.phone,
        address: newUserObj.address
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Server registration error", error: error.message });
  }
};
var login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    const lowerEmail = email.toLowerCase().trim();
    let user = null;
    if (isMongoConnected()) {
      try {
        user = await User.findOne({ email: lowerEmail });
      } catch {
        user = memoryDb.users.get(lowerEmail);
      }
    } else {
      user = memoryDb.users.get(lowerEmail);
    }
    if (!user) {
      user = memoryDb.users.get(lowerEmail);
    }
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await import_bcryptjs.default.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const userId = user._id || user.id;
    const token = generateToken(userId, user.email, user.role, user.name);
    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        address: user.address || "",
        shelterLocation: user.shelterLocation || ""
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server login error", error: error.message });
  }
};
var setRole = async (req, res) => {
  try {
    const { role, shelterLocation } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const validRoles = ["DONOR", "NGO", "VOLUNTEER", "REQUESTER", "ADMIN"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles: ${validRoles.join(", ")}`
      });
    }
    if (role === "ADMIN" && req.user?.email?.toLowerCase().trim() !== "bagya1725@gmail.com") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Admin portal access is strictly restricted to bagya1725@gmail.com"
      });
    }
    let updatedUser = null;
    if (isMongoConnected()) {
      try {
        updatedUser = await User.findByIdAndUpdate(
          userId,
          { role, shelterLocation: shelterLocation || "" },
          { new: true }
        );
      } catch {
      }
    }
    if (!updatedUser) {
      for (const [email, u] of memoryDb.users.entries()) {
        if (u.id === userId || u._id === userId) {
          u.role = role;
          if (shelterLocation) u.shelterLocation = shelterLocation;
          updatedUser = u;
          memoryDb.users.set(email, u);
          break;
        }
      }
    }
    const userEmail = req.user?.email || updatedUser?.email || "";
    const userName = req.user?.name || updatedUser?.name || "";
    const token = generateToken(userId, userEmail, role, userName);
    return res.json({
      success: true,
      message: `Role successfully updated to ${role}`,
      token,
      user: {
        id: userId,
        name: userName,
        email: userEmail,
        role,
        shelterLocation: shelterLocation || updatedUser?.shelterLocation || ""
      }
    });
  } catch (error) {
    console.error("Set role error:", error);
    return res.status(500).json({ success: false, message: "Failed to update user role", error: error.message });
  }
};
var getMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    let user = null;
    if (isMongoConnected()) {
      try {
        user = await User.findById(userId);
      } catch {
      }
    }
    if (!user) {
      for (const u of memoryDb.users.values()) {
        if (u.id === userId || u._id === userId) {
          user = u;
          break;
        }
      }
    }
    if (!user) {
      return res.status(444).json({ success: false, message: "User not found" });
    }
    return res.json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        address: user.address || "",
        shelterLocation: user.shelterLocation || ""
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// server/routes/authRoutes.ts
var router = (0, import_express.Router)();
router.post("/register", register);
router.post("/login", login);
router.put("/set-role", authenticateToken, setRole);
router.get("/me", authenticateToken, getMe);
var authRoutes_default = router;

// server/routes/donationRoutes.ts
var import_express2 = require("express");

// server/models/Donation.ts
var import_mongoose3 = __toESM(require("mongoose"), 1);
var DonationSchema = new import_mongoose3.Schema({
  donorId: { type: String, required: true },
  donorName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  dietary: { type: String, required: true },
  servings: { type: Number, required: true, min: 1 },
  weightKg: { type: Number, required: true, min: 0 },
  expiryHours: { type: Number, required: true, min: 1 },
  pickupAddress: { type: String, required: true },
  photoUrl: { type: String, default: "" },
  status: {
    type: String,
    enum: ["AVAILABLE", "ACCEPTED", "IN_TRANSIT", "DELIVERED"],
    default: "AVAILABLE"
  },
  pickupProofUrl: { type: String, default: "" },
  deliveryProofUrl: { type: String, default: "" },
  requesterId: { type: String },
  requesterName: { type: String },
  destinationAddress: { type: String },
  recipientType: { type: String, enum: ["NGO", "REQUESTER", "COMMUNITY"], default: "NGO" },
  acceptedByNGO: {
    ngoId: String,
    ngoName: String,
    claimedAt: Date
  },
  deliveryMethod: {
    type: String,
    enum: ["SELF_PICKUP", "VOLUNTEER_DELIVERY"]
  },
  assignedVolunteer: {
    volunteerId: String,
    volunteerName: String,
    acceptedAt: Date
  },
  createdAt: { type: Date, default: Date.now }
});
var Donation = import_mongoose3.default.models.Donation || import_mongoose3.default.model("Donation", DonationSchema);

// server/controllers/donationController.ts
var createDonation = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      dietary,
      servings,
      weightKg,
      expiryHours,
      pickupAddress,
      photoUrl,
      deliveryMethod,
      isRequesterNeed,
      destinationAddress
    } = req.body;
    if (!title || !description || !category || !servings) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }
    const donorId = req.user?.id || "anonymous";
    const donorName = req.user?.name || "Partner";
    const donationId = "don_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
    const initialStatus = isRequesterNeed ? "ACCEPTED" : "AVAILABLE";
    const newDonationObj = {
      _id: donationId,
      id: donationId,
      donorId,
      donorName,
      title,
      description,
      category: category || "Cooked Hot Meals",
      dietary: dietary || "Pure Vegetarian",
      servings: Number(servings),
      weightKg: Number(weightKg || 1),
      expiryHours: Number(expiryHours || 6),
      pickupAddress: pickupAddress || "Local Partner Location",
      destinationAddress: destinationAddress || pickupAddress || "Local Recipient Center",
      photoUrl: photoUrl || "",
      status: initialStatus,
      deliveryMethod: deliveryMethod || (isRequesterNeed ? "VOLUNTEER_DELIVERY" : "SELF_PICKUP"),
      recipientType: isRequesterNeed ? "REQUESTER" : "NGO",
      requesterId: isRequesterNeed ? donorId : void 0,
      requesterName: isRequesterNeed ? donorName : void 0,
      createdAt: /* @__PURE__ */ new Date()
    };
    let savedInMongo = false;
    if (isMongoConnected()) {
      try {
        const dbDonation = new Donation(newDonationObj);
        await dbDonation.save();
        savedInMongo = true;
      } catch {
      }
    }
    if (!savedInMongo) {
      memoryDb.donations.set(donationId, newDonationObj);
    }
    return res.status(201).json({
      success: true,
      message: isRequesterNeed ? "Custom food request submitted successfully!" : "Surplus food donation posted successfully!",
      donation: newDonationObj
    });
  } catch (error) {
    console.error("Create donation error:", error);
    return res.status(500).json({ success: false, message: "Failed to post donation/request", error: error.message });
  }
};
var getAvailableDonations = async (req, res) => {
  try {
    let donations = [];
    if (isMongoConnected()) {
      try {
        donations = await Donation.find({ status: "AVAILABLE" }).sort({ createdAt: -1 });
      } catch {
        donations = Array.from(memoryDb.donations.values()).filter((d) => d.status === "AVAILABLE").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } else {
      donations = Array.from(memoryDb.donations.values()).filter((d) => d.status === "AVAILABLE").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return res.json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch donations", error: error.message });
  }
};
var acceptDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryMethod } = req.body;
    const ngoId = req.user?.id || "ngo_user";
    const ngoName = req.user?.name || "Community Shelter NGO";
    const claimDetails = {
      ngoId,
      ngoName,
      claimedAt: /* @__PURE__ */ new Date()
    };
    let updatedDonation = null;
    if (isMongoConnected()) {
      try {
        updatedDonation = await Donation.findByIdAndUpdate(
          id,
          {
            status: "ACCEPTED",
            acceptedByNGO: claimDetails,
            deliveryMethod: deliveryMethod || "VOLUNTEER_DELIVERY"
          },
          { new: true }
        );
      } catch {
      }
    }
    if (!updatedDonation) {
      const donation = memoryDb.donations.get(id);
      if (donation) {
        donation.status = "ACCEPTED";
        donation.acceptedByNGO = claimDetails;
        donation.deliveryMethod = deliveryMethod || "VOLUNTEER_DELIVERY";
        memoryDb.donations.set(id, donation);
        updatedDonation = donation;
      }
    }
    if (!updatedDonation) {
      return res.status(404).json({ success: false, message: "Donation post not found" });
    }
    return res.json({
      success: true,
      message: "Donation claimed successfully!",
      donation: updatedDonation
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to accept donation", error: error.message });
  }
};
var updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, pickupProofUrl, deliveryProofUrl } = req.body;
    const validStatuses = ["AVAILABLE", "ACCEPTED", "IN_TRANSIT", "DELIVERED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    let updatedDonation = null;
    const updateData = { status };
    if (pickupProofUrl) updateData.pickupProofUrl = pickupProofUrl;
    if (deliveryProofUrl) updateData.deliveryProofUrl = deliveryProofUrl;
    if (req.user?.role === "VOLUNTEER" && status === "IN_TRANSIT") {
      updateData.assignedVolunteer = {
        volunteerId: req.user.id,
        volunteerName: req.user.name,
        acceptedAt: /* @__PURE__ */ new Date()
      };
    }
    if (isMongoConnected()) {
      try {
        updatedDonation = await Donation.findByIdAndUpdate(id, updateData, { new: true });
      } catch {
      }
    }
    if (!updatedDonation) {
      const donation = memoryDb.donations.get(id);
      if (donation) {
        Object.assign(donation, updateData);
        memoryDb.donations.set(id, donation);
        updatedDonation = donation;
      }
    }
    if (!updatedDonation) {
      return res.status(404).json({ success: false, message: "Donation post not found" });
    }
    return res.json({
      success: true,
      message: `Donation status updated to ${status}`,
      donation: updatedDonation
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update status", error: error.message });
  }
};
var getMyDonations = async (req, res) => {
  try {
    const userId = req.user?.id;
    let donations = [];
    if (isMongoConnected()) {
      try {
        donations = await Donation.find({ donorId: userId }).sort({ createdAt: -1 });
      } catch {
        donations = Array.from(memoryDb.donations.values()).filter((d) => d.donorId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } else {
      donations = Array.from(memoryDb.donations.values()).filter((d) => d.donorId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return res.json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch your donations", error: error.message });
  }
};
var getNGOClaims = async (req, res) => {
  try {
    const ngoId = req.user?.id;
    let donations = [];
    if (isMongoConnected()) {
      try {
        donations = await Donation.find({ "acceptedByNGO.ngoId": ngoId }).sort({ createdAt: -1 });
      } catch {
        donations = Array.from(memoryDb.donations.values()).filter((d) => d.acceptedByNGO?.ngoId === ngoId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } else {
      donations = Array.from(memoryDb.donations.values()).filter((d) => d.acceptedByNGO?.ngoId === ngoId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return res.json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch NGO claims", error: error.message });
  }
};
var getVolunteerTasks = async (req, res) => {
  try {
    let availableForPickup = [];
    let myTasks = [];
    const volunteerId = req.user?.id;
    if (isMongoConnected()) {
      try {
        availableForPickup = await Donation.find({
          status: "ACCEPTED",
          deliveryMethod: "VOLUNTEER_DELIVERY",
          assignedVolunteer: { $exists: false }
        }).sort({ createdAt: -1 });
        myTasks = await Donation.find({
          "assignedVolunteer.volunteerId": volunteerId
        }).sort({ createdAt: -1 });
      } catch {
        const all = Array.from(memoryDb.donations.values());
        availableForPickup = all.filter((d) => d.status === "ACCEPTED" && d.deliveryMethod === "VOLUNTEER_DELIVERY" && !d.assignedVolunteer);
        myTasks = all.filter((d) => d.assignedVolunteer?.volunteerId === volunteerId);
      }
    } else {
      const all = Array.from(memoryDb.donations.values());
      availableForPickup = all.filter((d) => d.status === "ACCEPTED" && d.deliveryMethod === "VOLUNTEER_DELIVERY" && !d.assignedVolunteer);
      myTasks = all.filter((d) => d.assignedVolunteer?.volunteerId === volunteerId);
    }
    return res.json({
      success: true,
      availableForPickup,
      myTasks
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch volunteer tasks", error: error.message });
  }
};
var getPlatformImpactStats = async (req, res) => {
  try {
    let allDonations = [];
    let allUsers = [];
    if (isMongoConnected()) {
      try {
        allDonations = await Donation.find({});
        allUsers = await User.find({});
      } catch {
        allDonations = Array.from(memoryDb.donations.values());
        allUsers = Array.from(memoryDb.users.values());
      }
    } else {
      allDonations = Array.from(memoryDb.donations.values());
      allUsers = Array.from(memoryDb.users.values());
    }
    const totalMealsRescued = allDonations.reduce((acc, d) => acc + (Number(d.servings) || 0), 0);
    const totalWeightKg = allDonations.reduce((acc, d) => acc + (Number(d.weightKg) || 1), 0);
    const co2PreventionKg = Math.round(totalWeightKg * 2.5);
    const partnerHotelsCount = (/* @__PURE__ */ new Set([
      ...allUsers.filter((u) => u.role === "DONOR").map((u) => u.id || u._id || u.email),
      ...allDonations.map((d) => d.donorId)
    ])).size;
    const communitySheltersCount = (/* @__PURE__ */ new Set([
      ...allUsers.filter((u) => u.role === "NGO" || u.role === "REQUESTER").map((u) => u.id || u._id || u.email),
      ...allDonations.filter((d) => d.acceptedByNGO?.ngoId).map((d) => d.acceptedByNGO?.ngoId),
      ...allDonations.filter((d) => d.requesterId).map((d) => d.requesterId)
    ])).size;
    const completedDeliveriesCount = allDonations.filter((d) => d.status === "DELIVERED").length;
    return res.json({
      success: true,
      stats: {
        totalMealsRescued,
        co2PreventionKg,
        partnerHotelsCount,
        communitySheltersCount,
        completedDeliveriesCount,
        totalDonationsPosted: allDonations.length
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to compute impact stats", error: error.message });
  }
};
var getVerifiedNGOsList = async (req, res) => {
  try {
    let allUsers = [];
    let allDonations = [];
    if (isMongoConnected()) {
      try {
        allUsers = await User.find({ role: { $in: ["NGO", "REQUESTER"] } });
        allDonations = await Donation.find({});
      } catch {
        allUsers = Array.from(memoryDb.users.values()).filter((u) => u.role === "NGO" || u.role === "REQUESTER");
        allDonations = Array.from(memoryDb.donations.values());
      }
    } else {
      allUsers = Array.from(memoryDb.users.values()).filter((u) => u.role === "NGO" || u.role === "REQUESTER");
      allDonations = Array.from(memoryDb.donations.values());
    }
    const ngos = allUsers.map((user) => {
      const uId = user.id || user._id || user.email;
      const mealsReceived = allDonations.filter((d) => d.acceptedByNGO?.ngoId === uId || d.requesterId === uId).reduce((sum, d) => sum + (Number(d.servings) || 0), 0);
      return {
        id: uId,
        name: user.name || "Verified Community Shelter",
        location: user.shelterLocation || user.address || "Local Distribution Center",
        mealsReceived: `${mealsReceived} Meals Received`,
        phone: user.phone || "",
        verifiedAt: "FSSAI Verified"
      };
    });
    const existingIds = new Set(ngos.map((n) => n.id));
    allDonations.forEach((d) => {
      if (d.acceptedByNGO?.ngoId && !existingIds.has(d.acceptedByNGO.ngoId)) {
        existingIds.add(d.acceptedByNGO.ngoId);
        const meals = allDonations.filter((x) => x.acceptedByNGO?.ngoId === d.acceptedByNGO?.ngoId).reduce((sum, x) => sum + (Number(x.servings) || 0), 0);
        ngos.push({
          id: d.acceptedByNGO.ngoId,
          name: d.acceptedByNGO.ngoName || "Community Shelter",
          location: d.destinationAddress || "Local Shelter",
          mealsReceived: `${meals} Meals Received`,
          phone: "",
          verifiedAt: "FSSAI Verified"
        });
      }
    });
    return res.json({
      success: true,
      ngos
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch verified NGOs", error: error.message });
  }
};

// server/routes/donationRoutes.ts
var router2 = (0, import_express2.Router)();
router2.get("/impact-stats", getPlatformImpactStats);
router2.get("/verified-ngos", getVerifiedNGOsList);
router2.post("/", authenticateToken, requireRole(["DONOR", "ADMIN"]), createDonation);
router2.get("/", authenticateToken, getAvailableDonations);
router2.put("/:id/accept", authenticateToken, requireRole(["NGO", "REQUESTER", "ADMIN"]), acceptDonation);
router2.put("/:id/status", authenticateToken, updateStatus);
router2.get("/my", authenticateToken, requireRole(["DONOR", "ADMIN"]), getMyDonations);
router2.get("/ngo-claims", authenticateToken, requireRole(["NGO", "REQUESTER", "ADMIN"]), getNGOClaims);
router2.get("/volunteer-tasks", authenticateToken, requireRole(["VOLUNTEER", "ADMIN"]), getVolunteerTasks);
var donationRoutes_default = router2;

// server.ts
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express3.default)();
  const PORT = 3e3;
  app.use(import_express3.default.json({ limit: "10mb" }));
  app.use(import_express3.default.urlencoded({ extended: true, limit: "10mb" }));
  await connectDB();
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "AharSetu API Backend",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.use("/api/auth", authRoutes_default);
  app.use("/api/donations", donationRoutes_default);
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express3.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} AharSetu Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
//# sourceMappingURL=server.cjs.map
