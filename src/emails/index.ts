import config from "../config"
import templates from "./templates"
import nodemailer from "nodemailer"
import Pulse from "@pulsecron/pulse"
import { UsuarioService } from "../service/UserService"
import Mail from "nodemailer/lib/mailer"
import ConfiguracaoEmailModel from "../models/Configuracao/email"

type Templates = {
  "forgot-password": { url: string }
  "solicitar-acesso": { name: string }
  "novo-usuario-admin": {
    nome: string
    email: string
    horario: string
    url: string
  }
  "reprovacao-cadastro-usuario": { nome: string }
  "confirmacao-envio-declaracao": {
    url: string
    horario: string
    response: object
    museu: object
    anoReferencia: number
  }
  "confirmacao-retificacao-declaracao": {
    url: string
    horario: string
    response: object
    museu: object
    anoReferencia: number
    hashOriginal: string
  }
  "declaracao-em-conformidade": {
    dataAtual: string
    hash: string
    url: string
    museu: string
  }
  "declaracao-nao-conformidade": {
    dataAtual: string
    hash: string
    url: string
    museu: string
  }
  "declaracao-recebida": {
    dataAtual: string
    hash: string
    url: string
    museu: string
    anoReferencia: string
  }
  "declaracao-em-analise": {
    dataAtual: string
    hash: string
    url: string
    museu: string
    anoReferencia: string
    analistas?: string[]
  }
  "prazo-declaracao": {
    dataFim: string
    diasFim: number
    anoReferencia: number
  }
  "prazo-retificacao": {
    dataFim: string
    diasFim: number
    anoReferencia: number
  }
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
  "solicitar-acesso": () =>
    "[INBCM] Solicitação de acesso ao módulo declarante",
  "novo-usuario-admin": () => "[INBCM] Novo usuário solicitou acesso ao INBCM",
  "reprovacao-cadastro-usuario": () =>
    "[INBCM] Seu acesso ao INBCM foi reprovado.",
  "confirmacao-envio-declaracao": () =>
    "[INBCM] Sua declaração foi recebida com sucesso!",
  "confirmacao-retificacao-declaracao": () =>
    "[INBCM] Sua declaração retificadora foi recebida com sucesso!",
  "declaracao-em-conformidade": () =>
    "[INBCM] Atualização na situação de declaração para conforme!",
  "declaracao-nao-conformidade": () =>
    "[INBCM] Atualização na situação de declaração para não conforme",
  "declaracao-recebida": () =>
    "[INBCM] Declaração recebida com sucesso!",
  "declaracao-em-analise": () =>
    "[INBCM] Declaração enviada para análise",
  "prazo-declaracao": () => "[INBCM] Prazo para envio de declaração",
  "prazo-retificacao": () => "[INBCM] Prazo para retificação de declaração"
}

async function getSender() {
  const config = await ConfiguracaoEmailModel.findOne({})

  if (!config) {
    throw new Error("Configuração de e-mail não definida")
  }

  const transporter = nodemailer.createTransport({
    host: config.emailHost,
    port: config.emailPort,
    auth: {
      user: config.emailUser,
      pass: config.emailPass
    }
  })

  return (options: Omit<Mail.Options, "from">) => transporter.sendMail({ ...options, from: config.emailFrom })
}

pulse.define<{
  template: keyof Templates
  to: string | string[]
  data: Templates[keyof Templates]
}>("send-email", async (job) => {
  const { template, to, data } = job.attrs.data

  const recipients = Array.isArray(to) ? to : [to]
  const sendEmail = await getSender()

  await Promise.all(
    recipients.map(async (recipient) => {
      await sendEmail({
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

pulse.define<{
  template: keyof Templates
  data: Templates[keyof Templates]
}>("send-email-to-all", async (job) => {
  const { template, data } = job.attrs.data

  const users = await UsuarioService.buscarUsuarios()
  const sendEmail = await getSender()

  await sendEmail({
    to: users.map((user) => user.email),
    subject: subjects[template](data),
    html: templates[template]({
      ...data,
      logoUrl: `${config.PUBLIC_SITE_URL}/logo-ibram.png`
    })
  })
})

export function sendEmail(
  template: keyof Templates,
  to: string | string[], // Aceita string ou array de strings
  data: Templates[typeof template]
) {
  return pulse.now("send-email", { template, to, data })
}

export function sheduleEmail(
  template: keyof Templates,
  to: string | string[], // Aceita string ou array de strings
  data: Templates[typeof template],
  date: Date
) {
  return pulse.schedule(date, "send-email", { template, to, data })
}

export function sheduleEmailToAll(
  template: keyof Templates,
  data: Templates[typeof template],
  date: Date
) {
  return pulse.schedule(date, "send-email-to-all", { template, data })
}
