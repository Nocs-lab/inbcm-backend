import express from "express";
import cors from "cors";
import routes from "./routes/routes";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use("/api", routes);

export default app;
