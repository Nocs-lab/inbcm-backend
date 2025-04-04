import connect from "../db/conn"
import { Permission } from "../models/Permission"
import logger from "../utils/logger"

const setPermissions = async () => {
  await connect()

  const permissions = [
    {
      name: "getAnoDeclaracaoById",
      label: "Pegar ano da declaração por ID",
      description:
        "Recuperar o ano da declaração associada ao ID fornecido, retornando os campos do objeto."
    },
    {
      name: "getPeriodoDeclaracaoVigente",
      label: "Pegar período da declaração vigente",
      description: "Obter o anos com o período atual para o envio declaração."
    },
    {
      name: "getUsuario",
      label: "Pegar dados do usuário logado",
      description:
        "Apresentar os dados do usuário logado, bem como informações do profile e museus relacionados."
    },
    {
      name: "listarItensPorTipodeBem",
      label: "Listar Itens por Tipo de Bem",
      description: "Permite listar os itens de um determinado tipo de bem."
    },
    {
      name: "getAnosValidos",
      label: "Obter Anos Válidos",
      description: "Permite obter os anos válidos para as declarações."
    },
    {
      name: "uploadDeclaracao",
      label: "Fazer Upload de Declaração",
      description: "Permite fazer o upload de uma declaração."
    },
    {
      name: "retificarDeclaracao",
      label: "Retificar Declaração",
      description: "Permite retificar uma declaração previamente enviada."
    },
    {
      name: "downloadDeclaracao",
      label: "Fazer Download de Declaração",
      description: "Permite fazer o download de uma declaração."
    },
    {
      name: "getDeclaracoes",
      label: "Listar Declarações",
      description: "Permite listar todas as declarações cadastradas."
    },
    {
      name: "getDeclaracao",
      label: "Visualizar Declaração",
      description:
        "Permite visualizar os detalhes de uma declaração específica."
    },
    {
      name: "getDeclaracaoAno",
      label: "Visualizar Declaração por Ano",
      description: "Permite visualizar as declarações de um ano específico."
    },
    {
      name: "getItensPorAnoETipo",
      label: "Listar Itens por Ano e Tipo",
      description: "Permite listar itens por ano e tipo de bem."
    },
    {
      name: "excluirDeclaracao",
      label: "Excluir Declaração",
      description: "Permite excluir uma declaração."
    },
    {
      name: "userMuseus",
      label: "Gerenciar Usuários de Museus",
      description: "Permite gerenciar os usuários de museus."
    },
    {
      name: "gerarRecibo",
      label: "Gerar Recibo",
      description: "Permite gerar um recibo para uma declaração ou transação."
    },
    {
      name: "getTimeLine",
      label: "Visualizar Linha do Tempo",
      description:
        "Permite visualizar a linha do tempo das declarações ou eventos."
    },
    {
      name: "atualizarStatusBensDeclaracao",
      label: "Atualizar status por tipo de bem",
      description: "Permite alterar status por tipo de bem"
    },
    {
      name: "atualizarUsuario",
      label: "Atualizar dados conforme os perfis",
      description: "Permite alterar dados conforme o perfil logado"
    },
    {
      name: "gerarReciboDetalhamento",
      label: "Gerar recibo de detalhamento de pendências",
      description:
        "Permite gerar um recibo pdf com detalhamento de pendências do recibo"
    },
    {
      name: "downloadAnalise",
      label: "Gera download de documento de analise",
      description: "Permite realizar download de análise"
    },
    {
      name: "uploadAnalise",
      label: "Realiza upload de analise para o perfil analyst ou admin",
      description: "Permite upload de analise para o perfil analyst ou admin"
    },
    {
      name: "viewDashboard",
      label: "Visualizar a dashboard",
      description:
        "Permite obter o token de autenticação do metabase para visualizar a dashboard do admin"
    },
    {
      name: "getPeriodos",
      label: "Pegar os peridos de submissão",
      description: "Apresentar os dados dos peridos de submissão."
    },
    {name:"getDocumento",
    label: "Permite download do documento compobratório",
    description:"Permite donwload de documento comprobatório"
    }
  ]

  try {
    for (const permission of permissions) {
      // Verifica pelo nome se a permissão já existe
      const existingPermission = await Permission.findOne({
        name: permission.name
      })

      if (!existingPermission) {
        await Permission.create(permission)
        logger.info(`Permissão "${permission.name}" criada com sucesso!`)
      } else {
        logger.info(`Permissão "${permission.name}" já existe. Ignorando...`)
      }
    }

    process.exit(0)
  } catch (error) {
    console.error("Erro ao criar permissões:", error)
    process.exit(1)
  }
}

setPermissions()
