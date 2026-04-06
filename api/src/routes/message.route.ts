import { getMessages } from "@/controllers/message.controller";
import { protectRoute } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router.get("/chat/:chatId", protectRoute, getMessages);

export default router;
