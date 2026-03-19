// fixed-server.js
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get the parent directory where HTML files are located
const projectRoot = path.resolve(__dirname, "..");
console.log("📁 Project root:", projectRoot);

// Serve static files from the parent directory (where HTML files are)
app.use(express.static(projectRoot));

// ==========================
// ✅ API ROUTES (In-Memory Storage)
// ==========================
let users = [];
let contacts = [];
let newsletters = [];
let costEstimates = [];
let userIdCounter = 1;

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "✅ Server is running!",
        timestamp: new Date().toISOString(),
        port: PORT,
        files: {
            cg: fs.existsSync(path.join(projectRoot, "cg.html")),
            admin: fs.existsSync(path.join(projectRoot, "admin.html")),
            adminUsers: fs.existsSync(path.join(projectRoot, "admin-users.html"))
        }
    });
});

// User Registration
app.post("/api/register", (req, res) => {
    try {
        const { username, email, password } = req.body;

        console.log("📝 Registration attempt:", { username, email });

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check if user already exists
        const existingUser = users.find(u => u.email === email || u.username === username);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email or username"
            });
        }

        // Create new user
        const newUser = {
            id: userIdCounter++,
            username,
            email,
            password: password, // In real app, hash this!
            createdAt: new Date()
        };

        users.push(newUser);

        console.log("✅ User registered:", newUser.username);

        res.json({
            success: true,
            message: "User registered successfully!",
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error("❌ Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Registration failed"
        });
    }
});

// User Login
app.post("/api/login", (req, res) => {
    try {
        const { email, password } = req.body;

        console.log("🔐 Login attempt:", { email });

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        // Check password (in real app, use bcrypt)
        if (user.password !== password) {
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            });
        }

        console.log("✅ Login successful:", user.username);

        res.json({
            success: true,
            message: "Login successful!",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
});

// Contact Form
app.post("/api/contact", (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        console.log("📩 Contact form submission:", { name, email, subject });

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email, subject and message are required"
            });
        }

        const newContact = {
            id: contacts.length + 1,
            name,
            email,
            phone: phone || "",
            subject,
            message,
            createdAt: new Date()
        };

        contacts.push(newContact);

        res.json({
            success: true,
            message: "Your message has been received! We'll get back to you soon."
        });
    } catch (error) {
        console.error("❌ Contact form error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send message"
        });
    }
});

// Newsletter Subscription
app.post("/api/newsletter", (req, res) => {
    try {
        const { email } = req.body;

        console.log("📰 Newsletter subscription:", email);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // Check if already subscribed
        const existing = newsletters.find(n => n.email === email);
        if (existing) {
            return res.json({
                success: true,
                message: "You're already subscribed to our newsletter!"
            });
        }

        const newSubscription = {
            id: newsletters.length + 1,
            email,
            subscribedAt: new Date()
        };

        newsletters.push(newSubscription);

        res.json({
            success: true,
            message: "Thank you for subscribing to our newsletter!"
        });
    } catch (error) {
        console.error("❌ Newsletter error:", error);
        res.status(500).json({
            success: false,
            message: "Subscription failed"
        });
    }
});

// Cost Estimate
app.post("/api/cost-estimate", (req, res) => {
    try {
        const { selectedProducts, totalCost } = req.body;

        console.log("💰 Cost estimate request:", { products: selectedProducts?.length, totalCost });

        if (!selectedProducts || !totalCost) {
            return res.status(400).json({
                success: false,
                message: "Products and total cost are required"
            });
        }

        const newEstimate = {
            id: costEstimates.length + 1,
            selectedProducts,
            totalCost,
            createdAt: new Date()
        };

        costEstimates.push(newEstimate);

        res.json({
            success: true,
            message: "Cost estimate saved successfully!",
            estimate: newEstimate
        });
    } catch (error) {
        console.error("❌ Cost estimate error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save estimate"
        });
    }
});

// Get all data (for admin pages)
app.get("/api/contacts", (req, res) => {
    res.json({ success: true, contacts });
});

app.get("/api/newsletters", (req, res) => {
    res.json({ success: true, newsletters });
});

app.get("/api/users", (req, res) => {
    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
    }));
    res.json({ success: true, users: usersWithoutPasswords });
});

// ==========================
// 🏠 ROUTES FOR HTML PAGES
// ==========================
app.get("/", (req, res) => {
    res.sendFile(path.join(projectRoot, "cg.html"));
});

app.get("/admin", (req, res) => {
    res.sendFile(path.join(projectRoot, "admin.html"));
});

app.get("/admin-users", (req, res) => {
    res.sendFile(path.join(projectRoot, "admin-users.html"));
});

// ==========================
// 🚀 START SERVER
// ==========================
app.listen(PORT, () => {
    console.log("=".repeat(60));
    console.log("🚀 SMART HOME HUB SERVER STARTED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log(`📍 Main App:    http://localhost:${PORT}/`);
    console.log(`📍 Admin:       http://localhost:${PORT}/admin`);
    console.log(`📍 User Mgmt:   http://localhost:${PORT}/admin-users`);
    console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
    console.log("=".repeat(60));
    console.log("💡 If you get access denied, try:");
    console.log(`   http://127.0.0.1:${PORT}/`);
    console.log("=".repeat(60));
    console.log("📊 Storage: In-memory (data persists until server restart)");
    console.log("=".repeat(60));
});