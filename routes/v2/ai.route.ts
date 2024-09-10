import express from "express";
import {
  getAiGeneratedLogo,
  getAiGeneratedImg,
  getAiGeneratedChatResponse,
  getAiGeneratedText,
} from "../../controllers/v2/aiController/ai";
import { auth } from "../../middleware/auth";
import aiImgRateLimiterMiddleware from "../../middleware/aiImgRateLimit";

const router = express.Router();

router.post("/ai/logo", auth, getAiGeneratedLogo);
router.post("/ai/images", auth, getAiGeneratedImg);
router.post("/ai/weo/chat", auth, getAiGeneratedChatResponse);

router.post("/ai/text", getAiGeneratedText);

export default router;
