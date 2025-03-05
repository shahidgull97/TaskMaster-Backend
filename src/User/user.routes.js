import express from "express";
import {
  createNewUser,
  userLogin,
  logoutUser,
  isLoggedIn,
} from "./user.controller.js";
import { auth } from "../../middleware/auth.js";

const router = express.Router();

router.route("/signup").post(createNewUser);
router.route("/login").post(userLogin);
router.route("/isloggedin").get(auth, isLoggedIn);
router.route("/logout").get(auth, logoutUser);

export default router;
