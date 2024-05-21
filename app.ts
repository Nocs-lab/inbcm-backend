import "./config"
import express from "express";
import cors from "cors";
import routes from "./routes/routes";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({ origin: ["https://localhost:5173", "https://localhost:5174"], credentials: true, allowedHeaders: ["Content-Type", "Accept"], methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET!))
app.use("/api", routes);

export default app;
