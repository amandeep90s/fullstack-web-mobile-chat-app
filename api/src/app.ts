import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express from "express";
import path from "path";

import { errorHandler } from "@/middleware/errorHandler";
import authRoutes from "@/routes/auth.route";
import chatRoutes from "@/routes/chat.route";
import messageRoutes from "@/routes/message.route";
import userRoutes from "@/routes/user.route";

const app = express();

const allowedOrigins = [process.env.FRONTEND_URL, process.env.MOBILE_APP_URL].filter(Boolean) as string[];

// Enable CORS for the specified origins and allow credentials (cookies, authorization headers, etc.)
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Middleware to parse JSON bodies in requests - this is important for our API to work correctly
app.use(express.json());
app.use(clerkMiddleware()); // Add Clerk middleware to handle authentication

app.get("/health", (req, res) => {
	res.json({ status: "ok", message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

// error handlers must come after all the routes and other middlewares so they can catch errors passed with next(err) or thrown inside async handlers.
app.use(errorHandler);

// Serve frontend assets in production
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "../../web/dist")));

	app.get("/{*any}", (_, res) => {
		res.sendFile(path.join(__dirname, "../../web/dist/index.html"));
	});
}

export default app;
