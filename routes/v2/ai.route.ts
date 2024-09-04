import express from "express";
import {
  getAiGeneratedLogo,
  getAiGeneratedImg,
  getAiGeneratedChatResponse,
  getAiGeneratedText,
} from "../../controllers/v1/aiController/ai";
import { auth } from "../../middleware/auth";

const router = express.Router();

router.post("/ai/logo", auth, getAiGeneratedLogo);
router.post("/ai/images", auth, getAiGeneratedImg);
router.post("/ai/weo/chat", auth, getAiGeneratedChatResponse);

router.post("/ai/test", getAiGeneratedText);

export default router;
