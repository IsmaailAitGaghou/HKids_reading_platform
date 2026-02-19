import { Router } from "express";
import { attachAuthIfPresent, requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  getCurrentUser,
  loginChildWithPin,
  loginUser,
  registerUser
} from "./auth.controller";
import { childPinLoginBodySchema, loginBodySchema, registerUserBodySchema } from "./auth.schema";

const router = Router();

router.post("/register", attachAuthIfPresent, validate({ body: registerUserBodySchema }), registerUser);
router.post("/login", validate({ body: loginBodySchema }), loginUser);
router.post("/child/pin", validate({ body: childPinLoginBodySchema }), loginChildWithPin);
router.get("/me", requireAuth, getCurrentUser);

export default router;
