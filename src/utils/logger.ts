import winston from "winston"
import S3Transport from "winston-s3-transport"
import { format } from "date-fns"
import { randomUUID } from "crypto"

const s3Transport = new S3Transport({
  s3ClientConfig: {
    region: "us-east-1",
    endpoint:
      process.env.NODE_ENV === "production"
        ? "http://minio:9000"
        : "http://localhost:9000",
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY!,
      secretAccessKey: process.env.MINIO_SECRET_KEY!
    }
  },
  s3TransportConfig: {
    bucket: "inbcm",
    bucketPath: (group: string = "default") => {
      const date = new Date()
      const timestamp = format(date, "yyyyMMddhhmmss")
      const uuid = randomUUID()
      return `/logs/${group}/${timestamp}/${uuid}.log`
    }
  }
})

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
  transports: [new winston.transports.Console(), s3Transport],
  exitOnError: false
})

export default logger
