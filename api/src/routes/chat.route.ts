import { getChats, getOrCreateChat } from "@/controllers/chat.controller";
import { protectRoute } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router.use(protectRoute);

router.get("/", getChats);
router.post("/with/:participantId", getOrCreateChat);

export default router;
