import config from "../config"
import templates from "./templates"
import nodemailer from "nodemailer"
import Pulse from "@pulsecron/pulse"

type Templates = {
  "forgot-password": { url: string }
  "solicitar-acesso": { name: string }
  "novo-usuario-admin": { nome: string; email: string; horario: string; url: string }
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
  "solicitar-acesso": () => "[INBCM] Solicitação de acesso ao módulo declarante",
  "novo-usuario-admin": () => "[INBCM] Novo usuário solicitou acesso ao INBCM"
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
  to: string | string[]
  data: Templates[keyof Templates]
}>("send-email", async (job) => {
  const { template, to, data } = job.attrs.data

  const recipients = Array.isArray(to) ? to : [to]

  await Promise.all(
    recipients.map(async (recipient) => {
      await transporter.sendMail({
        from: config.EMAIL_FROM,
        to: recipient,
        subject: subjects[template](data),
        html: templates[template]({
          ...data,
          logoUrl: `${config.PUBLIC_SITE_URL}/logo-ibram.png`
        })
      })
    })
  )
})

export function sendEmail(
  template: keyof Templates,
  to: string | string[], // Aceita string ou array de strings
  data: Templates[typeof template]
) {
  return pulse.now("send-email", { template, to, data })
}
