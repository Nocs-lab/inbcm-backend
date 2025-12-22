import winston from "winston"
import { MongoDB } from "winston-mongodb"
import dotenv from "dotenv"

dotenv.config()

const logger = winston.createLogger({
  level: "http",
  defaultMeta: { service: "backend" },
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new MongoDB({
      db: process.env.DB_URL as string,
      collection: "log_erros",
      level: "error",
      options: { useUnifiedTopology: true },
      metaKey: "meta"
    }) as unknown as winston.transport
  ],
  exitOnError: false
})

export default logger
