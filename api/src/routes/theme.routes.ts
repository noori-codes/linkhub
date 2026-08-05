import { Router } from "express";

import { getAllThemes } from "../controllers/theme.controller.js";

const router = Router();

router.get("/", getAllThemes);

export default router;
