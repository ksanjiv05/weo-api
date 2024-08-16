import express from "express";
import {
  getAiGeneratedLogo,
  getAiGeneratedImg,
  getAiGeneratedChatResponse,
} from "../../controllers/v1/aiController/ai";
import { auth } from "../../middleware/auth";

const router = express.Router();

router.post("/ai/logo", getAiGeneratedLogo);
router.post("/ai/images", auth, getAiGeneratedImg);
router.post("/ai/weo/chat", auth, getAiGeneratedChatResponse);

export default router;
