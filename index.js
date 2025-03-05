import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandlerMiddleware } from "./middleware/errorHandlerMiddleware.js";
import userRouter from "./src/User/user.routes.js";
import taskRouter from "./src/TaskTracker/task.router.js";
const app = express();
app.use(
  cors({
    origin: "https://task-master-frontend-sigma.vercel.app",
    credentials: true, // ✅ This must be set to allow cookies
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight OPTIONS requests globally
app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRouter);
app.use("/api/task", taskRouter);
app.use(errorHandlerMiddleware);
export default app;
