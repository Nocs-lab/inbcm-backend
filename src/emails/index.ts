import templates from "./templates"
import nodemailer from "nodemailer"

type Templates = {
  "forgot-password": { url: string }
}

const subjects: Record<
  keyof Templates,
  (data: Templates[keyof Templates]) => string
> = {
  "forgot-password": () => "Recuperação de senha"
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

export function sendEmail(
  template: keyof Templates,
  to: string,
  data: Templates[typeof template]
) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: subjects[template](data),
    html: templates[template](data)
  })
}
