// server.js - Complete Working Backend for KitchenIQ Hub
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// ==========================
// ✅ MIDDLEWARE
// ==========================
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from parent directory
const projectRoot = path.resolve(__dirname, "..");
app.use(express.static(projectRoot));

// ==========================
// 📦 IN-MEMORY DATABASE
// ==========================
let users = [];
let contacts = [];
let newsletters = [];
let costEstimates = [];
let userIdCounter = 1;
let contactIdCounter = 1;
let estimateIdCounter = 1;

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
// 🔐 AUTHENTICATION API
// ==========================

// Health Check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "✅ KitchenIQ Hub Server is running perfectly!",
        timestamp: new Date().toISOString(),
        data: {
            users: users.length,
            contacts: contacts.length,
            newsletters: newsletters.length,
            estimates: costEstimates.length
        }
    });
});

// User Registration
app.post("/api/register", (req, res) => {
    try {
        const { username, email, password } = req.body;

        console.log("📝 Registration attempt:", { username, email });

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (username.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Username must be at least 3 characters"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // Check if user exists
        const existingUser = users.find(u => u.email === email || u.username === username);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email or username"
            });
        }

        // Create user
        const newUser = {
            id: userIdCounter++,
            username,
            email,
            password: password, // In production, hash this!
            createdAt: new Date()
        };

        users.push(newUser);
        console.log("✅ User registered:", username);

        res.json({
            success: true,
            message: "Registration successful! You can now login.",
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
            message: "Internal server error during registration"
        });
    }
});

// User Login
app.post("/api/login", (req, res) => {
    try {
        const { email, password } = req.body;

        console.log("🔐 Login attempt:", email);

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
                message: "User not found. Please check your email."
            });
        }

        // Check password
        if (user.password !== password) {
            return res.status(400).json({
                success: false,
                message: "Invalid password. Please try again."
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
            message: "Internal server error during login"
        });
    }
});

// ==========================
// 📞 CONTACT & NEWSLETTER API
// ==========================

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
            id: contactIdCounter++,
            name,
            email,
            phone: phone || "Not provided",
            subject,
            message,
            createdAt: new Date()
        };

        contacts.push(newContact);

        res.json({
            success: true,
            message: "Thank you for your message! We'll get back to you soon."
        });

    } catch (error) {
        console.error("❌ Contact form error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send message. Please try again."
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

        // Basic email validation
        if (!email.includes('@')) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        // Check if already subscribed
        const existing = newsletters.find(n => n.email === email);
        if (existing) {
            return res.json({
                success: true,
                message: "You're already subscribed to our newsletter! Thank you."
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
            message: "Thank you for subscribing to our newsletter! You'll receive updates soon."
        });

    } catch (error) {
        console.error("❌ Newsletter error:", error);
        res.status(500).json({
            success: false,
            message: "Subscription failed. Please try again."
        });
    }
});

// ==========================
// 💰 COST ESTIMATION API
// ==========================

// Save Cost Estimate
app.post("/api/cost-estimate", (req, res) => {
    try {
        const { selectedProducts, totalCost } = req.body;

        console.log("💰 Cost estimate request:", { 
            products: selectedProducts?.length, 
            totalCost 
        });

        if (!selectedProducts || selectedProducts.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please select at least one product"
            });
        }

        if (!totalCost || totalCost <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid total cost"
            });
        }

        const newEstimate = {
            id: estimateIdCounter++,
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
            message: "Failed to save estimate. Please try again."
        });
    }
});

// ==========================
// 📊 ADMIN API ROUTES
// ==========================

// Get all contacts (for admin)
app.get("/api/admin/contacts", (req, res) => {
    try {
        res.json({
            success: true,
            contacts: contacts
        });
    } catch (error) {
        console.error("❌ Get contacts error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch contacts"
        });
    }
});

// Get all newsletters (for admin)
app.get("/api/admin/newsletters", (req, res) => {
    try {
        res.json({
            success: true,
            newsletters: newsletters
        });
    } catch (error) {
        console.error("❌ Get newsletters error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch newsletters"
        });
    }
});

// Get all users (for admin)
app.get("/api/admin/users", (req, res) => {
    try {
        // Remove passwords from response
        const usersWithoutPasswords = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt
        }));

        res.json({
            success: true,
            users: usersWithoutPasswords
        });
    } catch (error) {
        console.error("❌ Get users error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
});

// Get all cost estimates (for admin)
app.get("/api/admin/cost-estimates", (req, res) => {
    try {
        res.json({
            success: true,
            estimates: costEstimates
        });
    } catch (error) {
        console.error("❌ Get estimates error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch estimates"
        });
    }
});

// Get dashboard statistics
app.get("/api/admin/stats", (req, res) => {
    try {
        const stats = {
            totalUsers: users.length,
            totalContacts: contacts.length,
            totalNewsletters: newsletters.length,
            totalEstimates: costEstimates.length,
            recentUsers: users.filter(u => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(u.createdAt) > weekAgo;
            }).length
        };

        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error("❌ Get stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch statistics"
        });
    }
});

// Delete contact
app.delete("/api/admin/contacts/:id", (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = contacts.findIndex(c => c.id === id);
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        contacts.splice(index, 1);
        res.json({
            success: true,
            message: "Contact deleted successfully"
        });
    } catch (error) {
        console.error("❌ Delete contact error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete contact"
        });
    }
});

// Delete newsletter
app.delete("/api/admin/newsletters/:id", (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = newsletters.findIndex(n => n.id === id);
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Subscriber not found"
            });
        }

        newsletters.splice(index, 1);
        res.json({
            success: true,
            message: "Subscriber deleted successfully"
        });
    } catch (error) {
        console.error("❌ Delete newsletter error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete subscriber"
        });
    }
});

// Delete user
app.delete("/api/admin/users/:id", (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = users.findIndex(u => u.id === id);
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        users.splice(index, 1);
        res.json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("❌ Delete user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete user"
        });
    }
});

// Delete estimate
app.delete("/api/admin/estimates/:id", (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = costEstimates.findIndex(e => e.id === id);
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Estimate not found"
            });
        }

        costEstimates.splice(index, 1);
        res.json({
            success: true,
            message: "Estimate deleted successfully"
        });
    } catch (error) {
        console.error("❌ Delete estimate error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete estimate"
        });
    }
});

// ==========================
// 🚀 START SERVER
// ==========================
app.listen(PORT, () => {
    console.log("=".repeat(60));
    console.log("🚀 KITCHENIQ HUB SERVER STARTED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`📍 Alternative: http://127.0.0.1:${PORT}`);
    console.log("=".repeat(60));
    console.log("📊 Endpoints:");
    console.log(`   🔗 Main App:    http://localhost:${PORT}/`);
    console.log(`   🔗 Admin:       http://localhost:${PORT}/admin`);
    console.log(`   🔗 Users:       http://localhost:${PORT}/admin-users`);
    console.log(`   🔗 Health:      http://localhost:${PORT}/api/health`);
    console.log("=".repeat(60));
    console.log("💡 Storage: In-memory (data persists until server restart)");
    console.log("=".repeat(60));
});