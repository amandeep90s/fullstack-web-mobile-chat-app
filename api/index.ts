import "dotenv/config";

import { createServer } from "http";

import app from "@/app";
import { connectDB } from "@/config/database";
import { initializeSocket } from "@/utils/socket";

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

initializeSocket(httpServer);

connectDB()
	.then(() => {
		httpServer.listen(PORT, () => {
			console.log("Server is running on PORT:", PORT);
		});
	})
	.catch((error) => {
		console.error("Failed to start server:", error);
		process.exit(1);
	});
