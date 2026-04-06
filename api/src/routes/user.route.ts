import { getUsers } from "@/controllers/user.controller";
import { protectRoute } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router.get("/", protectRoute, getUsers);

export default router;
