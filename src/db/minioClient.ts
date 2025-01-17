import * as Minio from "minio"
import config from "../config"
import logger from "../utils/logger"

logger.info("Conectando ao Minio...")
const minioConfig = {
  endPoint: config.MINIO_ENDPOINT,
  port: config.MINIO_PORT,
  useSSL: config.MINIO_USE_SSL === "true",
  accessKey: config.MINIO_ACCESS_KEY,
  secretKey: config.MINIO_SECRET_KEY
}
logger.info(JSON.stringify(minioConfig, null, 2))

const minioClient = new Minio.Client(minioConfig)
export default minioClient
