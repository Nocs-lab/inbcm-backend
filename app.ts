import "./config"
import "express-async-errors"
import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import routes from "./routes/routes";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import msgpack from "./msgpack";
import compression from "compression"
import config from "./config"

const errorHandling: ErrorRequestHandler = (err, _req, res, _next) => {
  res.status(500).json({
    msg: err.message,
    success: false,
  });
};

const app = express();

app.use(cors({
  origin: [config.PUBLIC_SITE_URL, config.ADMIN_SITE_URL],
  credentials: true,
  allowedHeaders: ["Content-Type", "Accept"], methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser(config.JWT_SECRET));
app.use(msgpack());
app.use(compression())
app.use("/api", routes);
app.use(errorHandling);

export default app;
