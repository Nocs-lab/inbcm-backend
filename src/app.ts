import "express-async-errors"
import express, { type ErrorRequestHandler } from "express";
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

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser(config.JWT_SECRET));
app.use(msgpack());
app.use(compression());
app.use("/api", routes);
app.use(errorHandling);

export default app;
