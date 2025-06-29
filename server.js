const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const session = require("express-session");
const cron = require("node-cron");
require("dotenv").config();
const fetch = (...args) =>
	import("node-fetch").then((mod) => mod.default(...args));

const app = express();
const PORT = 5000;

app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	})
);
app.use(express.json());
app.use(
	session({
		secret: "someSecretKey",
		resave: false,
		saveUninitialized: false,
		cookie: {
			sameSite: "lax", // or "none" if using HTTPS
			secure: false, // true if using HTTPS
		},
	})
);

// Serve static files from the 'dist' directory
const path = require("path");
app.use(express.static(path.join(__dirname, "dist")));

// MongoDB setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "forum";

const PERSPECTIVE_API = process.env.PERSPECTIVE_API;

app.post("/api/signup", async (req, res) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return res
			.status(400)
			.json({ message: "Username and password required." });
	}
	// Array of possible colors
	const COLORS = [
		// light blue
		"#77b9e1",
		// light purple
		"#c295eb",
		// light green
		"#a6de2f",
		// yellow
		"#ffc200",
		// dark green
		"#48d9a4",
		// light purple
		"#e959df",
		// olive green
		"#d2e734",
	];
	// Pick a random color
	const color = COLORS[Math.floor(Math.random() * COLORS.length)];
	try {
		await client.connect();
		const db = client.db(dbName);
		const users = db.collection("users");
		const existing = await users.findOne({ username });
		if (existing) {
			return res
				.status(409)
				.json({ message: "Username already exists." });
		}
		// Store the color in the user document
		await users.insertOne({
			username,
			password,
			admin: false,
			banned: false,
			color,
		});
		res.json({ message: "User created successfully." });
	} catch (err) {
		res.status(500).json({ message: "Server error." });
	}
});

app.post("/api/login", async (req, res) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return res
			.status(400)
			.json({ message: "Username and password required." });
	}
	try {
		await client.connect();
		const db = client.db("forum");
		const users = db.collection("users");
		const user = await users.findOne({ username, password });
		if (!user) {
			return res
				.status(401)
				.json({ message: "Invalid username or password." });
		}
		req.session.user = { username: user.username, admin: user.admin };
		res.json({ message: "Login successful.", admin: user.admin === true });
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: "Server error." });
	}
});

app.get("/api/check-auth", (req, res) => {
	if (req.session.user) {
		res.json({ loggedIn: true, username: req.session.user.username });
	} else {
		res.status(401).json({ loggedIn: false });
	}
});

