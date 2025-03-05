import express from "express";
import {
  createTask,
  updateTask,
  deleteTask,
  getTasks,
  dashboard,
} from "./task.controller.js";
import { auth } from "../../middleware/auth.js";

const router = express.Router();

router.route("/createTask").post(auth, createTask);
router.route("/updateTask/:id").post(auth, updateTask);
router.route("/dashboard").get(auth, dashboard);

router.route("/deleteTask/:id").delete(auth, deleteTask);
router.route("/getTasks").get(auth, getTasks);

export default router;
