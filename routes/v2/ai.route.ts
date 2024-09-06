import express from "express";
import {
  getAiGeneratedLogo,
  getAiGeneratedImg,
  getAiGeneratedChatResponse,
  getAiGeneratedText,
} from "../../controllers/v1/aiController/ai";
import { auth } from "../../middleware/auth";
import aiImgRateLimiterMiddleware from "../../middleware/aiImgRateLimit";

const router = express.Router();

router.post("/ai/logo", auth, aiImgRateLimiterMiddleware, getAiGeneratedLogo);
router.post("/ai/images", auth, aiImgRateLimiterMiddleware, getAiGeneratedImg);
router.post("/ai/weo/chat", auth, getAiGeneratedChatResponse);

router.post("/ai/text", getAiGeneratedText);

export default router;
