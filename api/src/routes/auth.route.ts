import { authCallback, getMe } from "@/controllers/auth.controller";
import { protectRoute } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router.get("/me", protectRoute, getMe);
router.post("/callback", authCallback);

export default router;
