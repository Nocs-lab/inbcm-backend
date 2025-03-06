import config from "../config"
import templates from "./templates"
import nodemailer from "nodemailer"

type Templates = {
  "forgot-password": { url: string }
  "solicitar-acesso": { name: string }
}

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

export function sendEmail(
  template: keyof Templates,
  to: string,
  data: Templates[typeof template]
) {
  return transporter.sendMail({
    from: config.EMAIL_FROM,
    to,
    subject: subjects[template](data),
    html: templates[`${template}.hbs`](data)
  })
}
