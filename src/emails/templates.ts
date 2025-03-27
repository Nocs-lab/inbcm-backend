/* eslint-disable */
// @ts-nocheck
import Handlebars from "handlebars"
var template = Handlebars.template,
  templates = (Handlebars.templates = Handlebars.templates || {})
templates["aprovacao-cadastro-usuario"] = template({
  "1": function (container, depth0, helpers, partials, data) {
    var helper,
      alias1 = depth0 != null ? depth0 : container.nullContext || {},
      alias2 = container.hooks.helperMissing,
      alias3 = "function",
      alias4 = container.escapeExpression,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName]
          }
          return undefined
        }

    return (
      '\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Olá, ' +
      alias4(
        ((helper =
          (helper =
            lookupProperty(helpers, "nome") ||
            (depth0 != null ? lookupProperty(depth0, "nome") : depth0)) != null
            ? helper
            : alias2),
        typeof helper === alias3
          ? helper.call(alias1, {
              name: "nome",
              hash: {},
              data: data,
              loc: {
                start: { line: 4, column: 7 },
                end: { line: 4, column: 15 }
              }
            })
          : helper)
      ) +
      ',</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Seu cadastro na plataforma INBCM foi aprovado. Agora você pode acessar o sistema utilizando as credenciais abaixo:</p>\n\n\n<ul style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; padding: 0;">\n  <li style="margin-bottom: 16px;">E-mail: ' +
      alias4(
        ((helper =
          (helper =
            lookupProperty(helpers, "email") ||
            (depth0 != null ? lookupProperty(depth0, "email") : depth0)) != null
            ? helper
            : alias2),
        typeof helper === alias3
          ? helper.call(alias1, {
              name: "email",
              hash: {},
              data: data,
              loc: {
                start: { line: 11, column: 43 },
                end: { line: 11, column: 52 }
              }
            })
          : helper)
      ) +
      '</li>\n  <li style="margin-bottom: 16px;">Senha temporária: ' +
      alias4(
        ((helper =
          (helper =
            lookupProperty(helpers, "senha") ||
            (depth0 != null ? lookupProperty(depth0, "senha") : depth0)) != null
            ? helper
            : alias2),
        typeof helper === alias3
          ? helper.call(alias1, {
              name: "senha",
              hash: {},
              data: data,
              loc: {
                start: { line: 12, column: 53 },
                end: { line: 12, column: 62 }
              }
            })
          : helper)
      ) +
      '</li>\n</ul>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Por motivos de segurança, altere sua senha no primeiro acesso.</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Para acessar a plataforma, clique no link abaixo:</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  ' +
      alias4(
        ((helper =
          (helper =
            lookupProperty(helpers, "url") ||
            (depth0 != null ? lookupProperty(depth0, "url") : depth0)) != null
            ? helper
            : alias2),
        typeof helper === alias3
          ? helper.call(alias1, {
              name: "url",
              hash: {},
              data: data,
              loc: {
                start: { line: 22, column: 2 },
                end: { line: 22, column: 9 }
              }
            })
          : helper)
      ) +
      '</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Se você não realizou essa solicitação ou precisa de suporte, entre em contato com nossa equipe de administração.</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Atenciosamente,</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Equipe INBCM</p>\n\n'
    )
  },
  compiler: [8, ">= 4.3.0"],
  main: function (container, depth0, helpers, partials, data) {
    var stack1,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName]
          }
          return undefined
        }

    return (stack1 = container.invokePartial(
      lookupProperty(partials, "layout"),
      depth0,
      {
        name: "layout",
        hash: { title: "[INBCM] Seu acesso ao INBCM foi aprovado!" },
        fn: container.program(1, data, 0),
        inverse: container.noop,
        data: data,
        helpers: helpers,
        partials: partials,
        decorators: container.decorators
      }
    )) != null
      ? stack1
      : ""
  },
  usePartial: true,
  useData: true
})
templates["button"] = template({
  compiler: [8, ">= 4.3.0"],
  main: function (container, depth0, helpers, partials, data) {
    var stack1,
      helper,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName]
          }
          return undefined
        }

    return (
      '<table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%; min-width: 100%;" width="100%">\n  <tbody>\n    <tr>\n      <td align="left" style="font-family: Helvetica, sans-serif; font-size: 16px; vertical-align: top; padding-bottom: 16px;" valign="top">\n        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">\n          <tbody>\n            <tr>\n              <td style="font-family: Helvetica, sans-serif; font-size: 16px; vertical-align: top; border-radius: 4px; text-align: center; background-color: #0867ec;" valign="top" align="center" bgcolor="#0867ec"> <a href="' +
      container.escapeExpression(
        ((helper =
          (helper =
            lookupProperty(helpers, "url") ||
            (depth0 != null ? lookupProperty(depth0, "url") : depth0)) != null
            ? helper
            : container.hooks.helperMissing),
        typeof helper === "function"
          ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
              name: "url",
              hash: {},
              data: data,
              loc: {
                start: { line: 8, column: 223 },
                end: { line: 8, column: 230 }
              }
            })
          : helper)
      ) +
      '" target="_blank" style="border: solid 2px #0867ec; border-radius: 4px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 16px; font-weight: bold; margin: 0; padding: 12px 24px; text-decoration: none; text-transform: capitalize; background-color: #0867ec; border-color: #0867ec; color: #ffffff;">' +
      ((stack1 = container.invokePartial(
        lookupProperty(partials, "@partial-block"),
        depth0,
        {
          name: "@partial-block",
          data: data,
          helpers: helpers,
          partials: partials,
          decorators: container.decorators
        }
      )) != null
        ? stack1
        : "") +
      "</a></td>\n            </tr>\n          </tbody>\n        </table>\n      </td>\n    </tr>\n  </tbody>\n</table>\n"
    )
  },
  usePartial: true,
  useData: true
})
templates["confirmacao-envio-declaracao"] = template({
  "1": function (container, depth0, helpers, partials, data) {
    var stack1,
      helper,
      alias1 = depth0 != null ? depth0 : container.nullContext || {},
      alias2 = container.hooks.helperMissing,
      alias3 = "function",
      alias4 = container.escapeExpression,
      alias5 = container.lambda,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName]
          }
          return undefined
        }

    return (
      '\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Olá prezado(a),</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n Confirmamos o recebimento da declaração referente ao ano ' +
      alias4(
        ((helper =
          (helper =
            lookupProperty(helpers, "anoReferencia") ||
            (depth0 != null
              ? lookupProperty(depth0, "anoReferencia")
              : depth0)) != null
            ? helper
            : alias2),
        typeof helper === alias3
          ? helper.call(alias1, {
              name: "anoReferencia",
              hash: {},
              data: data,
              loc: {
                start: { line: 7, column: 58 },
                end: { line: 7, column: 75 }
              }
            })
          : helper)
      ) +
      " do museu " +
      alias4(
        alias5(
          (stack1 =
            depth0 != null ? lookupProperty(depth0, "museu") : depth0) != null
            ? lookupProperty(stack1, "nome")
            : stack1,
          depth0
        )
      ) +
      ' na plataforma INBCM. A declaração foi enviado com sucesso e está disponível para consulta no sistema.</p>\n\n<h1\n  style="font-family: Helvetica, sans-serif; font-size: 20px; font-weight: normal; margin: 0; margin-bottom: 16px;text-align: center;font-weight: bold">\n  Dados da Declaração</h1>\n\n<table style="font-family: Helvetica, sans-serif; font-size: 16px; border-collapse: collapse; width: 100%;">\n  <tr>\n    <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Horário de envio:</td>\n    <td style="padding: 8px; border: 1px solid #ddd;">' +
      alias4(
        ((helper =
          (helper =
            lookupProperty(helpers, "horario") ||
            (depth0 != null ? lookupProperty(depth0, "horario") : depth0)) !=
          null
            ? helper
            : alias2),
        typeof helper === alias3
          ? helper.call(alias1, {
              name: "horario",
              hash: {},
              data: data,
              loc: {
                start: { line: 16, column: 54 },
                end: { line: 16, column: 65 }
              }
            })
          : helper)
      ) +
      '</td>\n  </tr>\n  <tr>\n    <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Situação:</td>\n    <td style="padding: 8px; border: 1px solid #ddd;">' +
      alias4(
        alias5(
          (stack1 =
            depth0 != null ? lookupProperty(depth0, "response") : depth0) !=
            null
            ? lookupProperty(stack1, "status")
            : stack1,
          depth0
        )
      ) +
      '</td>\n  </tr>\n  <tr>\n    <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Responsável pelo envio:</td>\n    <td style="padding: 8px; border: 1px solid #ddd;">' +
      alias4(
        alias5(
          (stack1 =
            depth0 != null ? lookupProperty(depth0, "response") : depth0) !=
            null
            ? lookupProperty(stack1, "responsavelEnvioNome")
            : stack1,
          depth0
        )
      ) +
      '</td>\n  <tr>\n    <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Código da declaração:</td>\n    <td style="padding: 8px; border: 1px solid #ddd; word-wrap: break-word; max-width: 200px;">\n      ' +
      alias4(
        alias5(
          (stack1 =
            depth0 != null ? lookupProperty(depth0, "response") : depth0) !=
            null
            ? lookupProperty(stack1, "hashDeclaracao")
            : stack1,
          depth0
        )
      ) +
      '\n    </td>\n  </tr>\n</table>\n\n<h1\n  style="font-family: Helvetica, sans-serif; font-size: 20px; font-weight: normal; margin: 0; margin-top: 16px;margin-bottom: 16px;text-align: center;font-weight: bold">\n  Dados do Museu</h1>\n\n<table style="font-family: Helvetica, sans-serif; font-size: 16px; border-collapse: collapse; width: 100%;">\n  <tr>\n    <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Nome:</td>\n    <td style="padding: 8px; border: 1px solid #ddd;">' +
      alias4(
        alias5(
          (stack1 =
            depth0 != null ? lookupProperty(depth0, "museu") : depth0) != null
            ? lookupProperty(stack1, "nome")
            : stack1,
          depth0
        )
      ) +
      '</td>\n  </tr>\n  <tr>\n    <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Logradouro:</td>\n    <td style="padding: 8px; border: 1px solid #ddd;">' +
      alias4(
        alias5(
          (stack1 =
            (stack1 =
              depth0 != null ? lookupProperty(depth0, "museu") : depth0) != null
              ? lookupProperty(stack1, "endereco")
              : stack1) != null
            ? lookupProperty(stack1, "logradouro")
            : stack1,
          depth0
        )
      ) +
      ", " +
      alias4(
        alias5(
          (stack1 =
            (stack1 =
              depth0 != null ? lookupProperty(depth0, "museu") : depth0) != null
              ? lookupProperty(stack1, "endereco")
              : stack1) != null
            ? lookupProperty(stack1, "numero")
            : stack1,
          depth0
        )
      ) +
      '</td>\n  </tr>\n  <tr>\n    <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Bairro:</td>\n    <td style="padding: 8px; border: 1px solid #ddd;">' +
      alias4(
        alias5(
          (stack1 =
            (stack1 =
              depth0 != null ? lookupProperty(depth0, "museu") : depth0) != null
              ? lookupProperty(stack1, "endereco")
              : stack1) != null
            ? lookupProperty(stack1, "bairro")
            : stack1,
          depth0
        )
      ) +
      '</td>\n  </tr>\n  <tr>\n    <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Municipio:</td>\n    <td style="padding: 8px; border: 1px solid #ddd;">' +
      alias4(
        alias5(
          (stack1 =
            (stack1 =
              depth0 != null ? lookupProperty(depth0, "museu") : depth0) != null
              ? lookupProperty(stack1, "endereco")
              : stack1) != null
            ? lookupProperty(stack1, "municipio")
            : stack1,
          depth0
        )
      ) +
      " - " +
      alias4(
        alias5(
          (stack1 =
            (stack1 =
              depth0 != null ? lookupProperty(depth0, "museu") : depth0) != null
              ? lookupProperty(stack1, "endereco")
              : stack1) != null
            ? lookupProperty(stack1, "uf")
            : stack1,
          depth0
        )
      ) +
      '</td>\n  </tr>\n  <tr>\n    <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Esfera Administrativa:</td>\n    <td style="padding: 8px; border: 1px solid #ddd;">' +
      alias4(
        alias5(
          (stack1 =
            depth0 != null ? lookupProperty(depth0, "museu") : depth0) != null
            ? lookupProperty(stack1, "esferaAdministraiva")
            : stack1,
          depth0
        )
      ) +
      '</td>\n  </tr>\n</table>\n\n<p\n  style="font-family: Helvetica, sans-serif; font-size: 16px;  font-weight: normal; margin: 0; margin-bottom: 16px; margin-top: 16px; margin-top: 16px;">\n  Nossa equipe iniciará o processo de avaliação e você será notificado sobre qualquer atualização ou necessidade de\n  ajustes.\n</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Para acompanhar a situação da sua declaração, acesse o nosso portal:</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  ' +
      alias4(
        ((helper =
          (helper =
            lookupProperty(helpers, "url") ||
            (depth0 != null ? lookupProperty(depth0, "url") : depth0)) != null
            ? helper
            : alias2),
        typeof helper === alias3
          ? helper.call(alias1, {
              name: "url",
              hash: {},
              data: data,
              loc: {
                start: { line: 70, column: 2 },
                end: { line: 70, column: 9 }
              }
            })
          : helper)
      ) +
      '</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Atenciosamente,</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Equipe INBCM</p>\n\n'
    )
  },
  compiler: [8, ">= 4.3.0"],
  main: function (container, depth0, helpers, partials, data) {
    var stack1,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName]
          }
          return undefined
        }

    return (stack1 = container.invokePartial(
      lookupProperty(partials, "layout"),
      depth0,
      {
        name: "layout",
        hash: { title: "[INBCM] Sua declaração foi recebida com sucesso!" },
        fn: container.program(1, data, 0),
        inverse: container.noop,
        data: data,
        helpers: helpers,
        partials: partials,
        decorators: container.decorators
      }
    )) != null
      ? stack1
      : ""
  },
  usePartial: true,
  useData: true
})
templates["confirmacao-retificacao-declaracao"] = template({
  "1": function (container, depth0, helpers, partials, data) {
    var stack1,
      helper,
      alias1 = depth0 != null ? depth0 : container.nullContext || {},
      alias2 = container.hooks.helperMissing,
      alias3 = "function",
      alias4 = container.escapeExpression,
      alias5 = container.lambda,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName]
          }
          return undefined
        }

    return (
      '\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Olá prezado(a),</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n Confirmamos o recebimento da declaração retificadora referente ao ano ' +
      alias4(
        ((helper =
          (helper =
            lookupProperty(helpers, "anoReferencia") ||
            (depth0 != null
              ? lookupProperty(depth0, "anoReferencia")
              : depth0)) != null
            ? helper
            : alias2),
        typeof helper === alias3
          ? helper.call(alias1, {
              name: "anoReferencia",
              hash: {},
              data: data,
              loc: {
                start: { line: 7, column: 71 },
                end: { line: 7, column: 88 }
              }
            })
          : helper)
      ) +
      " do museu " +
      alias4(
        alias5(
          (stack1 =
            depth0 != null ? lookupProperty(depth0, "museu") : depth0) != null
            ? lookupProperty(stack1, "nome")
            : stack1,
          depth0
        )
      ) +
      ' na plataforma INBCM. A declaração retificadora foi enviado com sucesso e está disponível para consulta no sistema.</p>\n\n<h1\n  style="font-family: Helvetica, sans-serif; font-size: 20px; font-weight: normal; margin: 0; margin-bottom: 16px;text-align: center;font-weight: bold">\n  Dados da Declaração Retificadora</h1>\n\n<table style="font-family: Helvetica, sans-serif; font-size: 16px; border-collapse: collapse; width: 100%;">\n  <tr>\n    <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Horário de envio:</td>\n    <td style="padding: 8px; border: 1px solid #ddd;">' +
      alias4(
        ((helper =
          (helper =
            lookupProperty(helpers, "horario") ||
            (depth0 != null ? lookupProperty(depth0, "horario") : depth0)) !=
          null
            ? helper
            : alias2),
        typeof helper === alias3
          ? helper.call(alias1, {
              name: "horario",
              hash: {},
              data: data,
              loc: {
                start: { line: 16, column: 54 },
                end: { line: 16, column: 65 }
              }
            })
          : helper)
      ) +
      '</td>\n  </tr>\n  <tr>\n    <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Situação:</td>\n    <td style="padding: 8px; border: 1px solid #ddd;">' +
      alias4(
        alias5(
          (stack1 =
            depth0 != null ? lookupProperty(depth0, "response") : depth0) !=
            null
            ? lookupProperty(stack1, "status")
            : stack1,
          depth0
        )
      ) +
      '</td>\n  </tr>\n  <tr>\n    <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Responsável pelo envio:</td>\n    <td style="padding: 8px; border: 1px solid #ddd;">' +
      alias4(
        alias5(
          (stack1 =
            depth0 != null ? lookupProperty(depth0, "response") : depth0) !=
            null
            ? lookupProperty(stack1, "responsavelEnvioNome")
            : stack1,
          depth0
        )
      ) +
      '</td>\n  <tr>\n    <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Código da declaração original:</td>\n    <td style="padding: 8px; border: 1px solid #ddd; word-wrap: break-word; max-width: 200px;">\n      ' +
      alias4(
        ((helper =
          (helper =
            lookupProperty(helpers, "hashOriginal") ||
            (depth0 != null
              ? lookupProperty(depth0, "hashOriginal")
              : depth0)) != null
            ? helper
            : alias2),
        typeof helper === alias3
          ? helper.call(alias1, {
              name: "hashOriginal",
              hash: {},
              data: data,
              loc: {
                start: { line: 28, column: 6 },
                end: { line: 28, column: 22 }
              }
            })
          : helper)
      ) +
      '\n    </td>\n  </tr>\n    <tr>\n    <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Código da declaração retificadora:</td>\n    <td style="padding: 8px; border: 1px solid #ddd; word-wrap: break-word; max-width: 200px;">\n      ' +
      alias4(
        alias5(
          (stack1 =
            depth0 != null ? lookupProperty(depth0, "response") : depth0) !=
            null
            ? lookupProperty(stack1, "hashDeclaracao")
            : stack1,
          depth0
        )
      ) +
      '\n    </td>\n  </tr>\n</table>\n\n<h1\n  style="font-family: Helvetica, sans-serif; font-size: 20px; font-weight: normal; margin: 0; margin-top: 16px;margin-bottom: 16px;text-align: center;font-weight: bold">\n  Dados do Museu</h1>\n\n<table style="font-family: Helvetica, sans-serif; font-size: 16px; border-collapse: collapse; width: 100%;">\n  <tr>\n    <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Nome:</td>\n    <td style="padding: 8px; border: 1px solid #ddd;">' +
      alias4(
        alias5(
          (stack1 =
            depth0 != null ? lookupProperty(depth0, "museu") : depth0) != null
            ? lookupProperty(stack1, "nome")
            : stack1,
          depth0
        )
      ) +
      '</td>\n  </tr>\n  <tr>\n    <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Logradouro:</td>\n    <td style="padding: 8px; border: 1px solid #ddd;">' +
      alias4(
        alias5(
          (stack1 =
            (stack1 =
              depth0 != null ? lookupProperty(depth0, "museu") : depth0) != null
              ? lookupProperty(stack1, "endereco")
              : stack1) != null
            ? lookupProperty(stack1, "logradouro")
            : stack1,
          depth0
        )
      ) +
      ", " +
      alias4(
        alias5(
          (stack1 =
            (stack1 =
              depth0 != null ? lookupProperty(depth0, "museu") : depth0) != null
              ? lookupProperty(stack1, "endereco")
              : stack1) != null
            ? lookupProperty(stack1, "numero")
            : stack1,
          depth0
        )
      ) +
      '</td>\n  </tr>\n  <tr>\n    <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Bairro:</td>\n    <td style="padding: 8px; border: 1px solid #ddd;">' +
      alias4(
        alias5(
          (stack1 =
            (stack1 =
              depth0 != null ? lookupProperty(depth0, "museu") : depth0) != null
              ? lookupProperty(stack1, "endereco")
              : stack1) != null
            ? lookupProperty(stack1, "bairro")
            : stack1,
          depth0
        )
      ) +
      '</td>\n  </tr>\n  <tr>\n    <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Municipio:</td>\n    <td style="padding: 8px; border: 1px solid #ddd;">' +
      alias4(
        alias5(
          (stack1 =
            (stack1 =
              depth0 != null ? lookupProperty(depth0, "museu") : depth0) != null
              ? lookupProperty(stack1, "endereco")
              : stack1) != null
            ? lookupProperty(stack1, "municipio")
            : stack1,
          depth0
        )
      ) +
      " - " +
      alias4(
        alias5(
          (stack1 =
            (stack1 =
              depth0 != null ? lookupProperty(depth0, "museu") : depth0) != null
              ? lookupProperty(stack1, "endereco")
              : stack1) != null
            ? lookupProperty(stack1, "uf")
            : stack1,
          depth0
        )
      ) +
      '</td>\n  </tr>\n  <tr>\n    <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Esfera Administrativa:</td>\n    <td style="padding: 8px; border: 1px solid #ddd;">' +
      alias4(
        alias5(
          (stack1 =
            depth0 != null ? lookupProperty(depth0, "museu") : depth0) != null
            ? lookupProperty(stack1, "esferaAdministraiva")
            : stack1,
          depth0
        )
      ) +
      '</td>\n  </tr>\n</table>\n\n<p\n  style="font-family: Helvetica, sans-serif; font-size: 16px;  font-weight: normal; margin: 0; margin-bottom: 16px; margin-top: 16px; margin-top: 16px;">\n  Nossa equipe analisará a nova versão da declaração e você será notificado sobre qualquer atualização ou necessidade de ajustes.\n</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Para acompanhar a situação da sua declaração, acesse o nosso portal:</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  ' +
      alias4(
        ((helper =
          (helper =
            lookupProperty(helpers, "url") ||
            (depth0 != null ? lookupProperty(depth0, "url") : depth0)) != null
            ? helper
            : alias2),
        typeof helper === alias3
          ? helper.call(alias1, {
              name: "url",
              hash: {},
              data: data,
              loc: {
                start: { line: 75, column: 2 },
                end: { line: 75, column: 9 }
              }
            })
          : helper)
      ) +
      '</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Atenciosamente,</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Equipe INBCM</p>\n\n'
    )
  },
  compiler: [8, ">= 4.3.0"],
  main: function (container, depth0, helpers, partials, data) {
    var stack1,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName]
          }
          return undefined
        }

    return (stack1 = container.invokePartial(
      lookupProperty(partials, "layout"),
      depth0,
      {
        name: "layout",
        hash: {
          title: "[INBCM] Sua declaração retificadora foi recebida com sucesso!"
        },
        fn: container.program(1, data, 0),
        inverse: container.noop,
        data: data,
        helpers: helpers,
        partials: partials,
        decorators: container.decorators
      }
    )) != null
      ? stack1
      : ""
  },
  usePartial: true,
  useData: true
})
templates["forgot-password"] = template({
  "1": function (container, depth0, helpers, partials, data) {
    var stack1,
      helper,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName]
          }
          return undefined
        }

    return (
      '  <p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">Hi there ' +
      container.escapeExpression(
        ((helper =
          (helper =
            lookupProperty(helpers, "name") ||
            (depth0 != null ? lookupProperty(depth0, "name") : depth0)) != null
            ? helper
            : container.hooks.helperMissing),
        typeof helper === "function"
          ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
              name: "name",
              hash: {},
              data: data,
              loc: {
                start: { line: 2, column: 128 },
                end: { line: 2, column: 136 }
              }
            })
          : helper)
      ) +
      '</p>\n  <p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">Sometimes you just want to send a simple HTML email with a simple design and clear call to action. This is it.</p>\n  ' +
      ((stack1 = container.invokePartial(
        lookupProperty(partials, "button"),
        depth0,
        {
          name: "button",
          hash: { link: "http://htmlemail.io" },
          fn: container.program(2, data, 0),
          inverse: container.noop,
          data: data,
          helpers: helpers,
          partials: partials,
          decorators: container.decorators
        }
      )) != null
        ? stack1
        : "") +
      '\n  <p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">This is a really simple email template. It\'s sole purpose is to get the recipient to click the button with no distractions.</p>\n'
    )
  },
  "2": function (container, depth0, helpers, partials, data) {
    return "Call To Action"
  },
  compiler: [8, ">= 4.3.0"],
  main: function (container, depth0, helpers, partials, data) {
    var stack1,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName]
          }
          return undefined
        }

    return (stack1 = container.invokePartial(
      lookupProperty(partials, "layout"),
      depth0,
      {
        name: "layout",
        hash: { title: "Recuperação de senha" },
        fn: container.program(1, data, 0),
        inverse: container.noop,
        data: data,
        helpers: helpers,
        partials: partials,
        decorators: container.decorators
      }
    )) != null
      ? stack1
      : ""
  },
  usePartial: true,
  useData: true
})
templates["layout"] = template({
  compiler: [8, ">= 4.3.0"],
  main: function (container, depth0, helpers, partials, data) {
    var stack1,
      helper,
      alias1 = depth0 != null ? depth0 : container.nullContext || {},
      alias2 = container.hooks.helperMissing,
      alias3 = "function",
      alias4 = container.escapeExpression,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName]
          }
          return undefined
        }

    return (
      '<!doctype html>\n<html lang="pt-BR">\n  <head>\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\n    <title>' +
      alias4(
        ((helper =
          (helper =
            lookupProperty(helpers, "title") ||
            (depth0 != null ? lookupProperty(depth0, "title") : depth0)) != null
            ? helper
            : alias2),
        typeof helper === alias3
          ? helper.call(alias1, {
              name: "title",
              hash: {},
              data: data,
              loc: {
                start: { line: 6, column: 11 },
                end: { line: 6, column: 20 }
              }
            })
          : helper)
      ) +
      '</title>\n    <style media="all" type="text/css">\n@media all {\n  .btn-primary table td:hover {\n    background-color: #ec0867 !important;\n  }\n\n  .btn-primary a:hover {\n    background-color: #ec0867 !important;\n    border-color: #ec0867 !important;\n  }\n}\n@media only screen and (max-width: 640px) {\n  .main p,\n.main td,\n.main span {\n    font-size: 16px !important;\n  }\n\n  .wrapper {\n    padding: 8px !important;\n  }\n\n  .content {\n    padding: 0 !important;\n  }\n\n  .container {\n    padding: 0 !important;\n    padding-top: 8px !important;\n    width: 100% !important;\n  }\n\n  .main {\n    border-left-width: 0 !important;\n    border-radius: 0 !important;\n    border-right-width: 0 !important;\n  }\n\n  .btn table {\n    max-width: 100% !important;\n    width: 100% !important;\n  }\n\n  .btn a {\n    font-size: 16px !important;\n    max-width: 100% !important;\n    width: 100% !important;\n  }\n}\n@media all {\n  .ExternalClass {\n    width: 100%;\n  }\n\n  .ExternalClass,\n.ExternalClass p,\n.ExternalClass span,\n.ExternalClass font,\n.ExternalClass td,\n.ExternalClass div {\n    line-height: 100%;\n  }\n\n  .apple-link a {\n    color: inherit !important;\n    font-family: inherit !important;\n    font-size: inherit !important;\n    font-weight: inherit !important;\n    line-height: inherit !important;\n    text-decoration: none !important;\n  }\n\n  #MessageViewBody a {\n    color: inherit;\n    text-decoration: none;\n    font-size: inherit;\n    font-family: inherit;\n    font-weight: inherit;\n    line-height: inherit;\n  }\n}\n</style>\n  </head>\n  <body style="font-family: Helvetica, sans-serif; -webkit-font-smoothing: antialiased; font-size: 16px; line-height: 1.3; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #f4f5f6; margin: 0; padding: 0;">\n    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f4f5f6; width: 100%;" width="100%" bgcolor="#f4f5f6">\n      <tr>\n        <td style="font-family: Helvetica, sans-serif; font-size: 16px; vertical-align: top;" valign="top">&nbsp;</td>\n        <td class="container" style="font-family: Helvetica, sans-serif; font-size: 16px; vertical-align: top; max-width: 600px; padding: 0; padding-top: 24px; width: 600px; margin: 0 auto;" width="600" valign="top">\n          <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 600px; padding: 0;">\n            <img src="' +
      alias4(
        ((helper =
          (helper =
            lookupProperty(helpers, "logoUrl") ||
            (depth0 != null ? lookupProperty(depth0, "logoUrl") : depth0)) !=
          null
            ? helper
            : alias2),
        typeof helper === alias3
          ? helper.call(alias1, {
              name: "logoUrl",
              hash: {},
              data: data,
              loc: {
                start: { line: 96, column: 22 },
                end: { line: 96, column: 33 }
              }
            })
          : helper)
      ) +
      '" alt="Logo do Instituto Brasileito de Museus" width="300" height="69" border="0" style="border:0; outline:none; text-decoration:none; display:block;">\n            <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">' +
      alias4(
        ((helper =
          (helper =
            lookupProperty(helpers, "title") ||
            (depth0 != null ? lookupProperty(depth0, "title") : depth0)) != null
            ? helper
            : alias2),
        typeof helper === alias3
          ? helper.call(alias1, {
              name: "title",
              hash: {},
              data: data,
              loc: {
                start: { line: 97, column: 194 },
                end: { line: 97, column: 203 }
              }
            })
          : helper)
      ) +
      '</span>\n            <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border: 1px solid #eaebed; border-radius: 16px; width: 100%;" width="100%">\n              <tr>\n                <td class="wrapper" style="font-family: Helvetica, sans-serif; font-size: 16px; vertical-align: top; box-sizing: border-box; padding: 24px;" valign="top">\n' +
      ((stack1 = container.invokePartial(
        lookupProperty(partials, "@partial-block"),
        depth0,
        {
          name: "@partial-block",
          data: data,
          indent: "                  ",
          helpers: helpers,
          partials: partials,
          decorators: container.decorators
        }
      )) != null
        ? stack1
        : "") +
      '                </td>\n              </tr>\n            </table>\n            <div class="footer" style="clear: both; padding-top: 24px; text-align: center; width: 100%;">\n              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">\n                <tr>\n                  <td class="content-block" style="font-family: Helvetica, sans-serif; vertical-align: top; color: #9a9ea6; font-size: 16px; text-align: center;" valign="top" align="center">\n                    <span class="apple-link" style="color: #9a9ea6; font-size: 16px; text-align: center;">Instituto Brasileiro de Museus (IBRAM)</span>\n                    <br> Em caso de dúvidas <a href="http://htmlemail.io/blog" style="text-decoration: underline; color: #9a9ea6; font-size: 16px; text-align: center;">entre em contaro conosco</a>.\n                  </td>\n                </tr>\n              </table>\n            </div>\n          </div>\n        </td>\n        <td style="font-family: Helvetica, sans-serif; font-size: 16px; vertical-align: top;" valign="top">&nbsp;</td>\n      </tr>\n    </table>\n  </body>\n</html>\n'
    )
  },
  usePartial: true,
  useData: true
})
templates["novo-usuario-admin"] = template({
  "1": function (container, depth0, helpers, partials, data) {
    var helper,
      alias1 = depth0 != null ? depth0 : container.nullContext || {},
      alias2 = container.hooks.helperMissing,
      alias3 = "function",
      alias4 = container.escapeExpression,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName]
          }
          return undefined
        }

    return (
      '\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Um novo usuário solicitou acesso à plataforma INBCM.</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Por favor, acesse o painel de administração para revisar e aprovar o cadastro.</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Dados do usuário:</p>\n\n<ul style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  <li><strong>Nome:</strong> ' +
      alias4(
        ((helper =
          (helper =
            lookupProperty(helpers, "nome") ||
            (depth0 != null ? lookupProperty(depth0, "nome") : depth0)) != null
            ? helper
            : alias2),
        typeof helper === alias3
          ? helper.call(alias1, {
              name: "nome",
              hash: {},
              data: data,
              loc: {
                start: { line: 13, column: 29 },
                end: { line: 13, column: 37 }
              }
            })
          : helper)
      ) +
      "</li>\n  <li><strong>E-mail:</strong> " +
      alias4(
        ((helper =
          (helper =
            lookupProperty(helpers, "email") ||
            (depth0 != null ? lookupProperty(depth0, "email") : depth0)) != null
            ? helper
            : alias2),
        typeof helper === alias3
          ? helper.call(alias1, {
              name: "email",
              hash: {},
              data: data,
              loc: {
                start: { line: 14, column: 31 },
                end: { line: 14, column: 40 }
              }
            })
          : helper)
      ) +
      "</li>\n  <li><strong>Horário da solicitação:</strong> " +
      alias4(
        ((helper =
          (helper =
            lookupProperty(helpers, "horario") ||
            (depth0 != null ? lookupProperty(depth0, "horario") : depth0)) !=
          null
            ? helper
            : alias2),
        typeof helper === alias3
          ? helper.call(alias1, {
              name: "horario",
              hash: {},
              data: data,
              loc: {
                start: { line: 15, column: 47 },
                end: { line: 15, column: 58 }
              }
            })
          : helper)
      ) +
      '</li>\n</ul>\n<br><hr><br>\n<div style="text-align: center;">\n  <p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n    Acesse o sistema para gerenciar as solicitações de acesso:\n  </p>\n\n  <a href="' +
      alias4(
        ((helper =
          (helper =
            lookupProperty(helpers, "url") ||
            (depth0 != null ? lookupProperty(depth0, "url") : depth0)) != null
            ? helper
            : alias2),
        typeof helper === alias3
          ? helper.call(alias1, {
              name: "url",
              hash: {},
              data: data,
              loc: {
                start: { line: 23, column: 11 },
                end: { line: 23, column: 18 }
              }
            })
          : helper)
      ) +
      '" style="font-family: Helvetica, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; background-color: #1351b4; padding: 10px 24px; border-radius: 30px; display: inline-block;">\n    Gestão de usuários\n  </a>\n</div>\n\n\n\n'
    )
  },
  compiler: [8, ">= 4.3.0"],
  main: function (container, depth0, helpers, partials, data) {
    var stack1,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName]
          }
          return undefined
        }

    return (stack1 = container.invokePartial(
      lookupProperty(partials, "layout"),
      depth0,
      {
        name: "layout",
        hash: { title: "[INBCM] Novo usuário solicitou acesso ao INBCM" },
        fn: container.program(1, data, 0),
        inverse: container.noop,
        data: data,
        helpers: helpers,
        partials: partials,
        decorators: container.decorators
      }
    )) != null
      ? stack1
      : ""
  },
  usePartial: true,
  useData: true
})
templates["reprovacao-cadastro-usuario"] = template({
  "1": function (container, depth0, helpers, partials, data) {
    var helper,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName]
          }
          return undefined
        }

    return (
      '\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Olá, ' +
      container.escapeExpression(
        ((helper =
          (helper =
            lookupProperty(helpers, "nome") ||
            (depth0 != null ? lookupProperty(depth0, "nome") : depth0)) != null
            ? helper
            : container.hooks.helperMissing),
        typeof helper === "function"
          ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
              name: "nome",
              hash: {},
              data: data,
              loc: {
                start: { line: 4, column: 7 },
                end: { line: 4, column: 15 }
              }
            })
          : helper)
      ) +
      ',</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Após análise, sua solicitação de acesso à plataforma INBCM não foi aprovada.</p>\n\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Se precisar de mais informações sobre os motivos da reprovação ou desejar reenviar sua solicitação, entre em contato com nossa equipe.</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Atenciosamente,</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">\n  Equipe INBCM</p>\n\n'
    )
  },
  compiler: [8, ">= 4.3.0"],
  main: function (container, depth0, helpers, partials, data) {
    var stack1,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName]
          }
          return undefined
        }

    return (stack1 = container.invokePartial(
      lookupProperty(partials, "layout"),
      depth0,
      {
        name: "layout",
        hash: { title: "[INBCM] Seu acesso ao INBCM foi não foi aprovado." },
        fn: container.program(1, data, 0),
        inverse: container.noop,
        data: data,
        helpers: helpers,
        partials: partials,
        decorators: container.decorators
      }
    )) != null
      ? stack1
      : ""
  },
  usePartial: true,
  useData: true
})
templates["solicitar-acesso"] = template({
  "1": function (container, depth0, helpers, partials, data) {
    var helper,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName]
          }
          return undefined
        }

    return (
      '<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">Prezado(a) ' +
      container.escapeExpression(
        ((helper =
          (helper =
            lookupProperty(helpers, "name") ||
            (depth0 != null ? lookupProperty(depth0, "name") : depth0)) != null
            ? helper
            : container.hooks.helperMissing),
        typeof helper === "function"
          ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
              name: "name",
              hash: {},
              data: data,
              loc: {
                start: { line: 2, column: 128 },
                end: { line: 2, column: 136 }
              }
            })
          : helper)
      ) +
      ',</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">Agradecemos o seu interesse em acessar o módulo declarante do sistema INBCM.</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">Informamos que a sua solicitação de acesso foi recebida e está em processo de avaliação pela equipe de analistas do IBRAM. Você será notificado(a) assim que a avaliação for concluída.</p>\n\n<p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">Pedimos que aguarde o nosso contato para receber as instruções de acesso.</p>\n'
    )
  },
  compiler: [8, ">= 4.3.0"],
  main: function (container, depth0, helpers, partials, data) {
    var stack1,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName]
          }
          return undefined
        }

    return (stack1 = container.invokePartial(
      lookupProperty(partials, "layout"),
      depth0,
      {
        name: "layout",
        hash: { title: "[INBCM] Solicitação de acesso ao módulo declarante" },
        fn: container.program(1, data, 0),
        inverse: container.noop,
        data: data,
        helpers: helpers,
        partials: partials,
        decorators: container.decorators
      }
    )) != null
      ? stack1
      : ""
  },
  usePartial: true,
  useData: true
})

Handlebars.partials = Handlebars.templates

export default templates