app.post("/api/post", async (req, res) => {
	if (!req.session.user) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const { topic, body } = req.body;
	if (!topic || !body) {
		return res.status(400).json({ message: "Invalid post." });
	}

	try {
		await client.connect();
		const db = client.db("forum");
		const users = db.collection("users");
		const user = await users.findOne({
			username: req.session.user.username,
		});

		// Check if banned
		if (user?.banned) {
			return res
				.status(403)
				.json({ message: "You have been banned from posting." });
		}

		// Only allow admins to post in "rules"
		if (topic === "rules" && !user?.admin) {
			return res.status(400).json({ message: "Invalid post." });
		}

		const now = Date.now();
		const cooldownUntil = user?.cooldownUntil || 0;
		if (cooldownUntil > now) {
			const secondsLeft = Math.ceil((cooldownUntil - now) / 1000);
			return res.status(429).json({
				message: `Please wait ${secondsLeft}s before posting again.`,
				cooldown: cooldownUntil,
			});
		}

		// --- Perspective API check ---
		if (!PERSPECTIVE_API) {
			return res
				.status(500)
				.json({ message: "Perspective API key not set on server." });
		}
		let perspectiveData, toxicity;
		try {
			const perspectiveRes = await fetch(
				`https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_API}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						comment: { text: body },
						requestedAttributes: { TOXICITY: {} },
					}),
				}
			);
			perspectiveData = await perspectiveRes.json();
			toxicity =
				perspectiveData.attributeScores?.TOXICITY?.summaryScore
					?.value || 0;
		} catch (err) {
			console.error("Perspective API error:", err);
			return res
				.status(500)
				.json({ message: "Error checking post for harmful content." });
		}
		if (toxicity >= 0.8) {
			const newCooldownUntil = now + 60000;
			await users.updateOne(
				{ username: req.session.user.username },
				{ $set: { cooldownUntil: newCooldownUntil } }
			);
			return res.status(400).json({
				message: "Your post was detected as harmful.",
				cooldown: newCooldownUntil,
			});
		}
		// --- End Perspective API check ---

		const color = user?.color || "#ff4500";
		const posts = db.collection(topic);
		await posts.insertOne({
			body,
			username: req.session.user.username,
			color,
			createdAt: new Date(),
		});

		const newCooldownUntil = now + 60000;
		await users.updateOne(
			{ username: req.session.user.username },
			{ $set: { cooldownUntil: newCooldownUntil } }
		);

		// Set 1s cooldown for all other users
		await users.updateMany(
			{ username: { $ne: req.session.user.username } },
			{ $set: { cooldownUntil: now + 1000 } }
		);

		res.json({ message: "Post added.", cooldown: newCooldownUntil });
	} catch (err) {
		res.status(500).json({ message: "Server error." });
	}
});

app.get("/api/rules", async (req, res) => {
	try {
		await client.connect();
		const db = client.db("forum");
		const rules = db.collection("rules");
		const posts = await rules.find({}).toArray();
		res.json(posts);
	} catch (err) {
		res.status(500).json({ message: "Server error." });
	}
});

app.get("/api/topic/:topic", async (req, res) => {
	const topic = req.params.topic;
	if (!topic || topic === "rules") {
		return res.status(400).json({ message: "Invalid topic." });
	}
	try {
		await client.connect();
		const db = client.db("forum");
		const posts = db.collection(topic);
		const result = await posts.find({}).sort({ createdAt: 1 }).toArray();
		res.json(result);
	} catch (err) {
		res.status(500).json({ message: "Server error." });
	}
});

const { ObjectId } = require("mongodb");

app.delete("/api/delete-post", async (req, res) => {
	if (!req.session.user) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const { topic, postId } = req.body;
	if (!topic || !postId) {
		return res.status(400).json({ message: "Invalid request." });
	}

	try {
		await client.connect();
		const db = client.db("forum");
		const collection = db.collection(topic);
		const result = await collection.deleteOne({
			_id: new ObjectId(postId),
		});

		res.json({ message: "Post deleted." });
	} catch (err) {
		res.status(500).json({ message: "Server error." });
	}
});

app.post("/api/ban-user", async (req, res) => {
	if (!req.session.user) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const banningUser = req.session.user.username;
	const targetUsername = req.body.username;

	if (!targetUsername) {
		return res.status(400).json({ message: "Username required." });
	}

	try {
		await client.connect();
		const db = client.db("forum");
		const users = db.collection("users");

		const banningUserDoc = await users.findOne({ username: banningUser });
		const targetUserDoc = await users.findOne({ username: targetUsername });

		if (!banningUserDoc?.admin) {
			return res.status(403).json({ message: "Admins only." });
		}

		if (!targetUserDoc) {
			return res.status(404).json({ message: "Target user not found." });
		}

		if (targetUserDoc.username === banningUser) {
			return res
				.status(400)
				.json({ message: "You cannot ban yourself." });
		}

		if (targetUserDoc.admin === true) {
			return res
				.status(400)
				.json({ message: "You cannot ban another admin." });
		}

		if (targetUserDoc.banned === true) {
			return res.status(400).json({ message: "User is already banned." });
		}

		await users.updateOne(
			{ username: targetUsername },
			{ $set: { banned: true } }
		);

		res.json({ message: "User banned." });
	} catch (err) {
		res.status(500).json({ message: "Server error." });
	}
});

app.post("/api/logout", (req, res) => {
	req.session.destroy(() => {
		res.clearCookie("connect.sid");
		res.json({ message: "Logged out" });
	});
});

// Delete all topic collections daily at midnight UTC, except "users" and "rules"
cron.schedule("0 0 * * *", async () => {
	try {
		await client.connect();
		const db = client.db("forum");

		const collections = await db.listCollections().toArray();

		for (const col of collections) {
			if (col.name !== "users" && col.name !== "rules") {
				await db.collection(col.name).drop();
				console.log(`Dropped collection: ${col.name}`);
			}
		}

		console.log(
			"Topic collections deleted (except users and rules) at midnight UTC."
		);
	} catch (err) {
		console.error("Error during daily cleanup:", err.message);
	}
});

// Fallback: serve index.html for any non-API route (for React Router)
app.get(/^\/(?!api).*/, (req, res) => {
	res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
