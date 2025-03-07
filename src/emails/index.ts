import config from "../config"
import templates from "./templates"
import nodemailer from "nodemailer"
import Pulse from "@pulsecron/pulse"

type Templates = {
  "forgot-password": { url: string }
  "solicitar-acesso": { name: string }
}

const pulse = new Pulse({
  db: { address: config.DB_URL, collection: "jobs" },
  defaultConcurrency: 10,
  maxConcurrency: 10,
  resumeOnRestart: true,
  processEvery: "10 seconds"
})

pulse.start()

const subjects: Record<
  keyof Templates,
  (data: Templates[keyof Templates]) => string
> = {
  "forgot-password": () => "Recuperação de senha",
  "solicitar-acesso": () => "[INBCM] Solicitação de acesso ao módulo declarante"
}

const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS
  }
})

pulse.define<{
  template: keyof Templates
  to: string
  data: Templates[keyof Templates]
}>("send-email", async (job) => {
  const { template, to, data } = job.attrs.data

  await transporter.sendMail({
    from: config.EMAIL_FROM,
    to,
    subject: subjects[template](data),
    html: templates[template]({
      ...data,
      logoUrl: `${config.PUBLIC_SITE_URL}/logo-ibram.png`
    })
  })
})

export function sendEmail(
  template: keyof Templates,
  to: string,
  data: Templates[typeof template]
) {
  return pulse.now("send-email", { template, to, data })
}
